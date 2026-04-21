const Section = require('../models/Section');
const Employee = require('../models/Employee');

// GET ALL SECTIONS WITH EMPLOYEE COUNT
const getSections = async (req, res) => {
    try {
        const sections = await Section.aggregate([
            {
                $lookup: {
                    from: 'departments', // Join with departments
                    localField: 'department',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            { $unwind: "$department" }, // Flatten the department array
            {
                $lookup: {
                    from: 'employees', // Join with employees
                    localField: '_id',
                    foreignField: 'section', // Match employee.section to section._id
                    as: 'employees'
                }
            },
            {
                $project: {
                    _id: 1,
                    section_name: 1,
                    description: 1,
                    department: 1,
                    employeeCount: { $size: "$employees" } // Create the count field
                }
            }
        ]);
        return res.status(200).json({ success: true, sections });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server Error" });
    }
};

// ADD SECTION
const addSection = async (req, res) => {
    try {
        const { section_name, description, department } = req.body;
        const newSection = new Section({ section_name, description, department });
        await newSection.save();
        res.status(200).json({ success: true, message: "Section Created" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

// GET SINGLE SECTION (For Edit)
const getSection = async (req, res) => {
    try {
        const section = await Section.findById(req.params.id).populate('department');
        res.status(200).json({ success: true, section });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

// UPDATE SECTION
const updateSection = async (req, res) => {
    try {
        const { section_name, description, department } = req.body;
        await Section.findByIdAndUpdate(req.params.id, { section_name, description, department });
        res.status(200).json({ success: true, message: "Section Updated" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

// DELETE SECTION
const deleteSection = async (req, res) => {
    try {
        const sectionId = req.params.id;
        // Optional: Remove section ref from employees before deleting
        await Employee.updateMany({ section: sectionId }, { $unset: { section: "" } });
        await Section.findByIdAndDelete(sectionId);
        res.status(200).json({ success: true, message: "Section Deleted" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};
const getSectionsByDep = async (req, res) => {
    try {
        const { id } = req.params;
        const sections = await Section.find({ department: id });
        res.status(200).json({ success: true, sections });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

module.exports = { addSection, getSections, getSection, updateSection, deleteSection, getSectionsByDep };