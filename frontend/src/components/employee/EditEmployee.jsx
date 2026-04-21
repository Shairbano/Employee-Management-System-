import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditEmployee = () => {
    const [employee, setEmployee] = useState({
        name: '', 
        email: '', // Added email to state
        maritalStatus: '', 
        designation: '', 
        salary: '',
        section: '', 
        department: '', 
        image: ''
    });
    const [newImage, setNewImage] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [sections, setSections] = useState([]);
    const [designations, setDesignations] = useState([]);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [depRes, empRes] = await Promise.all([
                    axios.get('http://localhost:3000/api/department', config),
                    axios.get(`http://localhost:3000/api/employee/${id}`, config)
                ]);
                setDepartments(depRes.data.departments);
                if (empRes.data.success) {
                    const emp = empRes.data.employee;
                    setEmployee({
                        name: emp.userId.name,
                        email: emp.userId.email, // Fetching email from userId
                        maritalStatus: emp.maritalStatus,
                        designation: emp.designation?._id || emp.designation,
                        salary: emp.salary,
                        department: emp.department?._id || emp.department,
                        section: emp.section?._id || emp.section || '',
                        image: emp.image
                    });
                }
            } catch (err) {
                console.error("Initial Fetch Error:", err);
                alert("Error loading employee data");
            }
        };
        fetchInitialData();
    }, [id]);

    useEffect(() => {
        const fetchSubData = async () => {
            if (employee.department) {
                try {
                    const token = localStorage.getItem('token');
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const [secRes, desRes] = await Promise.all([
                        axios.get(`http://localhost:3000/api/section/department/${employee.department}`, config),
                        axios.get(`http://localhost:3000/api/designation/department/${employee.department}`, config)
                    ]);
                    setSections(secRes.data.sections || []);
                    setDesignations(desRes.data.designations || []);
                    const isDesignationValid = (desRes.data.designations || []).some(d => d._id === employee.designation);
                    if (!isDesignationValid && employee.designation !== '') {
                        setEmployee(prev => ({ ...prev, designation: '', section: '' }));
                    }
                } catch (err) {
                    console.log(err)
                    setSections([]);
                    setDesignations([]);
                }
            }
        };
        fetchSubData();
    }, [employee.department, employee.designation]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmployee(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) setNewImage(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', employee.name);
        data.append('maritalStatus', employee.maritalStatus);
        data.append('designation', employee.designation);
        data.append('salary', employee.salary);
        data.append('department', employee.department);
        data.append('section', employee.section);
        if (newImage) data.append('image', newImage);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`http://localhost:3000/api/employee/${id}`, data, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });
            if (res.data.success) navigate('/admin-dashboard/employees');
        } catch (err) {
            alert("Update failed: " + (err.response?.data?.error || "Server Error"));
        }
    };

    const inputClass = "mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-teal-500 outline-none text-sm";
    const readOnlyClass = "mt-1 w-full p-2 border rounded-md bg-gray-100 text-gray-500 outline-none text-sm cursor-not-allowed";
    const labelClass = "block text-sm font-semibold text-gray-700";

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto bg-white rounded-md shadow-md border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-teal-700">Edit Employee</h2>

                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Full Name</label>
                            <input type="text" name="name" value={employee.name} onChange={handleChange} className={inputClass} required />
                        </div>
                        
                        {/* Email Field - Read Only */}
                        <div>
                            <label className={labelClass}>Email (Permanent)</label>
                            <input type="email" name="email" value={employee.email} className={readOnlyClass} readOnly />
                        </div>

                        <div>
                            <label className={labelClass}>Department</label>
                            <select name="department" value={employee.department} onChange={handleChange} className={inputClass} required>
                                <option value="">Select Department</option>
                                {departments.map(dep => <option key={dep._id} value={dep._id}>{dep.dep_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Designation</label>
                            <select name="designation" value={employee.designation} onChange={handleChange} className={inputClass} required>
                                <option value="">Select Designation</option>
                                {designations.map(des => <option key={des._id} value={des._id}>{des.designation_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Section</label>
                            <select name="section" value={employee.section} onChange={handleChange} className={inputClass} required>
                                <option value="">Select Section</option>
                                {sections.map(sec => <option key={sec._id} value={sec._id}>{sec.section_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Salary</label>
                            <input type="number" name="salary" value={employee.salary} onChange={handleChange} className={inputClass} required />
                        </div>
                        <div>
                            <label className={labelClass}>Marital Status</label>
                            <select name="maritalStatus" value={employee.maritalStatus} onChange={handleChange} className={inputClass}>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                            </select>
                        </div>
                        <button type="submit" className="sm:col-span-2 bg-teal-600 text-white py-2.5 rounded-md hover:bg-teal-700 font-bold mt-2 transition-colors cursor-pointer">
                            Update Employee
                        </button>
                    </form>

                    {/* Profile Image */}
                    <div className="flex flex-row md:flex-col items-center gap-4 md:gap-0 md:self-start">
                        <img
                            src={newImage ? URL.createObjectURL(newImage) : employee.image}
                            alt="Employee"
                            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-teal-500 object-cover shadow-lg"
                        />
                        <label className="md:mt-4 text-sm text-teal-600 font-semibold cursor-pointer hover:underline">
                            Change Photo
                            <input type="file" onChange={handleImageChange} className="hidden" />
                        </label>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => navigate('/admin-dashboard/employees')}
                    className="mt-6 text-gray-500 hover:text-black font-semibold flex items-center gap-2 cursor-pointer text-sm"
                >
                    ← Back to Employees
                </button>
            </div>
        </div>
    );
};

export default EditEmployee;