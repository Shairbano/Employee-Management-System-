import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/employee', {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.data.success) setEmployees(response.data.employees);
        } catch (error) {
            alert("Failed to load employees.");
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? This will also remove their login account.")) {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.delete(`http://localhost:3000/api/employee/${id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.data.success) fetchEmployees();
            } catch (err) {
                alert(err.response?.data?.error || "Delete failed");
            }
        }
    };

    const filteredEmployees = employees.filter(emp => {
        const term = searchTerm.toLowerCase();
        return (
            (emp.userId?.name || "").toLowerCase().includes(term) ||
            (emp.department?.dep_name || "").toLowerCase().includes(term) ||
            (emp.section?.section_name || "").toLowerCase().includes(term)
        );
    });

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="text-center mb-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Employees</h3>
            </div>

            {/* Search + Add */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
                <input
                    type="text"
                    placeholder="Search by Name, Dept, or Section"
                    className="w-full sm:w-64 px-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Link
                    to="/admin-dashboard/add-employee"
                    className="text-center px-5 py-2 bg-teal-600 text-white rounded-md font-semibold hover:bg-teal-700 transition-colors text-sm whitespace-nowrap"
                >
                    + Add New Employee
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-400 animate-pulse">Loading...</div>
            ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-16 text-gray-400">No employees found.</div>
            ) : (
                <>
                    {/* ── DESKTOP TABLE (sm+) ── */}
                    <div className="hidden sm:block overflow-x-auto shadow-lg rounded-lg border">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="text-xs text-white uppercase bg-teal-600">
                                <tr>
                                    <th className="px-6 py-4">S.No</th>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Department</th>
                                    <th className="px-6 py-4">Section</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map((emp, index) => (
                                    <tr key={emp._id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">{index + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={emp.image} alt="" className="w-8 h-8 rounded-full object-cover border" />
                                                <span className="font-semibold text-gray-900">{emp.userId?.name || "N/A"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{emp.department?.dep_name || "N/A"}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">
                                                {emp.section?.section_name || "No Section"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => navigate(`/admin-dashboard/employees/${emp._id}`)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 cursor-pointer text-xs font-semibold">View</button>
                                                <button onClick={() => navigate(`/admin-dashboard/employees/edit/${emp._id}`)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 cursor-pointer text-xs font-semibold">Edit</button>
                                                <button onClick={() => handleDelete(emp._id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 cursor-pointer text-xs font-semibold">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── MOBILE CARDS (below sm) ── */}
                    <div className="sm:hidden space-y-3">
                        {filteredEmployees.map((emp, index) => (
                            <div key={emp._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <img src={emp.image} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-teal-400" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-800 truncate">{emp.userId?.name || "N/A"}</p>
                                        <p className="text-xs text-gray-500">{emp.department?.dep_name || "N/A"}</p>
                                    </div>
                                    <span className="text-xs text-gray-400">#{index + 1}</span>
                                </div>
                                <div className="mb-3">
                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">
                                        {emp.section?.section_name || "No Section"}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => navigate(`/admin-dashboard/employees/${emp._id}`)} className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 cursor-pointer text-xs font-semibold">View</button>
                                    <button onClick={() => navigate(`/admin-dashboard/employees/edit/${emp._id}`)} className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 cursor-pointer text-xs font-semibold">Edit</button>
                                    <button onClick={() => handleDelete(emp._id)} className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 cursor-pointer text-xs font-semibold">Delete</button>
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

export default EmployeeList;