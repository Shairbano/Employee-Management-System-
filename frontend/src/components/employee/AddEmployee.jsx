import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddEmployee = () => {
    const [departments, setDepartments] = useState([]);
    const [sections, setSections] = useState([]);
    const [error, setError] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', employeeId: '', dob: '', gender: '',
        maritalStatus: '', designation: '', department: '', section: '', salary: '',
        password: '', role: 'employee', image: null
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDeps = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:3000/api/department', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDepartments(res.data.departments);
            } catch { setError("Failed to fetch departments."); }
        };
        fetchDeps();
    }, []);

    useEffect(() => {
        const fetchSections = async () => {
            if (formData.department) {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`http://localhost:3000/api/section/department/${formData.department}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setSections(res.data.sections);
                } catch { setSections([]); }
            } else { setSections([]); }
        };
        fetchSections();
    }, [formData.department]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (error) setError("");
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
        if (!formData.name.trim()) return setError("Name is required");
        if (!formData.email.trim()) return setError("Email is required");
        if (!formData.employeeId.trim()) return setError("Employee ID is required");
        if (!formData.department) return setError("Please select a department");
        if (!formData.section) return setError("Please select a section");
        if (!formData.password || formData.password.length < 6) return setError("Password must be at least 6 characters");
        if (!formData.image) return setError("Please upload a profile picture");

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:3000/api/employee/add', data, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });
            alert(`Employee Added Successfully!\nEmail: ${formData.email}\nPassword: ${formData.password}`);
            if (res.data.success) navigate('/admin-dashboard/employees');
        } catch (err) {
            setError(err.response?.data?.error || "Error adding employee.");
        }
    };

    const inputClass = "mt-1 w-full border p-2 rounded focus:ring-2 focus:ring-teal-500 outline-none text-sm";
    const labelClass = "block text-sm font-medium text-gray-700";

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white shadow-md border rounded-lg p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800">Add New Employee</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded animate-pulse text-sm">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Name</label>
                        <input type="text" name="name" placeholder="Insert Name" onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Email</label>
                        <input type="email" name="email" placeholder="Insert Email" onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Employee ID</label>
                        <input type="text" name="employeeId" placeholder="EMP101" onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Date of Birth</label>
                        <input type="date" name="dob" onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Gender</label>
                        <select name="gender" onChange={handleChange} className={inputClass}>
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Marital Status</label>
                        <select name="maritalStatus" onChange={handleChange} className={inputClass}>
                            <option value="">Select Status</option>
                            <option value="single">Single</option>
                            <option value="married">Married</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Designation</label>
                        <input type="text" name="designation" placeholder="Designation" onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Department</label>
                        <select name="department" onChange={handleChange} className={inputClass}>
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                                <option key={dept._id} value={dept._id}>{dept.dep_name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Section</label>
                        <select name="section" onChange={handleChange} disabled={!formData.department} className={`${inputClass} disabled:bg-gray-100`}>
                            <option value="">Select Section</option>
                            {sections.map(sec => (
                                <option key={sec._id} value={sec._id}>{sec.section_name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Salary</label>
                        <input type="number" name="salary" placeholder="Salary" onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Password</label>
                        <input type="password" name="password" placeholder="******" onChange={handleChange} className={inputClass} />
                    </div>

                    {/* Photo Upload */}
                    <div className="sm:col-span-2 border-t pt-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-gray-700 cursor-pointer hover:text-teal-600 transition-colors">
                                    Upload Profile Photo
                                    <input type="file" name="image" accept="image/*" onChange={handleChange}
                                        className="mt-1 w-full border p-2 rounded cursor-pointer file:cursor-pointer file:border-0 file:bg-teal-50 file:text-teal-700 file:font-semibold text-sm" />
                                </label>
                            </div>
                            {imagePreview && (
                                <div className="relative group cursor-pointer shrink-0" onClick={() => document.getElementsByName('image')[0].click()}>
                                    <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-teal-500 group-hover:opacity-75 transition-opacity" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white text-[10px] font-bold">CHANGE</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button className="sm:col-span-2 bg-teal-600 text-white py-2.5 font-bold rounded mt-2 hover:bg-teal-700 transition-all active:scale-95 cursor-pointer">
                        Save Employee
                    </button>
                </form>
            </div>

            <div className="max-w-4xl mx-auto">
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

export default AddEmployee;