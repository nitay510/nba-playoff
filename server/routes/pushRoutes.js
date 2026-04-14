const express    = require('express');
const router     = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const {
  getVapidPublicKey,
  subscribe,
  unsubscribe,
} = require('../controllers/pushController');

router.get('/vapid-public-key', getVapidPublicKey);
router.post('/subscribe',       requireAuth, subscribe);
router.delete('/unsubscribe',   requireAuth, unsubscribe);

module.exports = router;
