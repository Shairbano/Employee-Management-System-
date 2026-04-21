import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DepartmentList = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterDepartments, setFilterDepartments] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchDepartments = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/department', {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.data.success) {
                setDepartments(response.data.departments);
                setFilterDepartments(response.data.departments);
            }
        } catch (err) {
            setError("Failed to load departments. Please check your server connection.");
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDepartments(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure?")) {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.delete(`http://localhost:3000/api/department/${id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.data.success) fetchDepartments();
            } catch (err) {
                setError("Delete failed. This department might have linked employees.");
                console.log(err);
            }
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="text-center mb-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Departments</h3>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center text-sm">
                    {error}
                </div>
            )}

            {/* Search + Add */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
                <input
                    type="text"
                    placeholder="Search departments..."
                    onChange={(e) => setFilterDepartments(
                        departments.filter(d => d.dep_name.toLowerCase().includes(e.target.value.toLowerCase()))
                    )}
                    className="w-full sm:w-64 px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                />
                <Link
                    to="/admin-dashboard/add-department"
                    className="text-center px-5 py-2 bg-teal-600 text-white rounded-md font-semibold text-sm hover:bg-teal-700 transition-colors whitespace-nowrap"
                >
                    + Add New
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-400 animate-pulse">Loading...</div>
            ) : filterDepartments.length === 0 ? (
                <div className="text-center py-16 text-gray-400">No departments found.</div>
            ) : (
                <>
                    {/* ── DESKTOP TABLE (sm+) ── */}
                    <div className="hidden sm:block overflow-x-auto shadow-lg rounded-lg border">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="text-xs text-white uppercase bg-teal-600">
                                <tr>
                                    <th className="px-6 py-4">No</th>
                                    <th className="px-6 py-4">Dept Name</th>
                                    <th className="px-6 py-4 text-center">Sections</th>
                                    <th className="px-6 py-4 text-center">Employees</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filterDepartments.map((dep, index) => (
                                    <tr key={dep._id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">{index + 1}</td>
                                        <td className="px-6 py-4 font-semibold">{dep.dep_name}</td>
                                        <td className="px-6 py-4 text-center font-bold text-blue-600">{dep.sectionCount || 0}</td>
                                        <td className="px-6 py-4 text-center font-bold text-teal-700">{dep.employeeCount || 0}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin-dashboard/department/${dep._id}`)}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded-md cursor-pointer hover:bg-blue-600 text-xs font-semibold"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(dep._id)}
                                                    className="bg-red-500 text-white px-3 py-1 rounded-md cursor-pointer hover:bg-red-600 text-xs font-semibold"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── MOBILE CARDS (below sm) ── */}
                    <div className="sm:hidden space-y-3">
                        {filterDepartments.map((dep, index) => (
                            <div key={dep._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <span className="text-xs text-gray-400 font-bold">#{index + 1}</span>
                                        <p className="font-bold text-gray-800 text-base">{dep.dep_name}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 mb-4">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-400 font-semibold uppercase">Sections</p>
                                        <p className="text-lg font-black text-blue-600">{dep.sectionCount || 0}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-400 font-semibold uppercase">Employees</p>
                                        <p className="text-lg font-black text-teal-700">{dep.employeeCount || 0}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/admin-dashboard/department/${dep._id}`)}
                                        className="flex-1 bg-blue-500 text-white py-2 rounded-lg cursor-pointer hover:bg-blue-600 text-sm font-semibold"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(dep._id)}
                                        className="flex-1 bg-red-500 text-white py-2 rounded-lg cursor-pointer hover:bg-red-600 text-sm font-semibold"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <button
                onClick={() => navigate('/admin-dashboard')}
                className="mt-8 text-gray-500 hover:text-black font-semibold flex items-center gap-2 cursor-pointer text-sm"
            >
                ← Back to Dashboard
            </button>
        </div>
    );
};

export default DepartmentList;