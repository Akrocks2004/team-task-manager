const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    const now = new Date();
    let projectQuery = {};
    let taskQuery = {};

    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({
        $or: [{ owner: req.user._id }, { 'members.user': req.user._id }]
      }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      projectQuery = { _id: { $in: projectIds } };
      taskQuery = { project: { $in: projectIds } };
    }

    const [
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      totalUsers
    ] = await Promise.all([
      Project.countDocuments(projectQuery),
      Project.countDocuments({ ...projectQuery, status: 'active' }),
      Task.countDocuments(taskQuery),
      Task.countDocuments({ ...taskQuery, status: 'completed' }),
      Task.countDocuments({ ...taskQuery, status: 'in-progress' }),
      Task.countDocuments({ ...taskQuery, status: 'todo' }),
      Task.countDocuments({ ...taskQuery, status: { $ne: 'completed' }, deadline: { $lt: now } }),
      req.user.role === 'admin' ? User.countDocuments() : null
    ]);

    // Recent tasks
    const recentTasks = await Task.find(taskQuery)
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'title color')
      .sort({ updatedAt: -1 })
      .limit(5);

    // Priority breakdown
    const priorityBreakdown = await Task.aggregate([
      { $match: taskQuery },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Status breakdown for chart
    const statusBreakdown = [
      { status: 'todo', count: todoTasks, label: 'To Do' },
      { status: 'in-progress', count: inProgressTasks, label: 'In Progress' },
      { status: 'completed', count: completedTasks, label: 'Completed' },
      { status: 'overdue', count: overdueTasks, label: 'Overdue' }
    ];

    // Monthly task completion (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Task.aggregate([
      { $match: { ...taskQuery, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Recent projects
    const recentProjects = await Project.find(projectQuery)
      .populate('owner', 'name email avatar')
      .populate({ path: 'tasks', select: 'status' })
      .sort({ updatedAt: -1 })
      .limit(4);

    res.json({
      success: true,
      data: {
        stats: {
          totalProjects,
          activeProjects,
          totalTasks,
          completedTasks,
          inProgressTasks,
          todoTasks,
          overdueTasks,
          totalUsers: totalUsers || undefined,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        },
        statusBreakdown,
        priorityBreakdown,
        monthlyData,
        recentTasks,
        recentProjects
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStats };