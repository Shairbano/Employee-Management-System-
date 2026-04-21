const express = require('express');
const router = express.Router();
const multer = require('multer');

const { 
    addEmployee, 
    getEmployees, 
    getEmployee, 
    updateEmployee, 
    deleteEmployee,
    getEmployeesByDep,
    getEmployeesBySection,
    getEmployeesByDesignation,
    updateProfile
} = require('../controllers/employeeController');
const { verifyUser } = require('../middleware/authMiddleware');

// Multer Setup
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

// --- ROUTES ---

// 1. Add Employee (Handles image)
router.post('/add', verifyUser, upload.single('image'), addEmployee);

// 2. Get Employees
router.get('/', verifyUser, getEmployees);
router.get('/:id', verifyUser, getEmployee);

// 3. Update Employee (ONLY ONE ROUTE - MUST HAVE UPLOAD)
// This fixes the 'req.body is undefined' error
router.put('/:id', verifyUser, upload.single('image'), updateEmployee);

// 4. Delete Employee
router.delete('/:id', verifyUser, deleteEmployee);

// 5. Specialized Get Routes
router.get('/department/:id', verifyUser, getEmployeesByDep);
router.get('/section/:id', verifyUser, getEmployeesBySection);
router.get('/designation/:id', verifyUser, getEmployeesByDesignation);

// 6. Update Personal Profile (Handles image)
router.put('/update-profile/:id', verifyUser, upload.single('image'), updateProfile);

module.exports = router;