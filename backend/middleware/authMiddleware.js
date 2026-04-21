// middleware/authMiddleware.js
let jwt = require('jsonwebtoken');
let User = require('../models/user.js');
let Employee = require('../models/Employee.js'); // Add this import

const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No token", success: false });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY || process.env.JWT_SECRET);

    const user = await User.findById(decoded._id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found", success: false });

    // NEW: Find the employee profile to get the profileId
    const employee = await Employee.findOne({ userId: user._id });

    // Attach user AND the profileId to req.user
    req.user = {
      _id: user._id,
      name: user.name,
      role: user.role,
      profileId: employee ? employee._id : null
    }; 

    next();
  } catch (err) {
    res.status(500).json({ message: "Server error", success: false });
  }
};

module.exports = { verifyUser };