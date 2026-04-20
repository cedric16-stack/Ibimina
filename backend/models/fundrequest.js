const mongoose = require('mongoose');

const fundRequestSchema = new mongoose.Schema({
  fundName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  businessType: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('fundrequest', fundRequestSchema);