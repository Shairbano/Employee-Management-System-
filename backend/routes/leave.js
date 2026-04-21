const express = require('express');
const router = express.Router();
const { addLeave, getLeaves, updateLeaveStatus, getLeaveHistory,getLeaveStats } = require('../controllers/leaveController');
const { verifyUser } = require('../middleware/authMiddleware');

router.get('/stats/:id', verifyUser, getLeaveStats); // New route for leave stats
router.post('/add', verifyUser, addLeave);
router.get('/', verifyUser, getLeaves);
router.get('/:id', verifyUser, getLeaveHistory); // This handles the history fetch
router.patch('/:id', verifyUser, updateLeaveStatus);

module.exports = router;