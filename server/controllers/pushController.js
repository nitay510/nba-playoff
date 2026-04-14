const User = require('../models/User');

/* GET /api/push/vapid-public-key  (public) */
exports.getVapidPublicKey = (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

/* POST /api/push/subscribe  (auth required) */
exports.subscribe = async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ msg: 'Invalid subscription object' });
    }

    // Add this device subscription if it isn't stored yet
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: {
          pushSubscriptions: { endpoint, keys },
        },
      },
      { new: true },
    );

    res.json({ msg: 'Subscribed' });
  } catch (err) {
    console.error('[Push] subscribe error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

/* DELETE /api/push/unsubscribe  (auth required) */
exports.unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ msg: 'Missing endpoint' });

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { pushSubscriptions: { endpoint } },
    });

    res.json({ msg: 'Unsubscribed' });
  } catch (err) {
    console.error('[Push] unsubscribe error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
