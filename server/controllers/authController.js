const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const League = require('../models/League');

exports.register = async (req, res) => {
  try {
    const { username, password,email } = req.body;

    // Check if username is taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ msg: 'שם המשתמש כבר קיים' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({ username, password: hashedPassword,email });
    await newUser.save();
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

// server/controllers/authController.js
exports.login = async (req, res) => {
  try {
    let { username, password } = req.body;

    // 1. Clean the username input
    const trimmedUsername = username.trim();

    // 2. Try to find user with exact trimmed username
    let user = await User.findOne({ username: trimmedUsername });

    // 3. If not found, try common variants with spaces accidentally saved
    if (!user) {
      const variants = [
        ` ${trimmedUsername}`,
        `${trimmedUsername} `,
        ` ${trimmedUsername} `
      ];

      user = await User.findOne({ username: { $in: variants } });
    }

    if (!user) {
      return res.status(400).json({ msg: 'שם משתמש או סיסמה שגויים' });
    }

    // 4. Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ msg: 'שם משתמש או סיסמה שגויים' });
    }

    // 5. Create JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    // 6. Send token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ msg: 'התחברת בהצלחה' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'שגיאת שרת' });
  }
};

/**  NEW – verify token and return basic user info  */
exports.me = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      console.log(token);
      return res.status(401).json({ msg: 'Unauthorized' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('username');
    if (!user) return res.status(401).json({ msg: 'Unauthorized' });

    return res.json({ username: user.username });
  } catch {
    console.log("2");
    return res.status(401).json({ msg: 'Unauthorized' });
  }
};

/**  NEW – logout: clear cookie  */
exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  });
  return res.json({ msg: 'התנתקת בהצלחה' });
};
  exports.setChampion = async (req, res) => {
    try {
      const { username, champion } = req.body; // Get username & champion from request
  
      // Find user by username
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(404).json({ msg: 'המשתמש לא נמצא' });
      }
  
      // Update the champion field
      user.champions = champion;
      await user.save();
  
      return res.status(200).json({ msg: 'אלוף עודכן בהצלחה', champion: user.champions });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: 'שגיאה בעדכון האלוף' });
    }
  };

  exports.getAllUsers = async (req, res) => {
    try {
    const users = await User.find().sort({ points: -1 });
    return res.status(200).json(users);
    } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'שגיאה בקבלת המשתמשים' });
    }
    };
    exports.getMyInfo = async (req, res) => {
      try {
        const { username } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
          return res.status(404).json({ msg: 'משתמש לא נמצא' });
        }
        return res.json({
          username: user.username,
          points: user.points,
          champion: user.champions,
        });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'שגיאה בשרת' });
      }
    };
    