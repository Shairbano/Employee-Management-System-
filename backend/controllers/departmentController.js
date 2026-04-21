const Department = require('../models/Department');
const User = require('../models/user');
const Section = require('../models/Section');
const Employee = require('../models/Employee');

const getDepartments = async (req, res) => {
    try {
        const departments = await Department.aggregate([
            {
                $lookup:
                 {
                    from: 'employees', // LOOKUP FROM EMPLOYEES COLLECTION
                    localField: '_id',
                    foreignField: 'department',
                    as: 'employees'
                }
            },
            {
                $lookup: {
                    from: 'sections', // MUST match  MongoDB collection name for sections
                    localField: '_id',
                    foreignField: 'department',
                    as: 'sections'
                }
            },
            {
                $project: {
                    _id: 1,
                    dep_name: 1,
                    employeeCount: { $size: "$employees" },
                    sectionCount: { $size: "$sections" }
                }
            }
        ]);
        return res.status(200).json({ success: true, departments });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

const addDepartment = async (req, res) => {
    try {
        const { dep_name, description } = req.body;
        const newDep = new Department({ dep_name, description });
        await newDep.save();
        return res.status(200).json({ success: true, message: "Department Added" });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server error adding department" });
    }
};

const getDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const department = await Department.findById(id);
        return res.status(200).json({ success: true, department });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server error fetching department" });
    }
};

const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { dep_name, description } = req.body;
        await Department.findByIdAndUpdate(id, { dep_name, description });
        return res.status(200).json({ success: true, message: "Department Updated" });

    } catch (error) {
        return res.status(500).json({ success: false, error: "Server error updating department" });
    }
};

const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Find all employees in this department
        const employees = await Employee.find({ department: id });
        const userIds = employees.map(emp => emp.userId);

        // 2. Delete User accounts associated with these employees
        await User.deleteMany({ _id: { $in: userIds } });

        // 3. Delete all Employees in this department
        await Employee.deleteMany({ department: id });

        // 4. Delete all Sections in this department
        await Section.deleteMany({ department: id });

        // 5. Finally, delete the Department
        await Department.findByIdAndDelete(id);

        return res.status(200).json({ success: true, message: "Department and all associated data deleted" });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server error during cascading delete" });
    }
};
const getEmployeesByDep = async (req, res) => {
    try {
        const { id } = req.params;
        const employees = await Employee.find({ department: id }).populate('userId', 'name');
        res.status(200).json({ success: true, employees });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

module.exports = { getDepartments, addDepartment, getDepartment, updateDepartment, deleteDepartment, getEmployeesByDep };