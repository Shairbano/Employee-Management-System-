import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { FaCheckCircle, FaTimesCircle, FaClock, FaInfoCircle } from 'react-icons/fa';

const LeaveHistory = () => {
    const [leaves, setLeaves] = useState([]);
    const [selectedLeave, setSelectedLeave] = useState(null); // NEW: For viewing details
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:3000/api/leave/${user.profileId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) setLeaves(res.data.leaves);
            } catch (err) {
                console.log(err);
            }
        };
        if (user?.profileId) fetchHistory();
    }, [user]);

    const getStatusIcon = (status) => {
        if (status === 'Approved') return <FaCheckCircle className="text-green-600" />;
        if (status === 'Rejected') return <FaTimesCircle className="text-red-600" />;
        return <FaClock className="text-yellow-600" />;
    };

    const getStatusColor = (status) => {
        if (status === 'Approved') return 'text-green-600 bg-green-50';
        if (status === 'Rejected') return 'text-red-600 bg-red-50';
        return 'text-yellow-600 bg-yellow-50';
    };

    return (
        <div className="p-4 md:p-6 max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold mb-6">My Leave History</h3>
            
            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto bg-white shadow-md rounded">
                <table className="w-full text-sm">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="p-3 text-left">Type</th>
                            <th className="p-3 text-left">From</th>
                            <th className="p-3 text-left">To</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-center">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaves.length > 0 ? (
                            leaves.map((l) => (
                                <tr key={l._id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{l.leaveType}</td>
                                    <td className="p-3 whitespace-nowrap">{new Date(l.startDate).toLocaleDateString()}</td>
                                    <td className="p-3 whitespace-nowrap">{new Date(l.endDate).toLocaleDateString()}</td>
                                    <td className="p-3">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-bold ${getStatusColor(l.status)}`}>
                                            {getStatusIcon(l.status)}
                                            {l.status}
                                        </div>
                                    </td>
                                    <td className="p-3 text-center">
                                        <button
                                            onClick={() => setSelectedLeave(l)}
                                            className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                                        >
                                            <FaInfoCircle className="inline mr-1" /> View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-6 text-center text-gray-500">No leave records found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden space-y-3">
                {leaves.length > 0 ? (
                    leaves.map((l) => (
                        <div key={l._id} className="bg-white rounded-xl shadow-sm border p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="font-bold text-gray-800">{l.leaveType}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs ${getStatusColor(l.status)}`}>
                                    {getStatusIcon(l.status)}
                                    {l.status}
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedLeave(l)}
                                className="cursor-pointer w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg text-sm font-bold transition-all"
                            >
                                <FaInfoCircle className="inline mr-2" /> View Details
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">
                        No leave records found.
                    </div>
                )}
            </div>

            {/* NEW: Details Modal */}
            {selectedLeave && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm cursor-pointer" 
                        onClick={() => setSelectedLeave(null)}
                    ></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className={`p-4 sm:p-6 text-white flex justify-between items-center ${
                            selectedLeave.status === 'Approved' ? 'bg-green-600' :
                            selectedLeave.status === 'Rejected' ? 'bg-red-600' : 'bg-yellow-500'
                        }`}>
                            <h2 className="text-lg sm:text-xl font-black tracking-tight">Leave Request Details</h2>
                            <button 
                                onClick={() => setSelectedLeave(null)} 
                                className="cursor-pointer hover:rotate-90 transition-transform"
                            >
                                <FaTimesCircle className="text-2xl" />
                            </button>
                        </div>
                        
                        <div className="p-5 sm:p-8 space-y-4">
                            {/* Leave Type & Status */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
                                    {selectedLeave.leaveType}
                                </span>
                                <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-bold ${getStatusColor(selectedLeave.status)}`}>
                                    {getStatusIcon(selectedLeave.status)}
                                    {selectedLeave.status}
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">From</p>
                                    <p className="text-sm font-bold text-gray-800">
                                        {new Date(selectedLeave.startDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">To</p>
                                    <p className="text-sm font-bold text-gray-800">
                                        {new Date(selectedLeave.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Your Reason */}
                            <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-200">
                                <p className="text-[10px] font-black text-blue-600 uppercase mb-2 italic">
                                    Your Reason
                                </p>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    {selectedLeave.reason || "No reason provided"}
                                </p>
                            </div>

                            {/* NEW: Admin's Response */}
                            {selectedLeave.adminReason && (
                                <div className={`p-4 rounded-2xl border-2 ${
                                    selectedLeave.status === 'Approved' 
                                        ? 'bg-green-50 border-green-200' 
                                        : 'bg-red-50 border-red-200'
                                }`}>
                                    <p className="text-[10px] font-black uppercase mb-2 italic flex items-center gap-2" style={{
                                        color: selectedLeave.status === 'Approved' ? '#059669' : '#dc2626'
                                    }}>
                                        {selectedLeave.status === 'Approved' ? (
                                            <FaCheckCircle className="text-sm" />
                                        ) : (
                                            <FaTimesCircle className="text-sm" />
                                        )}
                                        Admin's Decision Reason
                                    </p>
                                    <p className="text-gray-700 text-sm leading-relaxed font-medium">
                                        {selectedLeave.adminReason}
                                    </p>
                                    {selectedLeave.actionDate && (
                                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                            <FaClock className="text-xs" />
                                            Decided on: {new Date(selectedLeave.actionDate).toLocaleDateString()} 
                                            {new Date(selectedLeave.actionDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    )}
                                    {selectedLeave.actionBy?.name && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            By: {selectedLeave.actionBy.name}
                                        </p>
                                    )}
                                </div>
                            )}

                            {selectedLeave.status === 'Pending' && (
                                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-center">
                                    <p className="text-xs text-yellow-700 font-semibold">
                                        <FaClock className="inline mr-1" />
                                        Your leave request is pending admin review
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={() => setSelectedLeave(null)}
                                className="cursor-pointer w-full bg-gray-900 text-white py-3 rounded-2xl font-black hover:bg-black transition-all uppercase text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button 
                onClick={() => navigate('/employee-dashboard')}
                className="mt-8 text-gray-500 hover:text-black font-semibold flex items-center gap-2 cursor-pointer"
            >
                ← Back to Dashboard
            </button>
        </div>
    );
};

export default LeaveHistory;