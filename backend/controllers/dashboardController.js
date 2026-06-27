const Department = require('../models/Department');
const Employee = require('../models/Employee');
const Section = require('../models/Section'); 
const Leave = require('../models/Leave'); // Fixed the path typo here

const getSummary = async (req, res) => {
    try {
        // General Counts
        const employeeCount = await Employee.countDocuments();
        const departmentCount = await Department.countDocuments();
        const sectionCount = await Section.countDocuments(); 
        
        // Leave Counts
        const totalLeaves = await Leave.countDocuments();
        const approvedLeaves = await Leave.countDocuments({ status: "Approved" });
        const pendingLeaves = await Leave.countDocuments({ status: "Pending" });
        const rejectedLeaves = await Leave.countDocuments({ status: "Rejected" });

        res.status(200).json({
            success: true,
            // Wrap these in 'stats' to match AdminSummary.jsx
            stats: {
                totalEmployees: employeeCount,
                totalDepartments: departmentCount,
                totalSections: sectionCount
            },
            // Wrap these in 'leaveStats' to match AdminSummary.jsx
            leaveStats: {
                totalLeaves,
                approvedLeaves,
                pendingLeaves,
                rejectedLeaves
            }
        });
    } catch (error) {
        console.error("Dashboard Summary Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

module.exports = { getSummary };