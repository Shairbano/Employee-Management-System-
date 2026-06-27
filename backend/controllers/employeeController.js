const User = require('../models/user');
const Employee = require('../models/Employee');
const bcrypt = require('bcrypt');

// 1. ADD EMPLOYEE
const addEmployee = async (req, res) => {
    try {
        const { 
            name, email, employeeId, dob, gender, 
            maritalStatus, designation, department,section, salary, password, role 
        } = req.body;

        // 1. Check if user already exists
        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ success: false, error: "User already registered" });

        // 2. Handle the Image Buffer
        let imageBase64 = "";
        if (req.file) {
            // Convert binary buffer to base64 string
            const base64String = req.file.buffer.toString('base64');
            imageBase64 = `data:${req.file.mimetype};base64,${base64String}`;
        }

        // 3. Create User Account
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name, email, password: hashPassword, role
        });
        const savedUser = await newUser.save();

        // 4. Create Employee Profile with Image
        const newEmployee = new Employee({
            userId: savedUser._id,
            employeeId,
            dob,
            gender,
            maritalStatus,
            designation,
            department,
            section,
            salary,
            image: imageBase64 // Save the base64 string here
        });

        await newEmployee.save();
        return res.status(200).json({ success: true, message: "Employee Created" });

    } catch (error) {
        console.error("DETAILED ERROR:", error.message);
        res.status(500).json({ success: false, error: "Server error: " + error.message });
    }
};

// 2. GET ALL EMPLOYEES (This was missing or renamed causing your error)
const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find()
            .populate('userId', { password: 0 }) 
            .populate('department') 
            .populate('section');
        return res.status(200).json({ success: true, employees });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Fetch error" });
    }
};

// 3. GET SINGLE EMPLOYEE
const getEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        // Try finding by Employee _id first
        let employee = await Employee.findById(id)
            .populate('userId', { password: 0 })
            .populate('department')
            .populate('section')
            .populate('designation');

        // If not found, search using the userId field
        if (!employee) {
            employee = await Employee.findOne({ userId: id })
                .populate('userId', { password: 0 })
                .populate('department')
                .populate('section')
                .populate('designation');
        }

        if (!employee) {
            return res.status(404).json({ success: false, error: "Profile not found" });
        }

        return res.status(200).json({ success: true, employee });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server error fetching profile" });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, dob, gender, maritalStatus } = req.body;

        // Smart Find: Look for ID as either Employee _id OR User userId
        let employee = await Employee.findOne({
            $or: [
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, 
                { userId: id }
            ]
        });

        if (!employee) return res.status(404).json({ success: false, error: "Employee not found" });

        // Update User Name
        await User.findByIdAndUpdate(employee.userId, { name });

        let updateData = { maritalStatus, dob, gender };

        if (req.file) {
            const base64String = req.file.buffer.toString('base64');
            updateData.image = `data:${req.file.mimetype};base64,${base64String}`;
        }

        await Employee.findByIdAndUpdate(employee._id, updateData);

        return res.status(200).json({ success: true, message: "Profile Updated" });
          
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Update error" });
    }
};

// 4. UPDATE EMPLOYEE
const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        // 1. You must include 'section' here to extract it from the request body
        const { name, maritalStatus, designation, department, section, salary } = req.body;

        const employee = await Employee.findById(id);
        if (!employee) return res.status(404).json({ success: false, error: "Employee not found" });

        // Update the User record name
        await User.findByIdAndUpdate(employee.userId, { name });

        let updateData = {
            maritalStatus, 
            designation, 
            department, 
            section, // 2. Ensure section is passed to the update object
            salary
        };

        if (req.file) {
            const base64String = req.file.buffer.toString('base64');
            updateData.image = `data:${req.file.mimetype};base64,${base64String}`;
        }

        await Employee.findByIdAndUpdate(id, updateData);
        return res.status(200).json({ success: true, message: "Employee Updated" });
    } catch (error) {
        console.error("Update Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};
// 5. DELETE EMPLOYEE
const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findById(id);
        if (employee) {
            await User.findByIdAndDelete(employee.userId);
            await Employee.findByIdAndDelete(id);
        }
        return res.status(200).json({ success: true, message: "Employee Deleted" });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Delete error" });
    }
};
const getEmployeesByDep = async (req, res) => {
    try {
        const { id } = req.params;
        const employees = await Employee.find({ department: id }).populate('userId', 'name');
        return res.status(200).json({ success: true, employees });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server error fetching employees" });
    }
};
const getEmployeesBySection = async (req, res) => {
    try {
        const { id } = req.params; // Section ID
        const employees = await Employee.find({ section: id }).populate('userId', 'name');
        return res.status(200).json({ success: true, employees });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server error fetching employees" });
    }
};
const getEmployeesByDesignation = async (req, res) => {
    try {
        const { id } = req.params; // This is the Designation ID
        const employees = await Employee.find({ designation: id })
            .populate('userId', 'name');
            
        return res.status(200).json({ success: true, employees });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server error fetching employees by designation" });
    }
};

 
// EXPORT ALL FUNCTIONS - Make sure names match exactly
module.exports = { 
    addEmployee, 
    getEmployees, 
    getEmployee, 
    updateEmployee, 
    deleteEmployee ,
    getEmployeesByDep,
    getEmployeesBySection,
    getEmployeesByDesignation,
    updateProfile
};