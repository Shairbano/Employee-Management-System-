# Employee Management System (EMS)

A full-stack MERN (MongoDB, Express, React, Node.js) application designed to manage employee records, leave applications, and departmental structures. It features a dual-dashboard system for Admins and Employees.

## Features

Admin Dashboard

### Management

Add, edit, and delete employees and departments.

### Leave Approval

View all employee leave requests with the ability to Approve or Reject.

### Summary

View real-time statistics of total employees, departments, and leave statuses.

### Employee Dashboard

### Leave Application

Apply for Sick, Casual, or Annual leave.

### History

Track the status of previous leave applications.

### Personal Stats

View personal summary cards for pending and approved leaves.

## Tech Stack

### Frontend

React.js, Tailwind CSS, Axios, React Router.

### Backend

Node.js, Express.js.

### Database

MongoDB (with Mongoose ODM).

### Authentication

JSON Web Tokens (JWT) & Bcrypt for password hashing.

## Installation & Setup

1. Clone the Repository
2. Backend Setup
Navigate to the server folder: cd server

Install dependencies: npm install

Create a .env file and add your credentials:

Code snippet
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_KEY=your_secret_key
Start the server: npm run dev (or node index.js)

1. Frontend Setup
Navigate to the frontend folder: cd frontend

Install dependencies: npm install

Start the React development server: npm run dev

 API Endpoints (Quick Reference)
Authentication
POST /api/auth/login - User login.

GET /api/auth/verify - Verify JWT and return user session data.

Leaves
POST /api/leave/add - Submit a new leave request.

GET /api/leave - (Admin) Get all leave requests.

GET /api/leave/:id - (Employee) Get leave history for a specific employee.

PATCH /api/leave/:id - (Admin) Approve/Reject a leave.
Admin Dashboard Employee Dashboard
Contributing
Contributions are welcome! If you have suggestions for improvements or new features, feel free to open an issue or submit a pull request.
