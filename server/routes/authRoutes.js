const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register',        authController.register);
router.post('/login',           authController.login);
router.post('/logout',          authController.logout);
router.post('/set-champion',    authController.setChampion);
router.get ('/',                authController.getAllUsers);
router.get ('/me',              authController.me);
router.post('/me',              authController.getMyInfo);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password',  authController.resetPassword);

module.exports = router;
