const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
  username: { type: String, required: false }, // may be empty
  subject:  { type: String, required: true },
  message:  { type: String, required: true },
  createdAt:{ type: Date,   default: Date.now },
});

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);
