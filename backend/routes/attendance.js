const express = require('express');
const router = express.Router();

// CHANGE THIS LINE:
const { verifyUser } = require('../middleware/authMiddleware'); 

const { updateAttendance, getAttendanceByDate, getAttendanceHistory} = require('../controllers/attendanceController');

// UPDATE THE ROUTES TO USE verifyUser:
router.post('/update', verifyUser, updateAttendance);
router.get('/fetch', verifyUser, getAttendanceByDate);
 
router.get('/history', verifyUser, getAttendanceHistory);
 
module.exports = router;