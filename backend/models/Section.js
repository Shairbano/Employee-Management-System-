const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    section_name: { type: String, required: true },
    description: { type: String },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Section', sectionSchema);