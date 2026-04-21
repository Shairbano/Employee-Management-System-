const express = require('express');
const router = express.Router();
const { verifyUser } = require('../middleware/authMiddleware'); // was ../../middleware/authMiddleware

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
} = require('../controllers/projectController'); // was ../controllers/projectController

// ── Project CRUD ──────────────────────────────────────────────────────────────
router.post('/',              verifyUser, createProject);
router.get('/',               verifyUser, getAllProjects);
router.get('/search',         verifyUser, searchEmployees);
router.get('/invitations',    verifyUser, getMyInvitations);
router.get('/:id',            verifyUser, getProject);
router.put('/:id',            verifyUser, updateProject);
router.delete('/:id',         verifyUser, deleteProject);

// ── Member management ─────────────────────────────────────────────────────────
router.post('/:id/members',                       verifyUser, addMember);
router.delete('/:id/members/:memberId',           verifyUser, removeMember);
router.patch('/:id/members/:memberId/respond',    verifyUser, respondToInvitation);

// ── Admin: employee project history ──────────────────────────────────────────
router.get('/employee/:employeeId/history',       verifyUser, getEmployeeProjectHistory);

module.exports = router;