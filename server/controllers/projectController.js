const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get all projects (admin) or user projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const { search, status, priority, page = 1, limit = 10 } = req.query;
    let query = {};

    if (req.user.role !== 'admin') {
      query = {
        $or: [
          { owner: req.user._id },
          { 'members.user': req.user._id }
        ]
      };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate({
        path: 'tasks',
        select: 'status deadline'
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: projects,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role')
      .populate({
        path: 'tasks',
        populate: { path: 'assignedTo createdBy', select: 'name email avatar' }
      });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check access
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m.user._id.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isMember && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private (Admin)
const createProject = async (req, res) => {
  try {
    const { title, description, deadline, priority, color, memberIds } = req.body;

    const project = await Project.create({
      title,
      description,
      deadline,
      priority,
      color,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    // Add members if provided
    if (memberIds && memberIds.length > 0) {
      for (const userId of memberIds) {
        const memberExists = project.members.some(m => m.user.toString() === userId);
        if (!memberExists) {
          project.members.push({ user: userId, role: 'member' });
        }
      }
      await project.save();
    }

    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    res.status(201).json({ success: true, message: 'Project created successfully', data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin/Owner)
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this project' });
    }

    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    }).populate('owner', 'name email avatar').populate('members.user', 'name email avatar');

    res.json({ success: true, message: 'Project updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin/Owner)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this project' });
    }

    // Delete all tasks in project
    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Project and all its tasks deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (Admin/Owner)
const addMember = async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const alreadyMember = project.members.some(m => m.user.toString() === userId);
    if (alreadyMember) return res.status(400).json({ success: false, message: 'User is already a member' });

    project.members.push({ user: userId, role });
    await project.save();
    await project.populate('members.user', 'name email avatar');

    res.json({ success: true, message: 'Member added', data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (Admin/Owner)
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();

    res.json({ success: true, message: 'Member removed', data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject, addMember, removeMember };