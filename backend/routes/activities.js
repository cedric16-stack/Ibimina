const express = require('express');
const activityRouter = express.Router();
const Activity = require('../models/activity');
const { protect, authorize } = require('../middleware/auth');

activityRouter.get('/fund/:fundId', protect, async (req, res) => {
  try {
    const activities = await Activity.find({ fund: req.params.fundId })
      .populate('user', 'name photo')
      .sort('-createdAt').limit(50);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

activityRouter.get('/global', protect, authorize('admin'), async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate('user', 'name photo')
      .populate('fund', 'name')
      .sort('-createdAt').limit(100);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = activityRouter;