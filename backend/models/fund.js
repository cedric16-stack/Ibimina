const mongoose = require('mongoose');

const fundSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  president: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  secretary: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  totalBalance: { type: Number, default: 0 },
  totalContributions: { type: Number, default: 0 },
  totalWithdrawals: { type: Number, default: 0 },
  currency: { type: String, default: 'RWF' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('fund', fundSchema);