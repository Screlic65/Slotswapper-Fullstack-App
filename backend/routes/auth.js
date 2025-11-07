const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route: POST /api/auth/signup
router.post('/signup', authController.signup);

// Route: POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;