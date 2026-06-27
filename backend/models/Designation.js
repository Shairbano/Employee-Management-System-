// models/Designation.js
const mongoose = require('mongoose');

const designationSchema = new mongoose.Schema({
    designation_name: { type: String, required: true },
    description: { type: String },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Designation', designationSchema);