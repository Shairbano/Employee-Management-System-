import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DesignationList = () => {
    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterDesignations, setFilterDesignations] = useState([]);
    const navigate = useNavigate();

    const fetchDesignations = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/designation', {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.data.success) {
                setDesignations(response.data.designations);
                setFilterDesignations(response.data.designations);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchDesignations(); }, [fetchDesignations]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this designation?")) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.delete(`http://localhost:3000/api/designation/${id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.data.success) fetchDesignations();
            } catch (err) {
                alert(err.response?.data?.error || "Failed to delete designation");
            }
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setFilterDesignations(designations.filter(des =>
            (des.designation_name || "").toLowerCase().includes(term) ||
            (des.department?.dep_name || "").toLowerCase().includes(term)
        ));
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="text-center mb-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Designations</h3>
            </div>

            {/* Search + Add */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
                <input
                    type="text"
                    placeholder="Search by designation or dept..."
                    className="w-full sm:w-64 px-4 py-2 border rounded-md outline-none shadow-sm text-sm focus:ring-2 focus:ring-teal-500"
                    onChange={handleSearch}
                />
                <Link
                    to="/admin-dashboard/add-designation"
                    className="text-center px-5 py-2 bg-teal-600 text-white rounded-md font-semibold hover:bg-teal-700 transition-colors text-sm whitespace-nowrap"
                >
                    + Add New Designation
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-400 animate-pulse">Loading...</div>
            ) : filterDesignations.length === 0 ? (
                <div className="text-center py-16 text-gray-400">No designations found.</div>
            ) : (
                <>
                    {/* ── DESKTOP TABLE (sm+) ── */}
                    <div className="hidden sm:block overflow-x-auto shadow-lg rounded-lg border">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="text-xs text-white uppercase bg-teal-600">
                                <tr>
                                    <th className="px-6 py-4">No</th>
                                    <th className="px-6 py-4">Designation Name</th>
                                    <th className="px-6 py-4">Department</th>
                                    <th className="px-6 py-4 text-center">Employees</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filterDesignations.map((des, index) => (
                                    <tr key={des._id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">{index + 1}</td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">{des.designation_name}</td>
                                        <td className="px-6 py-4">{des.department?.dep_name}</td>
                                        <td className="px-6 py-4 text-center font-bold text-teal-700">{des.employeeCount}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin-dashboard/designations/edit/${des._id}`)}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-colors cursor-pointer text-xs font-semibold"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(des._id)}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition-colors cursor-pointer text-xs font-semibold"
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
                        {filterDesignations.map((des, index) => (
                            <div key={des._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <span className="text-xs text-gray-400 font-bold">#{index + 1}</span>
                                        <p className="font-bold text-gray-800 text-base">{des.designation_name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{des.department?.dep_name}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-400 font-semibold uppercase">Employees</p>
                                        <p className="text-lg font-black text-teal-700">{des.employeeCount}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={() => navigate(`/admin-dashboard/designations/edit/${des._id}`)}
                                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg cursor-pointer text-sm font-semibold"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(des._id)}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg cursor-pointer text-sm font-semibold"
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

export default DesignationList;