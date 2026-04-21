require('dotenv').config();
let departmentRoutes = require('./routes/department.js');
let express = require('express');
let cors = require('cors');
let designationRoutes = require('./routes/designation.js');
require('./config/db')
let authRoutes = require('./routes/auth.js');
let employeeRoutes = require('./routes/employee.js');
let dashboardRouter = require('./routes/dashboard');
let sectionRoutes = require('./routes/section.js');
let settingRouter = require('./routes/settings.js');
let leaves = require('./routes/leave.js');
let attendance = require('./routes/attendance.js');
let projectRoutes = require('./routes/project.js'); // ADD THIS

let app = express();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use('/api/auth', authRoutes);
app.use('/api/department', departmentRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/section', sectionRoutes);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/settings', settingRouter);
app.use('/api/leave', leaves);
app.use('/api/attendance', attendance);
app.use('/api/designation', designationRoutes);
app.use('/api/project', projectRoutes); // ADD THIS

app.get('/', (req, res) => {
    res.send('EMS Backend is running');
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
module.exports = app;