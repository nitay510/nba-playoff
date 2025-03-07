const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required:false },
  password: { type: String, required: true },
  champions: { type: String },
  role: { type: String, default: 'user' },
  points: { type: Number, default: 0 }, // track total points
});

module.exports = mongoose.model('User', UserSchema);
