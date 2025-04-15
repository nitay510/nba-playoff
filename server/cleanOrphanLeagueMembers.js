/* scripts/cleanOrphanLeagueMembers.js */
require('dotenv').config();
const mongoose = require('mongoose');

const User   = require('./models/User');
const League = require('./models/League');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const leagues = await League.find();
  let totalRemoved = 0;

  for (const lg of leagues) {
    /* keep only members whose _id exists in users collection */
    const validIds = await User.find({ _id: { $in: lg.members } }).distinct('_id');
    const before   = lg.members.length;
    lg.members     = validIds;
    const removed  = before - validIds.length;
    if (removed) {
      await lg.save();
      console.log(`League "${lg.name}" – removed ${removed} orphan member(s)`);
      totalRemoved += removed;
    }
  }

  console.log(`\nDone. Total removed: ${totalRemoved}`);
  await mongoose.disconnect();
  process.exit();
})();
