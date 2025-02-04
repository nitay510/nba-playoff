const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username is taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ msg: 'שם המשתמש כבר קיים' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({ msg: 'המשתמש נוצר בהצלחה' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'שגיאה בשרת' });
  }
};

// server/controllers/authController.js
exports.login = async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // 1. Find the user by username
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ msg: 'שם משתמש או סיסמה שגויים' });
      }
  
      // 2. Compare the given password with the user's hashed password
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json({ msg: 'שם משתמש או סיסמה שגויים' });
      }
  
      // 3. Create a JWT token (valid for 1 day)
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });
  
      // 4. Set the token in an httpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: false, // Set to true if you're using HTTPS
        sameSite: 'lax', // or 'strict'
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
  
      // 5. Return success and the username so the client can store it
      return res.json({ msg: 'התחברת בהצלחה', username: user.username });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: 'שגיאה בשרת' });
    }
  };

  exports.getAllUsers = async (req, res) => {
    try {
    const users = await User.find().sort({ points: -1 });
    console.log(users)
    return res.status(200).json(users);
    } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'שגיאה בקבלת המשתמשים' });
    }
    };
    
    