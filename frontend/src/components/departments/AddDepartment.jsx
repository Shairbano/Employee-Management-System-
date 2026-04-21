import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddDepartment = () => {
    const [department, setDepartment] = useState({ dep_name: '', description: '' });
    const [message, setMessage] = useState({ text: '', type: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDepartment({ ...department, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!department.dep_name.trim()) {
            setMessage({ text: "Department Name is required!", type: "error" });
            return;
        }
        if (!department.description.trim()) {
            setMessage({ text: "Please provide a description.", type: "error" });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const checkRes = await axios.get('http://localhost:3000/api/department', {
                headers: { "Authorization": `Bearer ${token}` }
            });

            const isDuplicate = checkRes.data.departments.some(
                dep => dep.dep_name.toLowerCase() === department.dep_name.toLowerCase()
            );

            if (isDuplicate) {
                setMessage({ text: "This department already exists!", type: "error" });
                return;
            }

            const response = await axios.post('http://localhost:3000/api/department/add', department, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.data.success) {
                setMessage({ text: "Department added successfully!", type: "success" });
                setTimeout(() => navigate('/admin-dashboard/departments'), 2000);
            }
        } catch (error) {
            setMessage({
                text: error.response?.data?.error || "Failed to add department",
                type: "error"
            });
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-xl mx-auto bg-white rounded-md shadow-xl border border-gray-100 p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-6 text-center text-gray-800">Add Department</h3>

                {message.text && (
                    <div className={`mb-4 p-2 text-center rounded text-white text-sm ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700">Department Name:</label>
                        <input
                            type="text"
                            name="dep_name"
                            value={department.dep_name}
                            onChange={handleChange}
                            placeholder="e.g. IT Department"
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-teal-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Description:</label>
                        <textarea
                            name="description"
                            value={department.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Enter description"
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-teal-500"
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded transition-all cursor-pointer shadow-md"
                    >
                        Add Department
                    </button>
                </form>
            </div>

            <div className="max-w-xl mx-auto">
                <button
                    onClick={() => navigate('/admin-dashboard/departments')}
                    className="mt-6 text-gray-500 hover:text-black font-semibold flex items-center gap-2 cursor-pointer text-sm"
                >
                    ← Back to Departments
                </button>
            </div>
        </div>
    );
};

export default AddDepartment;