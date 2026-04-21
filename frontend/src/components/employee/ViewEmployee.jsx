import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const ViewEmployee = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:3000/api/employee/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) setEmployee(res.data.employee);
            } catch (err) {
                alert("Error fetching details");
                console.log(err);
            }
        };
        fetchEmployee();
    }, [id]);

    if (!employee) return (
        <div className="p-6 text-center text-gray-400 animate-pulse">Loading...</div>
    );

    const fields = [
        { label: "Employee ID", value: employee.employeeId },
        { label: "Department", value: employee.department?.dep_name || "N/A" },
        { label: "Section", value: employee.section?.section_name || "N/A" },
        { label: "Salary", value: `$${employee.salary}` },
        { label: "Marital Status", value: employee.maritalStatus },
    ];

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md border p-6 sm:p-8">

                {/* Profile Header */}
                <div className="flex flex-col items-center mb-6 sm:mb-8">
                    <img
                        src={employee.image || "https://via.placeholder.com/150"}
                        alt="Profile"
                        className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-4 border-teal-500 object-cover shadow-lg mb-4"
                    />
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 text-center">
                        {employee.userId.name}
                    </h2>
                    <p className="text-teal-600 font-medium text-sm sm:text-base mt-1">
                        {employee.designation?.designation_name || employee.designation || "N/A"}
                    </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 border-t pt-6">
                    {fields.map((f, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                            <p className="text-gray-400 text-xs font-semibold uppercase mb-1">{f.label}</p>
                            <p className="font-bold text-gray-800 capitalize">{f.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="max-w-3xl mx-auto">
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

export default ViewEmployee;