import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditDesignation = () => {
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [designation, setDesignation] = useState({
        designation_name: '',
        description: '',
        department: ''
    });
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { "Authorization": `Bearer ${token}` } };

                const [depRes, desRes, empRes] = await Promise.all([
                    axios.get('http://localhost:3000/api/department', config),
                    axios.get(`http://localhost:3000/api/designation/${id}`, config),
                    axios.get(`http://localhost:3000/api/employee/designation/${id}`, config)
                ]);

                if (depRes.data.success) setDepartments(depRes.data.departments);

                if (desRes.data.success) {
                    const des = desRes.data.designation;
                    setDesignation({
                        designation_name: des.designation_name,
                        description: des.description || '',
                        department: des.department?._id || des.department
                    });
                }

                if (empRes.data.success) setEmployees(empRes.data.employees);

            } catch (error) {
                console.error(error);
                alert("Error fetching designation data");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDesignation({ ...designation, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:3000/api/designation/${id}`, designation, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.data.success) {
                alert("Designation Updated Successfully");
                navigate('/admin-dashboard/designations');
            }
        } catch (error) {
            alert(error.response?.data?.error || "Update failed");
        }
    };

    if (loading) return (
        <div className="text-center mt-10 text-gray-500 animate-pulse">Loading Designation Data...</div>
    );

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

                    {/* Edit Form */}
                    <div className="lg:col-span-1 bg-white p-6 sm:p-8 rounded-md shadow-md h-fit">
                        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-teal-700">Edit Designation</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Designation Name</label>
                                <input
                                    type="text"
                                    name="designation_name"
                                    value={designation.designation_name}
                                    onChange={handleChange}
                                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-teal-500 text-sm"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Department</label>
                                <select
                                    name="department"
                                    value={designation.department}
                                    onChange={handleChange}
                                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-teal-500 text-sm bg-white"
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
                                    name="description"
                                    value={designation.description}
                                    onChange={handleChange}
                                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-teal-500 text-sm"
                                    rows="3"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded cursor-pointer transition-colors"
                            >
                                Update Designation
                            </button>
                        </form>
                    </div>

                    {/* Employees List */}
                    <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-md shadow-md">
                        <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">
                            Employees with this Designation
                            {employees.length > 0 && (
                                <span className="ml-2 text-sm font-normal text-gray-400">({employees.length})</span>
                            )}
                        </h3>

                        {employees.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 text-sm">
                                No employees assigned to this designation.
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table (sm+) */}
                                <div className="hidden sm:block overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-100 text-gray-700">
                                            <tr>
                                                <th className="p-3">Employee Name</th>
                                                <th className="p-3 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {employees.map(emp => (
                                                <tr key={emp._id} className="border-b hover:bg-gray-50">
                                                    <td className="p-3 font-medium">{emp.userId?.name}</td>
                                                    <td className="p-3 text-center">
                                                        <button
                                                            onClick={() => navigate(`/admin-dashboard/employees/edit/${emp._id}`)}
                                                            className="text-blue-600 hover:underline font-semibold cursor-pointer text-sm"
                                                        >
                                                            Edit Profile
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Cards (below sm) */}
                                <div className="sm:hidden space-y-2">
                                    {employees.map(emp => (
                                        <div key={emp._id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                                            <p className="font-semibold text-gray-800 text-sm">{emp.userId?.name}</p>
                                            <button
                                                onClick={() => navigate(`/admin-dashboard/employees/edit/${emp._id}`)}
                                                className="text-blue-600 hover:underline font-semibold cursor-pointer text-sm"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => navigate('/admin-dashboard/designations')}
                    className="mt-8 text-gray-500 hover:text-black font-semibold flex items-center gap-2 cursor-pointer text-sm"
                >
                    ← Back to Designations
                </button>
            </div>
        </div>
    );
};

export default EditDesignation;