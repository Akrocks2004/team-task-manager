const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get tasks (filtered by project or assigned user)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { projectId, status, priority, assignedTo, overdue, page = 1, limit = 20 } = req.query;
    let query = {};

    // Build query based on role
    if (req.user.role !== 'admin') {
      // Get projects user is member of
      const userProjects = await Project.find({
        $or: [{ owner: req.user._id }, { 'members.user': req.user._id }]
      }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      query.project = { $in: projectIds };
    }

    if (projectId) query.project = projectId;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (overdue === 'true') {
      query.deadline = { $lt: new Date() };
      query.status = { $ne: 'completed' };
    }

    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'title color')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: tasks,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'title color members owner')
      .populate('comments.user', 'name email avatar');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private (Admin)
const createTask = async (req, res) => {
  try {
    const { title, description, priority, deadline, assignedTo, projectId, tags } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isOwner && !isMember && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not a project member' });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      deadline,
      assignedTo,
      tags,
      project: projectId,
      createdBy: req.user._id
    });

    // Add task to project
    project.tasks.push(task._id);
    await project.save();

    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');
    await task.populate('project', 'title color');

    res.status(201).json({ success: true, message: 'Task created', data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    const isProjectOwner = task.project && task.project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isCreator = task.createdBy.toString() === req.user._id.toString();

    if (!isAssigned && !isProjectOwner && !isAdmin && !isCreator) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
    }

    // Members can only update status of their own tasks
    if (!isAdmin && !isProjectOwner && !isCreator && isAssigned) {
      const allowedFields = { status: req.body.status };
      const updated = await Task.findByIdAndUpdate(req.params.id, allowedFields, { new: true, runValidators: true })
        .populate('assignedTo', 'name email avatar')
        .populate('createdBy', 'name email avatar')
        .populate('project', 'title color');
      return res.json({ success: true, message: 'Task status updated', data: updated });
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'title color');

    res.json({ success: true, message: 'Task updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin/Creator)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const isCreator = task.createdBy.toString() === req.user._id.toString();
    if (!isCreator && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this task' });
    }

    // Remove task from project
    await Project.findByIdAndUpdate(task.project, { $pull: { tasks: task._id } });
    await Task.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.comments.push({ user: req.user._id, text });
    await task.save();
    await task.populate('comments.user', 'name email avatar');

    res.json({ success: true, message: 'Comment added', data: task.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, addComment };