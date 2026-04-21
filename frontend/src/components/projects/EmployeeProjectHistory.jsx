import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FaFolderOpen, FaCrown, FaUsers, FaCheckCircle,
    FaTimesCircle, FaHourglassHalf, FaArrowLeft, FaCode
} from 'react-icons/fa';

const API = 'http://localhost:3000/api';

const STATUS_COLORS = {
    'Planning':    'bg-blue-100 text-blue-700',
    'In Progress': 'bg-amber-100 text-amber-700',
    'On Hold':     'bg-gray-100 text-gray-600',
    'Completed':   'bg-green-100 text-green-700',
};

const INVITE_STATUS_CONFIG = {
    'Accepted': { color: 'bg-green-100 text-green-700', icon: <FaCheckCircle /> },
    'Rejected': { color: 'bg-red-100 text-red-700',   icon: <FaTimesCircle /> },
    'Pending':  { color: 'bg-amber-100 text-amber-700', icon: <FaHourglassHalf /> },
};

const EmployeeProjectHistory = () => {
    const { id: employeeId } = useParams(); // Uses employee _id from route
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API}/project/employee/${employeeId}/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) setData(res.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load project history');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [employeeId]);

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error) return (
        <div className="p-8 text-center text-red-500 font-semibold">{error}</div>
    );

    if (!data) return null;

    const { employee, projectsAsHead, projectsAsMember } = data;

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <FaFolderOpen className="text-teal-600" />
                        Project History
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Employee: <span className="font-bold text-slate-700">{employee?.name}</span>
                        <span className="ml-2 text-xs bg-slate-200 px-2 py-0.5 rounded-full font-mono">{employee?.employeeId}</span>
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                    {[
                        { label: 'Projects Led', val: projectsAsHead.length, color: 'text-teal-600', bg: 'bg-teal-50' },
                        { label: 'Invited To', val: projectsAsMember.length, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Accepted', val: projectsAsMember.filter(p => p.inviteStatus === 'Accepted').length, color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Declined', val: projectsAsMember.filter(p => p.inviteStatus === 'Rejected').length, color: 'text-red-600', bg: 'bg-red-50' },
                    ].map((s, i) => (
                        <div key={i} className={`${s.bg} rounded-xl p-4 border border-white shadow-sm`}>
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{s.label}</p>
                            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                        </div>
                    ))}
                </div>

                {/* Projects as Head */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-amber-50">
                        <h2 className="font-black text-slate-800 flex items-center gap-2">
                            <FaCrown className="text-amber-500" /> Projects Led ({projectsAsHead.length})
                        </h2>
                    </div>
                    {projectsAsHead.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">No projects led yet</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {projectsAsHead.map(p => (
                                <div key={p.projectId} className="px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{p.projectName}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                                <FaUsers className="text-[10px]" /> {p.totalMembers} members
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${STATUS_COLORS[p.projectStatus]}`}>
                                        {p.projectStatus}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Projects as Member */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-blue-50">
                        <h2 className="font-black text-slate-800 flex items-center gap-2">
                            <FaUsers className="text-blue-500" /> Member Invitations ({projectsAsMember.length})
                        </h2>
                    </div>
                    {projectsAsMember.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">No project invitations</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {projectsAsMember.map((p, i) => {
                                const invCfg = INVITE_STATUS_CONFIG[p.inviteStatus] || INVITE_STATUS_CONFIG['Pending'];
                                return (
                                    <div key={i} className="px-6 py-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-800 text-sm truncate">{p.projectName}</p>
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    <span className="text-xs text-slate-500">
                                                        Role: <span className="font-semibold text-teal-600">{p.role}</span>
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        by {p.projectHead?.userId?.name || 'N/A'}
                                                    </span>
                                                </div>
                                                {p.inviteStatus === 'Rejected' && p.rejectionReason && (
                                                    <div className="mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                                        <p className="text-[10px] font-black text-red-500 uppercase mb-0.5">Decline Reason</p>
                                                        <p className="text-xs text-red-700 italic">"{p.rejectionReason}"</p>
                                                    </div>
                                                )}
                                                {p.respondedAt && (
                                                    <p className="text-[10px] text-slate-400 mt-1">
                                                        Responded: {new Date(p.respondedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${invCfg.color}`}>
                                                    {invCfg.icon} {p.inviteStatus}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[p.projectStatus]}`}>
                                                    {p.projectStatus}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <button onClick={() => navigate(-1)}
                    className="mt-8 flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm cursor-pointer transition-colors">
                    <FaArrowLeft /> Back
                </button>
            </div>
        </div>
    );
};

export default EmployeeProjectHistory;