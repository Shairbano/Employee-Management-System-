const express = require('express');
const router = express.Router();
const { verifyUser } = require('../middleware/authMiddleware');
const User = require('../models/user');
const bcrypt = require('bcrypt');

router.put('/change-password', verifyUser, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        // MANUALLY fetch the user including the password field
        const user = await User.findById(req.user._id); 
        console.log("Current User from DB:", user); // Check if this is null
        console.log("Old Password Input:", oldPassword);
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        // Now user.password will NOT be undefined
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, error: "Incorrect old password" });
        }

        const hashPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(req.user._id, { password: hashPassword });

        res.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
module.exports = router;