import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddDesignation = () => {
    const [departments, setDepartments] = useState([]);
    const [designation, setDesignation] = useState({ designation_name: '', description: '', department: '' });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDeps = async () => {
            try {
                const config = { headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` } };
                const res = await axios.get('http://localhost:3000/api/department', config);
                if (res.data.success) setDepartments(res.data.departments);
            } catch (err) { console.error(err); }
        };
        fetchDeps();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` } };
            const response = await axios.post('http://localhost:3000/api/designation/add', designation, config);
            if (response.data.success) navigate('/admin-dashboard/designations');
        } catch (error) {
            setError(error.response?.data?.error || "Server Error");
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-md shadow-md">
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-gray-800">Add New Designation</h2>

                {error && (
                    <div className="bg-red-500 text-white text-sm p-2 rounded mb-4 text-center">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Designation Name</label>
                        <input
                            type="text"
                            onChange={(e) => setDesignation({ ...designation, designation_name: e.target.value })}
                            className="mt-1 w-full p-2 border rounded-md focus:outline-teal-500 text-sm"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Department</label>
                        <select
                            onChange={(e) => setDesignation({ ...designation, department: e.target.value })}
                            className="mt-1 w-full p-2 border rounded-md focus:outline-teal-500 text-sm bg-white"
                            required
                        >
                            <option value="">Select Department</option>
                            {departments.map(dep => (
                                <option key={dep._id} value={dep._id}>{dep.dep_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            onChange={(e) => setDesignation({ ...designation, description: e.target.value })}
                            className="mt-1 w-full p-2 border rounded-md focus:outline-teal-500 text-sm"
                            rows="3"
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded transition-colors cursor-pointer"
                    >
                        Add Designation
                    </button>
                </form>
            </div>

            <div className="max-w-xl mx-auto">
                <button
                    onClick={() => navigate('/admin-dashboard/designations')}
                    className="mt-6 text-gray-500 hover:text-black font-semibold flex items-center gap-2 cursor-pointer text-sm"
                >
                    ← Back to Designations
                </button>
            </div>
        </div>
    );
};

export default AddDesignation;