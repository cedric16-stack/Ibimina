const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction');
const Fund = require('../models/fund');
const User = require('../models/user');
const Activity = require('../models/activity');
const { protect, authorize } = require('../middleware/auth');


router.get('/debug', async (req, res) => {
  try {
    const Transaction = require('../models/transaction');
    const all = await Transaction.find({});
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get('/fund/:fundId', protect, async (req, res) => {
  try {
    console.log('Fetching transactions for fund:', req.params.fundId);
    const transactions = await Transaction.find({ fund: req.params.fundId })
      .populate('member', 'name email photo')
      .populate('approvedBy', 'name')
      .sort('-createdAt');
    console.log('Found transactions:', transactions.length);
    res.json(transactions);
  } catch (err) {
    console.error('Transaction error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const transactions = await Transaction.find({ member: req.user._id, fund: user.fund })
      .populate('approvedBy', 'name')
      .sort('-createdAt');
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/contribute', protect, async (req, res) => {
  try {
    const { amount, method } = req.body;
    const user = await User.findById(req.user._id);
    if (!user.fund) return res.status(400).json({ message: 'Not in a fund' });
    const ref = `IBI-${Date.now().toString(36).toUpperCase()}`;
    const transaction = await Transaction.create({
      fund: user.fund, member: req.user._id, type: 'contribution',
      amount, method, status: 'approved', reference: ref,
      secretaryApproved: true, presidentApproved: true
    });
    await Fund.findByIdAndUpdate(user.fund, { $inc: { totalBalance: amount, totalContributions: amount } });
    await User.findByIdAndUpdate(req.user._id, { $inc: { balance: amount, totalContributed: amount } });
    await Activity.create({ fund: user.fund, user: req.user._id, action: `${req.user.name} contributed ${amount} RWF via ${method}`, type: 'transaction', details: `Ref: ${ref}` });
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/withdraw-request', protect, async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const user = await User.findById(req.user._id);
    if (!user.fund) return res.status(400).json({ message: 'Not in a fund' });
    if (user.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });
    const ref = `WDR-${Date.now().toString(36).toUpperCase()}`;
    const transaction = await Transaction.create({
      fund: user.fund, member: req.user._id, type: 'withdrawal',
      amount, reason, status: 'pending', reference: ref
    });
    await Activity.create({ fund: user.fund, user: req.user._id, action: `${req.user.name} requested withdrawal of ${amount} RWF`, type: 'transaction', details: reason });
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.post('/loan-request', protect, async (req, res) => {
  try {
    const { amount, reason, loanDuration } = req.body;
    const user = await User.findById(req.user._id);
    if (!user.fund) return res.status(400).json({ message: 'Not in a fund' });
    if (user.totalContributed <= 0) return res.status(400).json({ message: 'You must have active savings to be eligible for a loan' });

    const fund = await Fund.findById(user.fund);
    const maxLoanPercent = fund?.maxLoanPercent || 75;
    const interestRate = fund?.interestRate || 10;
    const maxLoanDuration = fund?.maxLoanDuration || 6;
    const maxLoan = user.totalContributed * (maxLoanPercent / 100);

    if (amount > maxLoan) return res.status(400).json({ message: `Maximum loan is ${maxLoanPercent}% of your savings: ${maxLoan.toLocaleString()} RWF` });
    if (loanDuration > maxLoanDuration) return res.status(400).json({ message: `Maximum loan duration is ${maxLoanDuration} months` });

    const interestAmount = (amount * interestRate) / 100;
    const totalRepayable = amount + interestAmount;
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + loanDuration);

    const ref = `LN-${Date.now().toString(36).toUpperCase()}`;
    const transaction = await Transaction.create({
      fund: user.fund, member: req.user._id, type: 'loan',
      amount, reason, status: 'pending', reference: ref,
      loanDuration, interestRate, totalRepayable, dueDate
    });

    await Activity.create({
      fund: user.fund, user: req.user._id,
      action: `${req.user.name} requested a loan of ${amount} RWF for ${loanDuration} months`,
      type: 'transaction', details: `Interest: ${interestRate}% | Total repayable: ${totalRepayable} RWF`
    });

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.put('/:id/secretary-approve', protect, authorize('secretary'), async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('member', 'name');
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    transaction.secretaryApproved = true;
    await transaction.save();
    await Activity.create({ fund: transaction.fund, user: req.user._id, action: `Secretary approved withdrawal request by ${transaction.member.name}`, type: 'transaction' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/president-action', protect, authorize('president'), async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;
    const transaction = await Transaction.findById(req.params.id).populate('member', 'name balance');
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    transaction.presidentApproved = action === 'approve';
    transaction.status = action === 'approve' ? 'approved' : 'rejected';
    transaction.approvedBy = req.user._id;
    transaction.rejectionReason = rejectionReason || '';
    transaction.updatedAt = Date.now();
    await transaction.save();
    if (action === 'approve') {
      await Fund.findByIdAndUpdate(transaction.fund, { $inc: { totalBalance: -transaction.amount, totalWithdrawals: transaction.amount } });
      await User.findByIdAndUpdate(transaction.member._id, { $inc: { balance: -transaction.amount } });
    }
    await Activity.create({ fund: transaction.fund, user: req.user._id, action: `President ${action === 'approve' ? 'approved' : 'rejected'} withdrawal of ${transaction.amount} RWF for ${transaction.member.name}`, type: 'transaction' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/record-payment', protect, authorize('secretary'), async (req, res) => {
  try {
    const { memberId, amount, method, note } = req.body;
    const user = await User.findById(req.user._id);
    const member = await User.findById(memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    const ref = `REC-${Date.now().toString(36).toUpperCase()}`;
    const transaction = await Transaction.create({
      fund: user.fund, member: memberId, type: 'contribution',
      amount, method, status: 'approved', reference: ref,
      secretaryApproved: true, presidentApproved: true, reason: note || 'Recorded by secretary'
    });
    await Fund.findByIdAndUpdate(user.fund, { $inc: { totalBalance: amount, totalContributions: amount } });
    await User.findByIdAndUpdate(memberId, { $inc: { balance: amount, totalContributed: amount } });
    await Activity.create({ fund: user.fund, user: req.user._id, action: `Secretary recorded payment of ${amount} RWF for ${member.name}`, type: 'transaction', details: `Ref: ${ref} | ${method}` });
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;