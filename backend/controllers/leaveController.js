const Leave = require('../models/Leave');

// 1. Employee: Submit a Leave Request
const addLeave = async (req, res) => {
    try {
        const { employeeId, leaveType, startDate, endDate, reason } = req.body;
        
        if(!employeeId) {
            return res.status(400).json({success: false, error: "Employee ID is required"});
        }

        const newLeave = new Leave({
            employeeId, leaveType, startDate, endDate, reason
        });
        await newLeave.save();
        res.status(200).json({ success: true, message: "Leave applied successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2. Admin: Get all leaves to approve/reject
const getLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find().populate({
            path: 'employeeId',
            populate: [
                { path: 'userId', select: 'name' }, 
                { path: 'department', select: 'dep_name' }
            ]
        }).populate('actionBy', 'name'); // NEW: Populate admin who took action
        res.status(200).json({ success: true, leaves });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error fetching leaves" });
    }
};

// 3. Admin: Update Leave Status with Reason
const updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminReason } = req.body; // NEW: Accept adminReason
        
        // Validate that adminReason is provided
        if (!adminReason || adminReason.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                error: "Please provide a reason for this decision" 
            });
        }

        await Leave.findByIdAndUpdate(id, { 
            status,
            adminReason, // NEW: Save admin's reason
            actionBy: req.user._id, // NEW: Save which admin took action
            actionDate: new Date() // NEW: Save when action was taken
        });
        
        res.status(200).json({ success: true, message: `Leave ${status}` });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to update leave" });
    }
};
 
// 4. Get Leave History for Employee
const getLeaveHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const leaves = await Leave.find({ employeeId: id })
            .populate('actionBy', 'name') // NEW: Populate admin name
            .sort({ createdAt: -1 }); // Sort by newest first
        return res.status(200).json({ success: true, leaves });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server error fetching history" });
    }
};

// 5. Get Leave Stats for Employee
const getLeaveStats = async (req, res) => {
    try {
        const { id } = req.params;
        const leaves = await Leave.find({ employeeId: id });

        const stats = {
            pending: leaves.filter(l => l.status === 'Pending').length,
            approved: leaves.filter(l => l.status === 'Approved').length,
            rejected: leaves.filter(l => l.status === 'Rejected').length,
            total: leaves.length
        };

        return res.status(200).json({ success: true, stats });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch stats" });
    }
};

module.exports = { addLeave, getLeaves, updateLeaveStatus, getLeaveHistory, getLeaveStats };