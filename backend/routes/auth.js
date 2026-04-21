const express = require('express');
const router = express.Router();
const { login, verify, checkEmail, resetPasswordDirect } = require('../controllers/authController');
const { verifyUser } = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/verify', verifyUser, verify);

// Direct Password Reset Routes
router.post('/check-email', checkEmail);
router.post('/reset-password-direct', resetPasswordDirect);

module.exports = router;