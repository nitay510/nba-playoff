const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/set-champion', authController.setChampion);
router.get('/', authController.getAllUsers);
router.post('/logout',   auth.logout);   //  ← NEW
router.get  ('/me',      auth.me);  
router.post('/me',  authController.getMyInfo);
module.exports = router;
