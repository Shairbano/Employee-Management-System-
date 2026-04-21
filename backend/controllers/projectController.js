const Project = require('../models/Project');
const Employee = require('../models/Employee');
const User = require('../models/user');

// ─── CREATE PROJECT ─────────────────────────────────────────────────────────
const createProject = async (req, res) => {
    try {
        const { name, description, technologies, deadline, status } = req.body;

        if (!req.user.profileId) {
            return res.status(400).json({ success: false, error: 'Employee profile not found for this user' });
        }

        const newProject = new Project({
            name,
            description,
            technologies: technologies || [],
            deadline: deadline || null,
            status: status || 'Planning',
            projectHead: {
                employeeId: req.user.profileId,
                userId: req.user._id
            },
            members: []
        });

        await newProject.save();
        res.status(201).json({ success: true, message: 'Project created successfully', project: newProject });
    } catch (error) {
        console.error('Create Project Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ─── GET ALL PROJECTS ────────────────────────────────────────────────────────
const getAllProjects = async (req, res) => {
    try {
        let projects;

        if (req.user.role === 'admin') {
            projects = await Project.find()
                .populate('projectHead.userId', 'name email')
                .populate('projectHead.employeeId', 'employeeId image')
                .populate('members.userId', 'name email')
                .populate('members.employeeId', 'employeeId image')
                .sort({ createdAt: -1 });
        } else {
            projects = await Project.find({
                $or: [
                    { 'projectHead.userId': req.user._id },
                    { 'members.userId': req.user._id }
                ]
            })
                .populate('projectHead.userId', 'name email')
                .populate('projectHead.employeeId', 'employeeId image')
                .populate('members.userId', 'name email')
                .populate('members.employeeId', 'employeeId image')
                .sort({ createdAt: -1 });
        }

        res.status(200).json({ success: true, projects });
    } catch (error) {
        console.error('Get Projects Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ─── GET SINGLE PROJECT ──────────────────────────────────────────────────────
const getProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id)
            .populate('projectHead.userId', 'name email')
            .populate('projectHead.employeeId', 'employeeId department image')
            .populate('members.userId', 'name email')
            .populate({
                path: 'members.employeeId',
                select: 'employeeId department designation image', // ← added image
                populate: [
                    { path: 'department', select: 'dep_name' },
                    { path: 'designation', select: 'designation_name' }
                ]
            });

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        res.status(200).json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ─── UPDATE PROJECT ──────────────────────────────────────────────────────────
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, technologies, deadline, status } = req.body;

        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

        if (project.projectHead.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Only the project head can update this project' });
        }

        await Project.findByIdAndUpdate(id, { name, description, technologies, deadline, status });
        res.status(200).json({ success: true, message: 'Project updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ─── DELETE PROJECT ──────────────────────────────────────────────────────────
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

        if (project.projectHead.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this project' });
        }

        await Project.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ─── ADD MEMBER ──────────────────────────────────────────────────────────────
const addMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { employeeId, role } = req.body;

        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

        if (project.projectHead.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Only the project head can add members' });
        }

        const employee = await Employee.findById(employeeId).populate('userId');
        if (!employee) return res.status(404).json({ success: false, error: 'Employee not found' });

        const alreadyMember = project.members.some(m => m.employeeId.toString() === employeeId);
        if (alreadyMember) {
            return res.status(400).json({ success: false, error: 'This employee is already in the project' });
        }
        if (project.projectHead.employeeId.toString() === employeeId) {
            return res.status(400).json({ success: false, error: 'Project head is already part of the project' });
        }

        project.members.push({
            employeeId: employee._id,
            userId: employee.userId._id,
            role,
            status: 'Pending'
        });

        await project.save();
        res.status(200).json({ success: true, message: 'Member invitation sent successfully' });
    } catch (error) {
        console.error('Add Member Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ─── REMOVE MEMBER ───────────────────────────────────────────────────────────
const removeMember = async (req, res) => {
    try {
        const { id, memberId } = req.params;

        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

        if (project.projectHead.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Only the project head can remove members' });
        }

        project.members = project.members.filter(m => m._id.toString() !== memberId);
        await project.save();
        res.status(200).json({ success: true, message: 'Member removed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ─── GET MY INVITATIONS ──────────────────────────────────────────────────────
const getMyInvitations = async (req, res) => {
    try {
        const projects = await Project.find({
            'members.userId': req.user._id,
            'members.status': 'Pending'
        })
            .populate('projectHead.userId', 'name email')
            .populate('projectHead.employeeId', 'employeeId image');

        const invitations = projects.map(p => {
            const memberEntry = p.members.find(
                m => m.userId.toString() === req.user._id.toString() && m.status === 'Pending'
            );
            return {
                _id: memberEntry._id,
                projectId: p._id,
                projectName: p.name,
                projectDescription: p.description,
                projectHead: p.projectHead,
                role: memberEntry.role,
                invitedAt: memberEntry.invitedAt
            };
        });

        res.status(200).json({ success: true, invitations });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ─── RESPOND TO INVITATION ───────────────────────────────────────────────────
const respondToInvitation = async (req, res) => {
    try {
        const { id, memberId } = req.params;
        const { action, rejectionReason } = req.body;

        if (!['Accepted', 'Rejected'].includes(action)) {
            return res.status(400).json({ success: false, error: 'Invalid action' });
        }

        if (action === 'Rejected' && (!rejectionReason || !rejectionReason.trim())) {
            return res.status(400).json({ success: false, error: 'Please provide a rejection reason' });
        }

        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

        const member = project.members.id(memberId);
        if (!member) return res.status(404).json({ success: false, error: 'Invitation not found' });

        if (member.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized to respond to this invitation' });
        }

        if (member.status !== 'Pending') {
            return res.status(400).json({ success: false, error: 'Invitation already responded to' });
        }

        member.status = action;
        member.respondedAt = new Date();
        if (action === 'Rejected') member.rejectionReason = rejectionReason.trim();

        await project.save();
        res.status(200).json({ success: true, message: `Invitation ${action.toLowerCase()} successfully` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ─── GET EMPLOYEE PROJECT HISTORY ────────────────────────────────────────────
const getEmployeeProjectHistory = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const employee = await Employee.findById(employeeId).populate('userId', 'name');
        if (!employee) return res.status(404).json({ success: false, error: 'Employee not found' });

        const projectsAsHead = await Project.find({ 'projectHead.employeeId': employeeId })
            .select('name description status createdAt members');

        const projectsAsMember = await Project.find({ 'members.employeeId': employeeId })
            .populate('projectHead.userId', 'name')
            .select('name description status createdAt members projectHead');

        const memberHistory = projectsAsMember.map(p => {
            const memberEntry = p.members.find(m => m.employeeId.toString() === employeeId);
            return {
                projectId: p._id,
                projectName: p.name,
                projectStatus: p.status,
                projectHead: p.projectHead,
                role: memberEntry?.role,
                inviteStatus: memberEntry?.status,
                rejectionReason: memberEntry?.rejectionReason,
                invitedAt: memberEntry?.invitedAt,
                respondedAt: memberEntry?.respondedAt
            };
        });

        res.status(200).json({
            success: true,
            employee: { name: employee.userId?.name, employeeId: employee.employeeId },
            projectsAsHead: projectsAsHead.map(p => ({
                projectId: p._id,
                projectName: p.name,
                projectStatus: p.status,
                totalMembers: p.members.length,
                createdAt: p.createdAt
            })),
            projectsAsMember: memberHistory
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ─── SEARCH EMPLOYEES ────────────────────────────────────────────────────────
const searchEmployees = async (req, res) => {
    try {
        const { q, projectId } = req.query;

        if (!q || q.trim().length < 1) {
            return res.status(200).json({ success: true, employees: [] });
        }

        const matchingUsers = await User.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ],
            role: 'employee'
        }).select('_id name email');

        const userIds = matchingUsers.map(u => u._id);

        const employees = await Employee.find({ userId: { $in: userIds } })
            .populate('userId', 'name email')
            .populate('department', 'dep_name')
            .populate('designation', 'designation_name')
            .select('_id employeeId userId department designation image');

        let result = employees;
        if (projectId) {
            const project = await Project.findById(projectId);
            if (project) {
                const existingIds = [
                    project.projectHead.employeeId.toString(),
                    ...project.members.map(m => m.employeeId.toString())
                ];
                result = employees.filter(e => !existingIds.includes(e._id.toString()));
            }
        }

        result = result.filter(e => e.userId._id.toString() !== req.user._id.toString());

        res.status(200).json({ success: true, employees: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    createProject,
    getAllProjects,
    getProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
    getMyInvitations,
    respondToInvitation,
    getEmployeeProjectHistory,
    searchEmployees
};