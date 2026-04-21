import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditDepartment = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [department, setDepartment] = useState({ dep_name: '', description: '' });
    const [sections, setSections] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { "Authorization": `Bearer ${token}` } };

                const depRes = await axios.get(`http://localhost:3000/api/department/${id}`, config);
                if (depRes.data.success) setDepartment(depRes.data.department);

                const secRes = await axios.get(`http://localhost:3000/api/section/department/${id}`, config);
                if (secRes.data.success) setSections(secRes.data.sections);

                const empRes = await axios.get(`http://localhost:3000/api/employee/department/${id}`, config);
                if (empRes.data.success) setEmployees(empRes.data.employees);

            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [id]);

    const handleDepSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`http://localhost:3000/api/department/${id}`, department, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.data.success) alert("Department Updated Successfully");
        } catch (err) {
            alert("Update failed");
            console.log(err);
        }
    };

    if (loading) return <div className="text-center mt-10 text-gray-500 animate-pulse">Loading Data...</div>;

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">
                Department Management Center
            </h2>

            {/* Department Edit Form */}
            <div className="bg-white p-4 sm:p-6 shadow-md rounded-lg mb-6 md:mb-8 border-t-4 border-teal-600">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-teal-700">Update Department Details</h3>
                <form onSubmit={handleDepSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-600">Department Name</label>
                        <input
                            type="text"
                            value={department.dep_name}
                            onChange={(e) => setDepartment({ ...department, dep_name: e.target.value })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-600">Description</label>
                        <input
                            type="text"
                            value={department.description}
                            onChange={(e) => setDepartment({ ...department, description: e.target.value })}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            className="w-full sm:w-auto bg-teal-600 text-white px-6 py-2 rounded font-bold hover:bg-teal-700 transition-all cursor-pointer"
                        >
                            Save Department Changes
                        </button>
                    </div>
                </form>
            </div>

            {/* Sections & Employees — stack on mobile, side by side on lg+ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

                {/* Sections Table */}
                <div className="bg-white p-4 sm:p-6 shadow-md rounded-lg border">
                    <h3 className="text-base sm:text-lg font-bold mb-4 text-teal-800">Sections</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="p-2">Section Name</th>
                                    <th className="p-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sections.length > 0 ? sections.map(sec => (
                                    <tr key={sec._id} className="border-b hover:bg-gray-50">
                                        <td className="p-2 font-medium">{sec.section_name}</td>
                                        <td className="p-2">
                                            <button
                                                onClick={() => navigate(`/admin-dashboard/sections/edit/${sec._id}`)}
                                                className="text-blue-600 font-semibold hover:underline cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="2" className="text-center p-4 text-gray-400">No sections found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Employees Table */}
                <div className="bg-white p-4 sm:p-6 shadow-md rounded-lg border">
                    <h3 className="text-base sm:text-lg font-bold mb-4 text-teal-800">Employees</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="p-2">Name</th>
                                    <th className="p-2 hidden sm:table-cell">Role</th>
                                    <th className="p-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.length > 0 ? employees.map(emp => (
                                    <tr key={emp._id} className="border-b hover:bg-gray-50">
                                        <td className="p-2">{emp.userId?.name}</td>
                                        <td className="p-2 text-gray-500 hidden sm:table-cell">{emp.designation}</td>
                                        <td className="p-2">
                                            <button
                                                onClick={() => navigate(`/admin-dashboard/employees/edit/${emp._id}`)}
                                                className="text-indigo-600 font-semibold hover:underline cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="3" className="text-center p-4 text-gray-400">No employees found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <button
                onClick={() => navigate('/admin-dashboard/departments')}
                className="mt-6 md:mt-8 text-gray-500 hover:text-black font-semibold flex items-center gap-2 cursor-pointer text-sm"
            >
                ← Back to Departments
            </button>
        </div>
    );
};

export default EditDepartment;