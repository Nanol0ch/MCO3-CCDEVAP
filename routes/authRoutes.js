const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/register', authController.getRegisterPage);
router.post('/register', authController.registerUser);

router.get('/login', authController.getLoginPage);
router.post('/login', authController.loginUser);

router.get('/logout', authController.logoutUser);

router.get('/', userController.getHomePage);
router.get('/profile', isAuthenticated, userController.getProfile);
router.post('/profile', isAuthenticated, userController.updateProfile);

module.exports = router;
