const mongoose = require('mongoose');
const attendanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'On Leave', "Half-Day", "Late"],
        required: true
    },
    checkIn: { type: String },  // Store as HH:mm
    checkOut: { type: String }, // Store as HH:mm
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);