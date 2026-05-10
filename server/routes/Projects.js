const express = require('express');
const router = express.Router();

const Project = require('../models/Project');

const auth = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

router.post(
  '/',
  auth,
  roleMiddleware('admin'),
  async (req, res) => {

    try {

      const { title, description, deadline } = req.body;

      const newProject = new Project({
        title,
        description,
        deadline
      });

      await newProject.save();

      res.status(201).json({
        message: 'Project created successfully',
        project: newProject
      });

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

  }
);

router.get('/', async (req, res) => {

  try {

    const projects = await Project.find();

    res.json(projects);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

module.exports = router;