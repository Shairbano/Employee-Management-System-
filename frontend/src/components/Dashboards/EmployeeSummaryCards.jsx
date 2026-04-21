import React from 'react';
import SummaryCards from './SummaryCards'; 
import { FaUser, FaFileAlt } from 'react-icons/fa';
import { useAuth } from '../../context/authContext';

const EmployeeSummary = () => {
    const { user } = useAuth();

    return (
        <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Employee Dashboard</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SummaryCards 
                    icon={<FaUser />} 
                    text={"Welcome"} 
                    number={user?.name || "Employee"} 
                    color="bg-teal-600" 
                />
                <SummaryCards 
                    icon={<FaFileAlt />} 
                    text={"Role"} 
                    number={user?.role || "User"} 
                    color="bg-blue-600" 
                />
            </div>
        </div>
    );
};

export default EmployeeSummary;