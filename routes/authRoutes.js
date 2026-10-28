const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Route: POST /auth/register - Register a new user
router.post('/register', register);

// Route: POST /auth/login - Log in and receive a JWT token
router.post('/login', login);

// Route: GET /auth/me - Get currently logged-in user details
router.get('/me', protect, getMe);

module.exports = router;
