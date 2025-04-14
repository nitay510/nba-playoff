const ContactMessage = require('../models/ContactMessage');

exports.saveMessage = async (req, res) => {
  try {
    const { username = '', subject, message } = req.body;

    if (!subject || !message)
      return res.status(400).json({ msg: 'Missing fields' });

    await ContactMessage.create({ username, subject, message });
    return res.json({ msg: 'saved' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'server error' });
  }
};
