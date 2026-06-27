const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    invitedAt: {
        type: Date,
        default: Date.now
    },
    respondedAt: {
        type: Date
    }
});

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    technologies: {
        type: [String],
        default: []
    },
    deadline: {
        type: Date
    },
    status: {
        type: String,
        //  Added 'Closed' status
        enum: ['Planning', 'In Progress', 'On Hold', 'Completed', 'Closed'],
        default: 'Planning'
    },
    // The employee who created the project (project head)
    projectHead: {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    members: [memberSchema]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);