/* scripts/trimUsernames.js */
require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const users = await User.find();
  let trimmedCount = 0;

  for (const user of users) {
    const trimmedUsername = user.username.trim();
    if (trimmedUsername !== user.username) {
      console.log(`Trimming username "${user.username}" → "${trimmedUsername}"`);
      user.username = trimmedUsername;
      await user.save();
      trimmedCount++;
    }
  }

  console.log(`\nDone. Total usernames trimmed: ${trimmedCount}`);
  await mongoose.disconnect();
  process.exit();
})();
