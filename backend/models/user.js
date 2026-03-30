const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'president', 'secretary', 'member'], default: 'member' },
  fund: { type: mongoose.Schema.Types.ObjectId, ref: 'fund' },
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  photo: { type: String, default: '' },
  balance: { type: Number, default: 0 },
  totalContributed: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('user', userSchema);