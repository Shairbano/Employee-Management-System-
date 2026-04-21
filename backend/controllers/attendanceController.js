const Attendance=require('../models/Attendance');
const updateAttendance = async (req, res) => {
    try {
        const { attendanceData } = req.body; // Expects { empId: { status, checkIn, checkOut } }
        const today = new Date().toISOString().split('T')[0];

        const Operations = Object.entries(attendanceData).map(([employeeId, data]) => ({
            updateOne: {
                filter: { employeeId, date: today },
                update: { 
                    status: data.status, 
                    checkIn: data.checkIn, 
                    checkOut: data.checkOut, 
                    updatedBy: req.user._id 
                },
                upsert: true
            }
        }));

        await Attendance.bulkWrite(Operations);
        res.status(200).json({ success: true, message: 'Attendance updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
const getAttendanceByDate=async (req,res)=>{
    try{
        const {date}=req.query;
        const records =await Attendance.find({date}).
        populate('employeeId');
        res.status(200).json({success:true,records});
    }
    catch(error){
        res.status(500).json({success:false,message:'Server Error'});
    }
};
// controllers/attendanceController.js - Update getAttendanceHistory
const getAttendanceHistory = async (req, res) => {
    try {
        const { date, startDate, endDate, department, employeeId } = req.query;
        let query = {};

        // Date Filtering
        if (date) {
            query.date = date;
        } else if (startDate && endDate) {
            query.date = { $gte: startDate, $lte: endDate };
        }

        // Search by Employee or Department
        const records = await Attendance.find(query)
            .populate({
                path: 'employeeId',
                match: employeeId ? { _id: employeeId } : {},
                populate: { 
                    path: 'department', 
                    match: department ? { dep_name: new RegExp(department, 'i') } : {} 
                }
            })
            .populate({ path: 'employeeId', populate: { path: 'userId', select: 'name' } });

        // Filter out nulls if populate match failed
        const filteredRecords = records.filter(r => r.employeeId && r.employeeId.department);

        res.status(200).json({ success: true, records: filteredRecords });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
module.exports = { updateAttendance, getAttendanceByDate, getAttendanceHistory };