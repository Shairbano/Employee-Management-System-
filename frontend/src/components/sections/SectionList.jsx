import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SectionList = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterSections, setFilterSections] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchSections = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/section', {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.data.success) {
                setSections(response.data.sections);
                setFilterSections(response.data.sections);
            }
        } catch (err) {
            setError("Failed to load sections. Please check your server connection.");
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSections(); }, [fetchSections]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this section?")) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.delete(`http://localhost:3000/api/section/${id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.data.success) fetchSections();
            } catch (error) {
                alert(error.response?.data?.error || "Error deleting section");
            }
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setFilterSections(sections.filter(sec =>
            (sec.section_name || "").toLowerCase().includes(term) ||
            (sec.department?.dep_name || "").toLowerCase().includes(term)
        ));
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="text-center mb-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Sections</h3>
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
                    placeholder="Search by section or dept..."
                    className="w-full sm:w-64 px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 outline-none shadow-sm text-sm"
                    onChange={handleSearch}
                />
                <Link
                    to="/admin-dashboard/add-section"
                    className="text-center px-5 py-2 bg-teal-600 text-white rounded-md font-semibold hover:bg-teal-700 transition-all text-sm whitespace-nowrap"
                >
                    + Add New Section
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-400 animate-pulse">Loading...</div>
            ) : filterSections.length === 0 ? (
                <div className="text-center py-16 text-gray-400">No sections found.</div>
            ) : (
                <>
                    {/* ── DESKTOP TABLE (sm+) ── */}
                    <div className="hidden sm:block overflow-x-auto shadow-lg rounded-lg border">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="text-xs text-white uppercase bg-teal-600">
                                <tr>
                                    <th className="px-6 py-4">No</th>
                                    <th className="px-6 py-4">Section Name</th>
                                    <th className="px-6 py-4">Department</th>
                                    <th className="px-6 py-4 text-center">Employees</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filterSections.map((sec, index) => (
                                    <tr key={sec._id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">{index + 1}</td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">{sec.section_name}</td>
                                        <td className="px-6 py-4 text-gray-700">{sec.department?.dep_name || "Unassigned"}</td>
                                        <td className="px-6 py-4 text-center font-bold text-teal-700">
                                            {sec.employeeCount ?? (sec.employees?.length || 0)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => navigate(`/admin-dashboard/sections/edit/${sec._id}`)} className="bg-blue-500 text-white px-3 py-1 rounded-md cursor-pointer hover:bg-blue-600 transition-colors text-xs font-semibold">Edit</button>
                                                <button onClick={() => handleDelete(sec._id)} className="bg-red-500 text-white px-3 py-1 rounded-md cursor-pointer hover:bg-red-600 transition-colors text-xs font-semibold">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── MOBILE CARDS (below sm) ── */}
                    <div className="sm:hidden space-y-3">
                        {filterSections.map((sec, index) => (
                            <div key={sec._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <span className="text-xs text-gray-400 font-bold">#{index + 1}</span>
                                        <p className="font-bold text-gray-800 text-base">{sec.section_name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{sec.department?.dep_name || "Unassigned"}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-400 font-semibold uppercase">Employees</p>
                                        <p className="text-lg font-black text-teal-700">{sec.employeeCount ?? (sec.employees?.length || 0)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <button onClick={() => navigate(`/admin-dashboard/sections/edit/${sec._id}`)} className="flex-1 bg-blue-500 text-white py-2 rounded-lg cursor-pointer hover:bg-blue-600 text-sm font-semibold">Edit</button>
                                    <button onClick={() => handleDelete(sec._id)} className="flex-1 bg-red-500 text-white py-2 rounded-lg cursor-pointer hover:bg-red-600 text-sm font-semibold">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <button
                onClick={() => navigate('/admin-dashboard')}
                className="mt-8 text-gray-500 hover:text-black font-semibold flex items-center gap-2 transition-colors cursor-pointer text-sm"
            >
                ← Back to Dashboard
            </button>
        </div>
    );
};

export default SectionList;