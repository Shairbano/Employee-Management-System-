const express = require('express');
const router = express.Router();
const { 
    getDepartments, 
    addDepartment, 
    getDepartment, 
    updateDepartment, 
    deleteDepartment,
    getEmployeesByDep
} = require('../controllers/departmentController');
const { verifyUser } = require('../middleware/authMiddleware');

router.get('/', verifyUser, getDepartments);
router.post('/add', verifyUser, addDepartment);
router.get('/:id', verifyUser, getDepartment); 
router.put('/:id', verifyUser, updateDepartment); // Added this for Edit page save
router.delete('/:id', verifyUser, deleteDepartment);
router.get('/department/:id', verifyUser, getEmployeesByDep);

module.exports = router;