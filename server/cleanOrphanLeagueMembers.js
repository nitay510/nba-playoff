require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('❌  Missing MONGO_URI in .env');
  process.exit(1);
}

// • הגדרת מודל מינימלית (שם האוסף “users”)
const userSchema = new mongoose.Schema({
  champions: { type: String }
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

(async () => {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✓ Connected');

    // תנאי: champions == null || '' || לא קיים
    const count = await User.countDocuments({
      $or: [
        { champions: { $exists: false } },
        { champions: null },
        { champions: '' }
      ]
    });

    console.log(`\n— ${count} משתמשים עדיין לא בחרו אלופה —\n`);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
})();