const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  fund: { type: mongoose.Schema.Types.ObjectId, ref: 'fund', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  type: { type: String, enum: ['contribution', 'withdrawal'], required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['MTN Mobile Money', 'BK Bank', 'Equity Bank', 'Cash'], default: 'Cash' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reason: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  secretaryApproved: { type: Boolean, default: false },
  presidentApproved: { type: Boolean, default: false },
  reference: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('transaction', transactionSchema);