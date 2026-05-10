const express = require('express');

const router = express.Router();


// GET ALL TASKS
router.get('/', async (req, res) => {

  try {

    res.json({
      message: 'Tasks route working'
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// CREATE TASK
router.post('/', async (req, res) => {

  try {

    res.json({
      message: 'Task created successfully'
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


module.exports = router;