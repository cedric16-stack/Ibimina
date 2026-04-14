const express = require('express');
const router = express.Router();
const Fund = require('../models/fund');
const User = require('../models/user');
const Activity = require('../models/activity');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, presidentEmail, presidentName, presidentPhone, presidentPassword } = req.body;
    let president = null;
    
    if (presidentEmail) {
      president = await User.findOne({ email: presidentEmail });
      if (!president) {
        president = await User.create({
          name: presidentName || 'President',
          email: presidentEmail,
          password: presidentPassword || 'ibimina123',
          phone: presidentPhone || '',
          role: 'president'
        });
      } else {
        await User.findByIdAndUpdate(president._id, { role: 'president' });
      }
    }

    const fund = await Fund.create({ name, president: president?._id });
    if (president) {
      await User.findByIdAndUpdate(president._id, { fund: fund._id });
    }
    await Activity.create({ fund: fund._id, user: req.user._id, action: `Fund "${name}" created`, type: 'fund', details: president ? `President: ${president.name}` : '' });
    const populated = await Fund.findById(fund._id).populate('president', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const funds = await Fund.find().populate('president', 'name email').populate('secretary', 'name email').sort('-createdAt');
    res.json(funds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.fund) return res.status(404).json({ message: 'No fund assigned' });
    const fund = await Fund.findById(user.fund)
      .populate('president', 'name email photo')
      .populate('secretary', 'name email photo')
      .populate('members', 'name email photo totalContributed balance');
    res.json(fund);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/terms', protect, authorize('president'), async (req, res) => {
  try {
    const { termsAndConditions, loanDefaultRules } = req.body;
    const fund = await Fund.findByIdAndUpdate(
      req.params.id,
      { termsAndConditions, loanDefaultRules },
      { new: true }
    );
    await Activity.create({ fund: fund._id, user: req.user._id, action: 'Fund terms and conditions updated', type: 'fund' });
    res.json(fund);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.put('/:id/description', protect, authorize('president'), async (req, res) => {
  try {
    const fund = await Fund.findByIdAndUpdate(
      req.params.id, 
      { description: req.body.description }, 
      { new: true }
    );
    await Activity.create({ 
      fund: fund._id, 
      user: req.user._id, 
      action: 'Fund description updated', 
      type: 'fund' 
    });
    res.json(fund);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/add-user', protect, authorize('president'), async (req, res) => {
  try {
    const { email, role } = req.body;
    const fund = await Fund.findById(req.params.id);
    if (!fund) return res.status(404).json({ message: 'Fund not found' });
    let user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found. They must register first.' });
    if (role === 'secretary') {
      if (fund.secretary) {
        await User.findByIdAndUpdate(fund.secretary, { role: 'member' });
      }
      fund.secretary = user._id;
      await user.updateOne({ role: 'secretary', fund: fund._id });
    } else {
      if (!fund.members.includes(user._id)) fund.members.push(user._id);
      await user.updateOne({ role: 'member', fund: fund._id });
    }
    await fund.save();
    await Activity.create({ fund: fund._id, user: req.user._id, action: `${user.name} added as ${role}`, type: 'member' });
    res.json({ message: 'User added successfully', user: { _id: user._id, name: user.name, email: user.email, role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
             
router.delete('/:id/remove-user/:userId', protect, authorize('president'), async (req, res) => {
  try {
    const fund = await Fund.findById(req.params.id);
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    fund.members = fund.members.filter(m => m.toString() !== req.params.userId);
    if (fund.secretary?.toString() === req.params.userId) fund.secretary = null;
    await fund.save();
    await User.findByIdAndUpdate(req.params.userId, { role: 'member', fund: null });
    await Activity.create({ fund: fund._id, user: req.user._id, action: `${user.name} removed from fund`, type: 'member' });
    res.json({ message: 'User removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const fund = await Fund.findById(req.params.id);
    if (!fund) return res.status(404).json({ message: 'Fund not found' });
    await User.updateMany({ fund: fund._id }, { fund: null, role: 'member' });
    await fund.deleteOne();
    res.json({ message: 'Fund deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;