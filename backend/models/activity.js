const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  fund: { type: mongoose.Schema.Types.ObjectId, ref: 'fund' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  action: { type: String, required: true },
  details: { type: String, default: '' },
  type: { type: String, enum: ['fund', 'member', 'transaction', 'auth', 'system'], default: 'system' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('activity', activitySchema);