const mongoose = require('mongoose');

const LeagueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, unique: true }, // random or user-generated code
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('League', LeagueSchema);
