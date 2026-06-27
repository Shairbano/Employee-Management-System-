const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const Employee = require('../models/Employee.js');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials", success: false });
    }

    // NEW: Find the employee record linked to this user
    const employee = await Employee.findOne({ userId: user._id });

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "10d" }
    );

    res.status(200).json({
      message: "Login successful!",
      success: true,
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        profileId: employee ? employee._id : null // Attach the Employee ID here
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", success: false });
  }
};
const verify = (req, res) => {
  // req.user now contains the profileId from our updated middleware
  return res.status(200).json({ success: true, user: req.user });
};

// NEW: Step 1 - Check if email exists in records
const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Email not found in records" });
    }
    res.status(200).json({ success: true, message: "Email verified" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// NEW: Step 2 - Directly reset password for the verified email
const resetPasswordDirect = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    await user.save();
    res.status(200).json({ success: true, message: "Password updated successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { login, verify, checkEmail, resetPasswordDirect };