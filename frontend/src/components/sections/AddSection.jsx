import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddSection = () => {
    const [departments, setDepartments] = useState([]);
    const [allSections, setAllSections] = useState([]);
    const [section, setSection] = useState({ section_name: '', description: '', department: '' });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` } };
                const depRes = await axios.get('http://localhost:3000/api/department', config);
                const secRes = await axios.get('http://localhost:3000/api/section', config);
                if (depRes.data.success) setDepartments(depRes.data.departments);
                if (secRes.data.success) setAllSections(secRes.data.sections);
            } catch (err) {
                console.error("Error fetching data", err);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSection({ ...section, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!section.section_name.trim()) return setError("Section Name is required!");
        if (!section.department) return setError("Please select a department!");
        if (!section.description.trim()) return setError("Please provide a description!");

        const isDuplicate = allSections.some(
            sec => sec.section_name.toLowerCase() === section.section_name.toLowerCase() &&
                sec.department._id === section.department
        );
        if (isDuplicate) return setError("This section already exists in the selected department!");

        try {
            const response = await axios.post('http://localhost:3000/api/section/add', section, {
                headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.data.success) navigate('/admin-dashboard/sections');
        } catch (error) {
            setError(error.response?.data?.error || "Server Error");
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-md shadow-md">
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-gray-800">Add New Section</h2>

                {error && (
                    <div className="bg-red-500 text-white text-sm p-2 rounded mb-4 text-center">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Section Name</label>
                        <input
                            type="text"
                            name="section_name"
                            value={section.section_name}
                            onChange={handleChange}
                            placeholder="e.g. Frontend Development"
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 outline-none text-sm"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Department</label>
                        <select
                            name="department"
                            value={section.department}
                            onChange={handleChange}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 outline-none text-sm bg-white"
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
                            name="description"
                            value={section.description}
                            onChange={handleChange}
                            placeholder="Section Description"
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 outline-none text-sm"
                            rows="3"
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded transition-colors cursor-pointer"
                    >
                        Add Section
                    </button>
                </form>
            </div>

            <div className="max-w-xl mx-auto">
                <button
                    onClick={() => navigate('/admin-dashboard/sections')}
                    className="mt-6 text-gray-500 hover:text-black font-semibold flex items-center gap-2 cursor-pointer text-sm"
                >
                    ← Back to Sections
                </button>
            </div>
        </div>
    );
};

export default AddSection;