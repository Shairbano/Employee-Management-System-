import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    FaBell, FaCheckCircle, FaTimesCircle, FaClock, FaCrown,
    FaArrowLeft, FaFolderOpen
} from 'react-icons/fa';

const API = 'http://localhost:3000/api';

const ProjectInvitations = () => {
    const navigate = useNavigate();
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [respondingTo, setRespondingTo] = useState(null); // { projectId, memberId, action }
    const [rejectionReason, setRejectionReason] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // fetchInvitations logic
    const fetchInvitations = useCallback(async () => {
        // Move headers inside to resolve dependency error
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            const res = await axios.get(`${API}/project/invitations`, { headers });
            if (res.data.success) setInvitations(res.data.invitations);
        } catch { 
            setError('Failed to load invitations'); 
        } finally { 
            setLoading(false); 
        }
    }, []); // No dependencies needed now as headers are internal

    useEffect(() => { 
        fetchInvitations(); 
    }, [fetchInvitations]);

    const handleRespond = async () => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const { projectId, memberId, action } = respondingTo;
        if (action === 'Rejected' && !rejectionReason.trim()) {
            setError('Please provide a reason for rejection');
            return;
        }
        try {
            await axios.patch(
                `${API}/project/${projectId}/members/${memberId}/respond`,
                { action, rejectionReason: rejectionReason.trim() },
                { headers }
            );
            setSuccess(`You have ${action.toLowerCase()} the project invitation.`);
            setRespondingTo(null);
            setRejectionReason('');
            fetchInvitations();
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            setError(err.response?.data?.error || 'Response failed');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
                        <FaBell className="text-amber-500" /> Project Invitations
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {invitations.length > 0
                            ? `You have ${invitations.length} pending invitation${invitations.length > 1 ? 's' : ''}`
                            : 'No pending invitations'
                        }
                    </p>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm font-semibold">
                        ⚠ {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border-2 border-green-200 text-green-700 rounded-xl p-3 mb-4 text-sm font-semibold">
                        ✓ {success}
                    </div>
                )}

                {invitations.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-20 text-center">
                        <FaBell className="text-4xl text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 font-semibold">No pending invitations</p>
                        <p className="text-slate-300 text-sm mt-1">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {invitations.map(inv => (
                            <div key={inv._id} className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
                                {/* Invitation Header */}
                                <div className="bg-amber-50 px-5 py-4 border-b border-amber-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center">
                                            <FaFolderOpen className="text-white text-sm" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 text-base">{inv.projectName}</h3>
                                            <div className="flex items-center gap-1 text-xs text-amber-700 font-semibold">
                                                <FaClock className="text-[10px]" />
                                                Invited {new Date(inv.invitedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-black px-3 py-1 rounded-full border border-amber-200 animate-pulse">
                                        Pending
                                    </span>
                                </div>

                                <div className="p-5">
                                    {/* Project Details */}
                                    <p className="text-slate-600 text-sm leading-relaxed mb-4">{inv.projectDescription}</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                        <div className="bg-slate-50 rounded-xl p-3">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Project Head</p>
                                            <p className="font-bold text-slate-800 text-sm flex items-center gap-1">
                                                <FaCrown className="text-amber-500 text-xs" />
                                                {inv.projectHead?.userId?.name}
                                            </p>
                                        </div>
                                        <div className="bg-teal-50 rounded-xl p-3">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Your Role</p>
                                            <p className="font-black text-teal-700 text-sm">{inv.role}</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => { setRespondingTo({ projectId: inv.projectId, memberId: inv._id, action: 'Accepted' }); setError(''); }}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                                        >
                                            <FaCheckCircle /> Accept
                                        </button>
                                        <button
                                            onClick={() => { setRespondingTo({ projectId: inv.projectId, memberId: inv._id, action: 'Rejected' }); setError(''); }}
                                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                                        >
                                            <FaTimesCircle /> Decline
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <button onClick={() => navigate('/employee-dashboard/projects')}
                    className="mt-8 flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm cursor-pointer transition-colors">
                    <FaArrowLeft /> Back to Projects
                </button>
            </div>

            {/* Respond Modal */}
            {respondingTo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => { setRespondingTo(null); setRejectionReason(''); setError(''); }} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className={`px-6 py-4 flex items-center justify-between ${respondingTo.action === 'Accepted' ? 'bg-green-600' : 'bg-red-500'}`}>
                            <h3 className="text-white font-black text-lg flex items-center gap-2">
                                {respondingTo.action === 'Accepted'
                                    ? <><FaCheckCircle /> Accept Invitation</>
                                    : <><FaTimesCircle /> Decline Invitation</>
                                }
                            </h3>
                        </div>
                        <div className="p-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-xs font-semibold">
                                    {error}
                                </div>
                            )}

                            {respondingTo.action === 'Accepted' ? (
                                <div className="mb-6">
                                    <div className="bg-green-50 rounded-xl p-4 text-center">
                                        <FaCheckCircle className="text-green-500 text-3xl mx-auto mb-2" />
                                        <p className="text-slate-700 font-semibold text-sm">
                                            You're about to join this project. Are you sure?
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-6">
                                    <label className="block text-xs font-black text-slate-500 uppercase mb-2">
                                        Reason for Declining *
                                    </label>
                                    <textarea
                                        rows={4}
                                        placeholder="Please provide a reason for declining this invitation..."
                                        className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-red-400 transition-all resize-none"
                                        value={rejectionReason}
                                        onChange={e => { setRejectionReason(e.target.value); setError(''); }}
                                    />
                                    <p className="text-xs text-slate-400 mt-1">This will be visible to the project head</p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setRespondingTo(null); setRejectionReason(''); setError(''); }}
                                    className="flex-1 border-2 border-slate-200 text-slate-600 py-3 rounded-xl font-bold text-sm cursor-pointer hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRespond}
                                    className={`flex-1 text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all active:scale-95 ${
                                        respondingTo.action === 'Accepted'
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-red-500 hover:bg-red-600'
                                    }`}
                                >
                                    {respondingTo.action === 'Accepted'
                                        ? <><FaCheckCircle /> Confirm Accept</>
                                        : <><FaTimesCircle /> Confirm Decline</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectInvitations;