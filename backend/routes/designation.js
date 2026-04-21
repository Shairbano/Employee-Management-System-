const express = require('express');
const router = express.Router();
const { verifyUser } = require('../middleware/authMiddleware');
const { 
    addDesignation, 
    getDesignations, 
    getDesignationsByDep, 
    getDesignation, 
    updateDesignation ,
    deleteDesignation
} = require('../controllers/designationController');

router.post('/add', verifyUser, addDesignation);
router.get('/', verifyUser, getDesignations);
router.get('/department/:id', verifyUser, getDesignationsByDep); // Move this UP
router.get('/:id', verifyUser, getDesignation); // Generic ID route DOWN
router.put('/:id', verifyUser, updateDesignation);
router.delete('/:id', verifyUser, deleteDesignation);

module.exports = router;

module.exports = router;