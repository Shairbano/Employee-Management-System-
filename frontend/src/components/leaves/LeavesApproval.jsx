import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaCheckCircle, FaTimesCircle, FaList, FaArrowLeft, FaSearch } from 'react-icons/fa';

const LeavesApproval = () => {
    const [leaves, setLeaves] = useState([]);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [adminReason, setAdminReason] = useState(''); // NEW: Admin's reason
    const [showReasonModal, setShowReasonModal] = useState(false); // NEW: Modal for reason input
    const [pendingAction, setPendingAction] = useState(null); // NEW: Track which action is pending
    const navigate = useNavigate();

    const fetchLeaves = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/leave', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.data.success) setLeaves(res.data.leaves);
        } catch (error) {
            console.error('Error fetching leaves:', error);
        }
    };

    useEffect(() => {
        const abortController = new AbortController();
        const fetchData = async () => {
            try {
                const res = await axios.get('http://localhost:3000/api/leave', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    signal: abortController.signal
                });
                if (res.data.success && !abortController.signal.aborted) setLeaves(res.data.leaves);
            } catch (error) {
                if (!abortController.signal.aborted) console.error('Error fetching leaves:', error);
            }
        };
        fetchData();
        return () => abortController.abort();
    }, []);

    const filteredLeaves = React.useMemo(() => {
        return leaves.filter(l => {
            const matchesStatus = filterStatus === 'All' || l.status === filterStatus;
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                l.leaveType.toLowerCase().includes(searchLower) ||
                l.status.toLowerCase().includes(searchLower) ||
                (l.employeeId?.department?.dep_name || "").toLowerCase().includes(searchLower) ||
                (l.employeeId?.userId?.name || "").toLowerCase().includes(searchLower);
            return matchesStatus && matchesSearch;
        });
    }, [filterStatus, leaves, searchQuery]);

    // NEW: Open reason modal
    const openReasonModal = (action) => {
        setPendingAction(action);
        setAdminReason('');
        setShowReasonModal(true);
    };

    // NEW: Submit status with reason
    const handleStatusWithReason = async () => {
        if (!adminReason.trim()) {
            alert("Please provide a reason for your decision");
            return;
        }

        try {
            const res = await axios.patch(
                `http://localhost:3000/api/leave/${selectedLeave._id}`, 
                { status: pendingAction, adminReason },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            
            if (res.data.success) {
                setSelectedLeave({ 
                    ...selectedLeave, 
                    status: pendingAction, 
                    adminReason 
                });
                fetchLeaves();
                setShowReasonModal(false);
                setAdminReason('');
                setPendingAction(null);
            }
        } catch (err) {
            alert(err.response?.data?.error || "Status update failed");
        }
    };

    const getCount = (status) => leaves.filter(l => l.status === status).length;

    const statusColor = (status) => {
        if (status === 'Pending') return 'text-yellow-600';
        if (status === 'Approved') return 'text-green-600';
        return 'text-red-600';
    };

    const statusDot = (status) => {
        if (status === 'Pending') return 'bg-yellow-500';
        if (status === 'Approved') return 'bg-green-500';
        return 'bg-red-500';
    };

    return (
        <div className={`p-4 sm:p-6 bg-gray-100 min-h-screen transition-all duration-300 ${selectedLeave || showReasonModal ? 'overflow-hidden' : ''}`}>
            <div className="max-w-7xl mx-auto">
                <h3 className="text-xl sm:text-2xl font-black mb-6 text-gray-800 tracking-tight">Leave Approval Management</h3>

                {/* Filter Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    {[
                        { label: 'All', count: leaves.length, color: 'bg-teal-600', text: 'text-teal-600', icon: <FaList />, border: 'border-teal-600' },
                        { label: 'Pending', count: getCount('Pending'), color: 'bg-yellow-500', text: 'text-yellow-600', icon: <FaClock />, border: 'border-yellow-500' },
                        { label: 'Approved', count: getCount('Approved'), color: 'bg-green-600', text: 'text-green-600', icon: <FaCheckCircle />, border: 'border-green-600' },
                        { label: 'Rejected', count: getCount('Rejected'), color: 'bg-red-500', text: 'text-red-600', icon: <FaTimesCircle />, border: 'border-red-500' },
                    ].map((item) => (
                        <button
                            key={item.label}
                            onClick={() => setFilterStatus(item.label)}
                            className={`cursor-pointer flex items-center gap-2 sm:gap-4 p-3 sm:p-5 rounded-2xl bg-white border-2 transition-all duration-300 shadow-sm hover:shadow-md ${
                                filterStatus === item.label ? `${item.border} scale-105 z-10` : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                        >
                            <div className={`p-2 sm:p-3 rounded-xl ${item.color} text-white shadow-lg text-sm shrink-0`}>
                                {item.icon}
                            </div>
                            <div className="text-left">
                                <p className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                                <p className={`text-xl sm:text-2xl font-black ${filterStatus === item.label ? item.text : 'text-gray-700'}`}>
                                    {item.count}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="relative mb-6 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name, type, dept or status..."
                        className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white border-2 border-transparent focus:border-teal-600 rounded-2xl shadow-sm outline-none transition-all font-medium text-gray-700 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden sm:block overflow-hidden shadow-xl rounded-2xl border border-gray-200">
                    <table className="w-full bg-white text-sm text-left">
                        <thead className="bg-gray-800 text-white uppercase text-[11px] tracking-widest">
                            <tr>
                                <th className="p-4">Employee</th>
                                <th className="p-4">Department</th>
                                <th className="p-4">Leave Type</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLeaves.length > 0 ? filteredLeaves.map(leave => (
                                <tr key={leave._id} className="hover:bg-teal-50/30 transition-colors group">
                                    <td className="p-4 font-bold text-gray-800">{leave.employeeId?.userId?.name || "N/A"}</td>
                                    <td className="p-4 text-gray-500 font-medium">{leave.employeeId?.department?.dep_name || "N/A"}</td>
                                    <td className="p-4">
                                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">
                                            {leave.leaveType}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`flex items-center gap-1.5 font-black text-xs ${statusColor(leave.status)}`}>
                                            <span className={`h-2 w-2 rounded-full animate-pulse ${statusDot(leave.status)}`}></span>
                                            {leave.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => setSelectedLeave(leave)}
                                            className="cursor-pointer bg-gray-800 group-hover:bg-teal-600 text-white px-6 py-2 rounded-xl shadow-md transition-all active:scale-95 font-bold text-xs"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                        <p className="text-gray-400 font-bold uppercase tracking-widest">No matching records found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* MOBILE CARDS */}
                <div className="sm:hidden space-y-3">
                    {filteredLeaves.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border">
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No matching records found</p>
                        </div>
                    ) : filteredLeaves.map(leave => (
                        <div key={leave._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="font-bold text-gray-800">{leave.employeeId?.userId?.name || "N/A"}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{leave.employeeId?.department?.dep_name || "N/A"}</p>
                                </div>
                                <span className={`flex items-center gap-1.5 font-black text-xs ${statusColor(leave.status)}`}>
                                    <span className={`h-2 w-2 rounded-full animate-pulse ${statusDot(leave.status)}`}></span>
                                    {leave.status}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">
                                    {leave.leaveType}
                                </span>
                                <button
                                    onClick={() => setSelectedLeave(leave)}
                                    className="cursor-pointer bg-gray-800 hover:bg-teal-600 text-white px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 font-bold text-xs"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Details Modal */}
                {selectedLeave && !showReasonModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm cursor-pointer" onClick={() => setSelectedLeave(null)}></div>
                        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                            <div className="bg-teal-600 p-4 sm:p-6 text-white flex justify-between items-center">
                                <h2 className="text-lg sm:text-xl font-black tracking-tight">Request Details</h2>
                                <button onClick={() => setSelectedLeave(null)} className="cursor-pointer hover:rotate-90 transition-transform">
                                    <FaTimesCircle className="text-2xl" />
                                </button>
                            </div>
                            <div className="p-5 sm:p-8">
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="flex justify-between border-b pb-4">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Employee Name</p>
                                            <p className="text-gray-900 font-bold text-sm">{selectedLeave.employeeId?.userId?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Department</p>
                                            <p className="text-gray-900 font-bold text-sm">{selectedLeave.employeeId?.department?.dep_name}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border-2 border-dashed border-gray-200">
                                        <p className="text-[10px] font-black text-teal-600 uppercase mb-2 italic">Employee's Reason</p>
                                        <p className="text-gray-700 text-sm leading-relaxed font-medium">
                                            {selectedLeave.reason || "No specific reason provided."}
                                        </p>
                                    </div>

                                    {/* NEW: Show Admin Reason if exists */}
                                    {selectedLeave.adminReason && (
                                        <div className={`p-4 sm:p-5 rounded-2xl border-2 ${
                                            selectedLeave.status === 'Approved' 
                                                ? 'bg-green-50 border-green-200' 
                                                : 'bg-red-50 border-red-200'
                                        }`}>
                                            <p className="text-[10px] font-black uppercase mb-2 italic" style={{
                                                color: selectedLeave.status === 'Approved' ? '#059669' : '#dc2626'
                                            }}>
                                                Admin's Decision Reason
                                            </p>
                                            <p className="text-gray-700 text-sm leading-relaxed font-medium">
                                                {selectedLeave.adminReason}
                                            </p>
                                            {selectedLeave.actionDate && (
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Decided on: {new Date(selectedLeave.actionDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-2xl">
                                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{selectedLeave.leaveType}</span>
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm ${
                                            selectedLeave.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            selectedLeave.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {selectedLeave.status}
                                        </span>
                                    </div>
                                    
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p><span className="font-semibold">From:</span> {new Date(selectedLeave.startDate).toLocaleDateString()}</p>
                                        <p><span className="font-semibold">To:</span> {new Date(selectedLeave.endDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                
                                <div className="mt-6 sm:mt-8 flex gap-3">
                                    {selectedLeave.status === 'Pending' ? (
                                        <>
                                            <button 
                                                onClick={() => openReasonModal('Approved')} 
                                                className="cursor-pointer flex-1 bg-green-600 text-white py-3 sm:py-4 rounded-2xl font-black hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-95 uppercase text-xs"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => openReasonModal('Rejected')} 
                                                className="cursor-pointer flex-1 bg-red-500 text-white py-3 sm:py-4 rounded-2xl font-black hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95 uppercase text-xs"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    ) : (
                                        <button 
                                            onClick={() => setSelectedLeave(null)} 
                                            className="cursor-pointer w-full bg-gray-900 text-white py-3 sm:py-4 rounded-2xl font-black hover:bg-black transition-all uppercase text-xs"
                                        >
                                            Close Record
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* NEW: Reason Input Modal */}
                {showReasonModal && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"></div>
                        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md">
                            <div className={`p-4 sm:p-6 text-white flex justify-between items-center rounded-t-3xl ${
                                pendingAction === 'Approved' ? 'bg-green-600' : 'bg-red-600'
                            }`}>
                                <h2 className="text-lg sm:text-xl font-black">
                                    {pendingAction === 'Approved' ? 'Approve Leave' : 'Reject Leave'}
                                </h2>
                                <button 
                                    onClick={() => {
                                        setShowReasonModal(false);
                                        setAdminReason('');
                                        setPendingAction(null);
                                    }} 
                                    className="cursor-pointer hover:rotate-90 transition-transform"
                                >
                                    <FaTimesCircle className="text-2xl" />
                                </button>
                            </div>
                            <div className="p-5 sm:p-8">
                                <p className="text-sm text-gray-600 mb-4">
                                    Please provide a reason for your decision. This will be visible to the employee.
                                </p>
                                <textarea
                                    value={adminReason}
                                    onChange={(e) => setAdminReason(e.target.value)}
                                    placeholder="Enter your reason here..."
                                    className="w-full border-2 border-gray-300 rounded-xl p-3 focus:border-teal-500 outline-none resize-none text-sm"
                                    rows="5"
                                />
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => {
                                            setShowReasonModal(false);
                                            setAdminReason('');
                                            setPendingAction(null);
                                        }}
                                        className="cursor-pointer flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleStatusWithReason}
                                        className={`cursor-pointer flex-1 text-white py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 ${
                                            pendingAction === 'Approved' 
                                                ? 'bg-green-600 hover:bg-green-700' 
                                                : 'bg-red-500 hover:bg-red-600'
                                        }`}
                                    >
                                        Confirm {pendingAction === 'Approved' ? 'Approval' : 'Rejection'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => navigate('/admin-dashboard/')}
                    className="cursor-pointer mt-8 text-gray-400 hover:text-teal-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-colors"
                >
                    <FaArrowLeft /> Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default LeavesApproval;