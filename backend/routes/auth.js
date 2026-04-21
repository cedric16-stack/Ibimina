const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Activity = require('../models/activity');
const { protect, authorize } = require('../middleware/auth');
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'ibimina_secret_2024', { expiresIn: '30d' });
const { v4: uuidv4 } = require('uuid');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, age, gender } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({ name, email, password, role: role || 'admin', phone, age, gender });
    res.status(201).json({ token: generateToken(user._id), user: { ...user._doc, password: undefined } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('fund', 'name');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    await Activity.create({ user: user._id, action: `${user.name} logged in`, type: 'auth', fund: user.fund?._id });
    res.json({ token: generateToken(user._id), user: { _id: user._id, name: user.name, email: user.email, role: user.role, fund: user.fund, photo: user.photo, phone: user.phone, age: user.age, gender: user.gender, balance: user.balance, totalContributed: user.totalContributed } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Check if setup is done
router.get('/setup-status', async (req, res) => {
  const admin = await User.findOne({ role: 'admin' });
  res.json({ setupDone: !!admin });
});

// Create super admin (only works if no admin exists)
router.post('/setup', async (req, res) => {
  try {
    const existing = await User.findOne({ role: 'admin' });
    if (existing) return res.status(403).json({ message: 'Setup already complete.' });
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password, role: 'admin' });
    res.status(201).json({ message: 'Super admin created.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.post('/fund-request', async (req, res) => {
  try {
    const { fundName, email, phone, businessType } = req.body;
    // Store as a pending request — you can use a simple collection
    const FundRequest = require('../models/fundrequest');
    await FundRequest.create({ fundName, email, phone, businessType });
    res.status(201).json({ message: 'Request submitted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get('/fund-requests', protect, authorize('admin'), async (req, res) => {
  try {
    const FundRequest = require('../models/fundrequest');
    const requests = await FundRequest.find().sort('-createdAt');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('fund', 'name totalBalance description');
  res.json(user);
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, age, gender, photo } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, age, gender, photo }, { new: true }).populate('fund', 'name');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get('/president-setup', async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ setupToken: token, role: 'president' });
    if (!user) return res.status(404).json({ message: 'Invalid or expired setup link.' });
    res.json({ name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Complete president setup
router.post('/president-setup', async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({ setupToken: token, role: 'president' });
    if (!user) return res.status(404).json({ message: 'Invalid or expired setup link.' });
    user.password = password;
    user.setupToken = null;
    await user.save();
    res.json({ message: 'Password set successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;