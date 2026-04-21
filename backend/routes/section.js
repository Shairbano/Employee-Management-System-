const express = require('express');
const router = express.Router();
const { verifyUser } = require('../middleware/authMiddleware');
const { 
    addSection, 
    getSections, 
    getSection, 
    updateSection, 
    deleteSection,
    getSectionsByDep
} = require('../controllers/sectionController'); // Import the controller functions

router.post('/add', verifyUser, addSection);
router.get('/', verifyUser, getSections);
router.get('/:id', verifyUser, getSection);
router.put('/:id', verifyUser, updateSection);
router.delete('/:id', verifyUser, deleteSection);
router.get('/department/:id', verifyUser, getSectionsByDep);
module.exports = router;