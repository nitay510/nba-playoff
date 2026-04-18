const User    = require('../models/User');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const League  = require('../models/League');
const { sendPasswordResetEmail } = require('../services/emailService');

const COOKIE_OPTS = () => ({
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
});

/* ── register ── */
exports.register = async (req, res) => {
  try {
    const { username: rawUsername, password, email: rawEmail } = req.body;
    const username = (rawUsername || '').trim();
    const email    = (rawEmail || '').trim().toLowerCase();

    if (!username) return res.status(400).json({ msg: 'שם משתמש נדרש' });
    if (!email || !email.includes('@')) return res.status(400).json({ msg: 'אימייל תקין נדרש' });
    if (!password || password.length < 6) return res.status(400).json({ msg: 'סיסמה חייבת להכיל לפחות 6 תווים' });

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ msg: 'שם המשתמש כבר קיים' });

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ msg: 'האימייל כבר רשום במערכת' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, email });
    await newUser.save();

    // Auto-join the Israel league
    const israelLeague = await League.findOne({ name: 'ישראל' });
    if (israelLeague && !israelLeague.members.includes(newUser._id)) {
      israelLeague.members.push(newUser._id);
      await israelLeague.save();
    }

    return res.status(201).json({ msg: 'המשתמש נוצר בהצלחה' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'שגיאה בשרת' });
  }
};

/* ── login ── */
exports.login = async (req, res) => {
  try {
    let { username, password } = req.body;
    username = (username || '').trim();
    password = password || '';

    let user = await User.findOne({ username });
    if (!user) user = await User.findOne({ email: username.toLowerCase() });
    if (!user) return res.status(400).json({ msg: 'שם משתמש או סיסמה שגויים' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: 'שם משתמש או סיסמה שגויים' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '10d' });

    res.cookie('token', token, {
      ...COOKIE_OPTS(),
      maxAge: 10 * 24 * 60 * 60 * 1000,
    });

    return res.json({ msg: 'התחברת בהצלחה', username: user.username });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'שגיאה בשרת' });
  }
};

/* ── me (GET) – verify cookie ── */
exports.me = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ msg: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.userId).select('username');
    if (!user) return res.status(401).json({ msg: 'Unauthorized' });
    return res.json({ username: user.username });
  } catch {
    return res.status(401).json({ msg: 'Unauthorized' });
  }
};

/* ── getMyInfo (POST) ── */
exports.getMyInfo = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ msg: 'משתמש לא נמצא' });
    return res.json({ username: user.username, points: user.points, champion: user.champions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'שגיאה בשרת' });
  }
};

/* ── logout ── */
exports.logout = (req, res) => {
  res.clearCookie('token', COOKIE_OPTS());
  return res.json({ msg: 'התנתקת בהצלחה' });
};

/* ── setChampion ── */
// Existing users can change their pick until April 19 at 20:30 Israel time (UTC+3)
const CHANGE_DEADLINE        = new Date('2026-04-19T17:30:00Z');
// New users (no previous pick) can make their first pick until April 20 end of day Israel time
const NEW_SELECTION_DEADLINE = new Date('2026-04-20T20:59:00Z');

exports.setChampion = async (req, res) => {
  try {
    const { username, champion } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ msg: 'המשתמש לא נמצא' });

    const now = new Date();
    if (user.champions) {
      // Existing pick – change deadline is April 19 20:30
      if (now > CHANGE_DEADLINE) {
        return res.status(403).json({ msg: 'המועד האחרון לשינוי האלופה עבר (19 באפריל, 20:30)' });
      }
    } else {
      // First-time pick – allowed until April 20
      if (now > NEW_SELECTION_DEADLINE) {
        return res.status(403).json({ msg: 'המועד האחרון לבחירת אלופה עבר (20 באפריל)' });
      }
    }

    user.champions = champion;
    await user.save();
    return res.status(200).json({ msg: 'אלוף עודכן בהצלחה', champion: user.champions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'שגיאה בעדכון האלוף' });
  }
};

/* ── getAllUsers ── */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ points: -1 });
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'שגיאה בקבלת המשתמשים' });
  }
};

/* ── forgotPassword ── */
exports.forgotPassword = async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ msg: 'אימייל נדרש' });

    const user = await User.findOne({ email });

    // Always respond with success to prevent email enumeration
    if (!user) {
      return res.json({ msg: 'אם האימייל קיים במערכת, נשלח אליו קישור לאיפוס סיסמה' });
    }

    const token  = crypto.randomBytes(32).toString('hex');
    user.resetToken       = token;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await sendPasswordResetEmail(email, token);

    return res.json({ msg: 'אם האימייל קיים במערכת, נשלח אליו קישור לאיפוס סיסמה' });
  } catch (error) {
    console.error('[forgotPassword] ERROR:', error.message);
    console.error('[forgotPassword] STACK:', error.stack);
    return res.status(500).json({ msg: 'שגיאה בשליחת המייל', debug: error.message });
  }
};

/* ── resetPassword ── */
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ msg: 'נתונים חסרים' });
    if (password.length < 6) return res.status(400).json({ msg: 'סיסמה חייבת להכיל לפחות 6 תווים' });

    const user = await User.findOne({
      resetToken:       token,
      resetTokenExpiry: { $gt: new Date() }, // not expired
    });

    if (!user) return res.status(400).json({ msg: 'הקישור לא תקין או פג תוקפו' });

    user.password        = await bcrypt.hash(password, 10);
    user.resetToken      = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return res.json({ msg: 'הסיסמה עודכנה בהצלחה. ניתן להתחבר עכשיו.' });
  } catch (error) {
    console.error('[resetPassword]', error);
    return res.status(500).json({ msg: 'שגיאה בשרת' });
  }
};
