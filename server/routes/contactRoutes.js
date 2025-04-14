const router  = require('express').Router();
const contact = require('../controllers/contactController');

router.post('/', contact.saveMessage); // POST /api/contact
module.exports = router;
