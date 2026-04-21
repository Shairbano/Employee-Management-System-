// controllers/designationController.js
const Employee = require('../models/Employee');
const Designation = require('../models/Designation');

// GET ALL DESIGNATIONS WITH EMPLOYEE COUNT
const getDesignations = async (req, res) => {
    try {
        // Use aggregate to join with employees and count them
        const designations = await Designation.aggregate([
            {
                $lookup: {
                    from: 'departments', // Ensure this matches your department collection name
                    localField: 'department',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            { $unwind: '$department' },
            {
                $lookup: {
                    from: 'employees', // Ensure this matches your employee collection name
                    localField: '_id',
                    foreignField: 'designation',
                    as: 'employees'
                }
            },
            {
                $addFields: {
                    employeeCount: { $size: '$employees' }
                }
            },
            { $project: { employees: 0 } } // Remove the full employee list to keep response small
        ]);

        return res.status(200).json({ success: true, designations });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Server Error" });
    }
};

const addDesignation = async (req, res) => {
    try {
        const { designation_name, description, department } = req.body;
        const newDesignation = new Designation({ designation_name, description, department });
        await newDesignation.save();
        res.status(200).json({ success: true, message: "Designation Created" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

// GET SINGLE DESIGNATION (For Edit Form)
const getDesignation = async (req, res) => {
    try {
        const { id } = req.params;
        const designation = await Designation.findById(id).populate('department');
        if (!designation) return res.status(404).json({ success: false, error: "Designation not found" });
        return res.status(200).json({ success: true, designation });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

const updateDesignation = async (req, res) => {
    try {
        const { id } = req.params;
        const { designation_name, description, department } = req.body;
        
        const updated = await Designation.findByIdAndUpdate(
            id, 
            { designation_name, description, department },
            { new: true } // This returns the updated document
        );

        if (!updated) {
            return res.status(404).json({ success: false, error: "Designation not found" });
        }

        return res.status(200).json({ success: true, message: "Designation Updated" });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Update Error" });
    }
};

const getDesignationsByDep = async (req, res) => {
    try {
        const { id } = req.params;
        const designations = await Designation.find({ department: id });
        res.status(200).json({ success: true, designations });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

// DELETE DESIGNATION
const deleteDesignation = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Designation.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ success: false, error: "Designation not found" });
        }

        return res.status(200).json({ success: true, message: "Designation Deleted Successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Server Error during deletion" });
    }
};

// Update your module.exports at the bottom
module.exports = { 
    addDesignation, 
    getDesignations, 
    getDesignationsByDep, 
    getDesignation, 
    updateDesignation, 
    deleteDesignation // Add this
};