import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddEmployee = () => {
    const [departments, setDepartments] = useState([]);
    const [sections, setSections] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [error, setError] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', employeeId: '', dob: '', gender: '',
        maritalStatus: '', designation: '', department: '', section: '', 
        salary: '', password: '', role: 'employee', image: null
    });
    
    const navigate = useNavigate();

    // 1. Initial Fetch: Get all Departments
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get('http://localhost:3000/api/department', config);
                if (res.data.success) setDepartments(res.data.departments);
            } catch (err) { 
                setError("Failed to fetch departments.");
                console.error("Error fetching departments", err);
            }
        };
        fetchDepartments();
    }, []);

    // 2. Dependent Fetch: Get Sections AND Designations when Department changes
    useEffect(() => {
        const fetchDependentData = async () => {
            if (formData.department) {
                try {
                    const token = localStorage.getItem('token');
                    const config = { headers: { Authorization: `Bearer ${token}` } };

                    // Fetch both based on the selected department ID
                    const [secRes, desRes] = await Promise.all([
                        axios.get(`http://localhost:3000/api/section/department/${formData.department}`, config),
                        axios.get(`http://localhost:3000/api/designation/department/${formData.department}`, config)
                    ]);

                    if (secRes.data.success) setSections(secRes.data.sections);
                    if (desRes.data.success) setDesignations(desRes.data.designations);
                    
                } catch (err) {
                    setSections([]);
                    setDesignations([]);
                    console.error("Error fetching dependent data", err);
                }
            } else {
                setSections([]);
                setDesignations([]);
            }
        };
        fetchDependentData();
    }, [formData.department]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "image") {
            const file = files[0];
            if (file) {
                setFormData({ ...formData, image: file });
                setImagePreview(URL.createObjectURL(file));
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) data.append(key, formData[key]);
        });

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:3000/api/employee/add', data, {
                headers: { 
                    Authorization: `Bearer ${token}`, 
                    "Content-Type": "multipart/form-data" 
                }
            });
            if (res.data.success) {
                alert(`Employee Added Successfully!`);
                navigate('/admin-dashboard/employees');
            }
        } catch (err) {
            setError(err.response?.data?.error || "Error adding employee.");
        }
    };

    const inputClass = "mt-1 w-full border p-2 rounded focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-white";
    const labelClass = "block text-sm font-medium text-gray-700";

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white shadow-md border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-6 text-gray-800">Add New Employee</h2>
                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" name="name" placeholder="Full Name" onChange={handleChange} className={inputClass} required />
                    <input type="email" name="email" placeholder="Email" onChange={handleChange} className={inputClass} required />
                    <input type="text" name="employeeId" placeholder="Employee ID" onChange={handleChange} className={inputClass} required />
                    <input type="date" name="dob" onChange={handleChange} className={inputClass} required />

                    <select name="gender" onChange={handleChange} className={inputClass} required>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>

                    <select name="maritalStatus" onChange={handleChange} className={inputClass} required>
                        <option value="">Marital Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                    </select>

                    {/* Department Dropdown */}
                    <div>
                        <label className={labelClass}>Department</label>
                        <select name="department" onChange={handleChange} className={inputClass} required>
                            <option value="">Select Department</option>
                            {departments.map(dep => <option key={dep._id} value={dep._id}>{dep.dep_name}</option>)}
                        </select>
                    </div>

                    {/* Dependent Designation Dropdown */}
                    <div>
                        <label className={labelClass}>Designation</label>
                        <select name="designation" onChange={handleChange} className={inputClass} required disabled={!formData.department}>
                            <option value="">Select Designation</option>
                            {designations.map(des => <option key={des._id} value={des._id}>{des.designation_name}</option>)}
                        </select>
                    </div>

                    {/* Dependent Section Dropdown */}
                    <div>
                        <label className={labelClass}>Section</label>
                        <select name="section" onChange={handleChange} className={inputClass} required disabled={!formData.department}>
                            <option value="">Select Section</option>
                            {sections.map(sec => <option key={sec._id} value={sec._id}>{sec.section_name}</option>)}
                        </select>
                    </div>

                    <input type="number" name="salary" placeholder="Salary" onChange={handleChange} className={inputClass} required />
                    <input type="password" name="password" placeholder="Password" onChange={handleChange} className={inputClass} required />

                    <div className="sm:col-span-2">
                        <label className={labelClass}>Profile Picture</label>
                        <input type="file" name="image" accept="image/*" onChange={handleChange} className="mt-1 block w-full text-sm" />
                        {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-20 h-20 rounded-full object-cover border" />}
                    </div>

                    <button type="submit" className="sm:col-span-2 mt-4 bg-teal-600 text-white font-bold py-2 rounded shadow-md">
                        Add Employee
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddEmployee;