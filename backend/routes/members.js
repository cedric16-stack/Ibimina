const express = require('express');
const memberRouter = express.Router();
const User = require('../models/user');
const Activity = require('../models/activity');
const { protect, authorize } = require('../middleware/auth');

memberRouter.get('/fund/:fundId', protect, async (req, res) => {
  try {
    const members = await User.find({ fund: req.params.fundId, role: { $in: ['member', 'secretary'] } }).select('-password');
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

memberRouter.get('/:id', protect, async (req, res) => {
  try {
    const member = await User.findById(req.params.id).select('-password').populate('fund', 'name');
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

memberRouter.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('fund', 'name');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
memberRouter.post('/create', protect, authorize('admin', 'president'), async (req, res) => {
  try {
    const { name, email, password, phone, age, gender, role, fundId } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password: password || 'ibimina123', phone, age, gender, role: role || 'member', fund: fundId });
    await Activity.create({ fund: fundId, user: req.user._id, action: `New ${role || 'member'} ${name} created`, type: 'member' });
    res.status(201).json({ ...user._doc, password: undefined });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = memberRouter;