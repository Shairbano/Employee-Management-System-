const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee',
    required: true 
  },
  leaveType: { 
    type: String, 
    enum: ['Sick Leave', 'Casual Leave', 'Annual Leave'], 
    required: true 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  adminReason: { type: String, default: '' }, // NEW: Admin's reason for approval/rejection
  actionBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }, // NEW: Track which admin took action
  actionDate: { type: Date } // NEW: When action was taken
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);