const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employeeId: { type: String, required: true, unique: true },
    dob: { type: Date },
    gender: { type: String },
    // Simplified because you are saving a base64 string
    image: { type: String },  
    maritalStatus: { type: String },
    designation: { type:mongoose.Schema.Types.ObjectId,ref:'Designation',required:true},
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true }, 
    salary: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Employee', employeeSchema);