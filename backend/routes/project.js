const express = require('express');
const router = express.Router();
const { verifyUser } = require('../middleware/authMiddleware'); // FIXED: was ../../middleware

const {
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
} = require('../controllers/projectController');

// ── IMPORTANT: Specific routes MUST come before generic /:id routes ──────────
router.get('/search',                             verifyUser, searchEmployees);
router.get('/invitations',                        verifyUser, getMyInvitations);
router.get('/employee/:employeeId/history',       verifyUser, getEmployeeProjectHistory); // FIXED: moved before /:id

// ── Project CRUD ──────────────────────────────────────────────────────────────
router.post('/',              verifyUser, createProject);
router.get('/',               verifyUser, getAllProjects);
router.get('/:id',            verifyUser, getProject);
router.put('/:id',            verifyUser, updateProject);
router.delete('/:id',         verifyUser, deleteProject);

// ── Member management ─────────────────────────────────────────────────────────
router.post('/:id/members',                       verifyUser, addMember);
router.delete('/:id/members/:memberId',           verifyUser, removeMember);
router.patch('/:id/members/:memberId/respond',    verifyUser, respondToInvitation);

module.exports = router;