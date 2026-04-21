import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SummaryCards from './SummaryCards';
import { FaUser, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaProjectDiagram, FaBell } from 'react-icons/fa';
import { useAuth } from '../../context/authContext';
import axios from 'axios';

const EmployeeSummary = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [projectCount, setProjectCount] = useState(0);
    const [invitationCount, setInvitationCount] = useState(0);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const leaveRes = await axios.get(`http://localhost:3000/api/leave/stats/${user.profileId}`, { headers });
                if (leaveRes.data.success) setStats(leaveRes.data.stats);

                const projectRes = await axios.get(`http://localhost:3000/api/project`, { headers });
                if (projectRes.data.success) setProjectCount(projectRes.data.projects.length);

                const invRes = await axios.get(`http://localhost:3000/api/project/invitations`, { headers });
                if (invRes.data.success) setInvitationCount(invRes.data.invitations.length);

            } catch (err) {
                console.error("Error fetching dashboard data", err);
            }
        };

        if (user?.profileId) fetchDashboardData();
    }, [user]);

    return (
        <div className="p-3">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Welcome Back, {user?.name}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">

                {/* ── PROFILE CARD (Perfectly Aligned) ── */}
                <div
                    className="cursor-pointer transition-transform duration-200 hover:scale-105"
                    onClick={() => navigate(`/employee-dashboard/profile/${user?.profileId}`)}
                >
                    <div className="flex bg-white rounded-lg shadow-md overflow-hidden h-20">
                        {/* Match the exact icon box width of SummaryCards (usually w-24) */}
                        <div className="bg-teal-600 flex justify-center items-center w-15 shrink-0">
                            <FaUser className="text-white text-3xl" />
                        </div>
                        <div className="flex flex-col justify-center px-6 py-2">
                            <p className="text-gray-600 text-base font-medium">My Profile</p>
                            <p className="text-xl font-bold text-gray-800 truncate">{user?.name}</p>
                        </div>
                    </div>
                </div>

                {/* Active Projects Card */}
                <div
                    className="cursor-pointer transition-transform duration-200 hover:scale-105"
                    onClick={() => navigate('/employee-dashboard/projects')}
                >
                    <SummaryCards icon={<FaProjectDiagram />} text={"Active Projects"} number={projectCount} color="bg-blue-600" />
                </div>

                {/* Project Invitations Card */}
                <div
                    className="cursor-pointer transition-transform duration-200 hover:scale-105 relative"
                    onClick={() => navigate('/employee-dashboard/projects/invitations')}
                >
                    <SummaryCards icon={<FaBell />} text={"Project Invitations"} number={invitationCount} color="bg-indigo-600" />
                    {invitationCount > 0 && (
                        <span className="absolute top-0 right-0 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                        </span>
                    )}
                </div>
            </div>

            <h4 className="text-lg font-bold mb-4 text-gray-700">Leave Overview</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    className="cursor-pointer transition-transform duration-200 hover:scale-105"
                    onClick={() => navigate('/employee-dashboard/leave-history')}
                >
                    <SummaryCards icon={<FaHourglassHalf />} text={"Leaves Pending"} number={stats.pending} color="bg-yellow-500" />
                </div>
                <div
                    className="cursor-pointer transition-transform duration-200 hover:scale-105"
                    onClick={() => navigate('/employee-dashboard/leave-history')}
                >
                    <SummaryCards icon={<FaCheckCircle />} text={"Leaves Approved"} number={stats.approved} color="bg-green-600" />
                </div>
                <div
                    className="cursor-pointer transition-transform duration-200 hover:scale-105"
                    onClick={() => navigate('/employee-dashboard/leave-history')}
                >
                    <SummaryCards icon={<FaTimesCircle />} text={"Leaves Rejected"} number={stats.rejected} color="bg-red-600" />
                </div>
            </div>
        </div>
    );
};

export default EmployeeSummary;