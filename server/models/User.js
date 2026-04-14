const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username:          { type: String, required: true, unique: true },
  email:             { type: String, sparse: true },   // sparse so existing users without email don't conflict
  password:          { type: String, required: true },
  champions:         { type: String },
  role:              { type: String, default: 'user' },
  points:            { type: Number, default: 0 },
  // Password-reset
  resetToken:        { type: String },
  resetTokenExpiry:  { type: Date },
  // Web Push subscriptions (one per device/browser)
  pushSubscriptions: [{
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth:   { type: String, required: true },
    },
  }],
});

module.exports = mongoose.model('User', UserSchema);
