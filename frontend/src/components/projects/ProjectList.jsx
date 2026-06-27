import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/authContext';
import {
    FaPlus, FaFolderOpen, FaUsers, FaClock, FaCheckCircle,
    FaPauseCircle, FaTimesCircle, FaEye, FaSearch, FaBell, FaLock
} from 'react-icons/fa';

const STATUS_CONFIG = {
    'Planning':    { color: 'bg-blue-100 text-blue-700',   icon: <FaClock className="text-xs" /> },
    'In Progress': { color: 'bg-amber-100 text-amber-700', icon: <FaFolderOpen className="text-xs" /> },
    'On Hold':     { color: 'bg-gray-100 text-gray-600',   icon: <FaPauseCircle className="text-xs" /> },
    'Completed':   { color: 'bg-green-100 text-green-700', icon: <FaCheckCircle className="text-xs" /> },
    'Closed':      { color: 'bg-red-100 text-red-700',     icon: <FaLock className="text-xs" /> },
};

const API = 'http://localhost:3000/api';

const ProjectList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const [projRes, invRes] = await Promise.all([
                axios.get(`${API}/project`, { headers }),
                axios.get(`${API}/project/invitations`, { headers })
            ]);
            if (projRes.data.success) setProjects(projRes.data.projects);
            if (invRes.data.success) setInvitations(invRes.data.invitations);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const isHead = (p) => {
        const headUserId = p.projectHead?.userId;
        if (!headUserId) return false;
        const headIdStr = typeof headUserId === 'object'
            ? (headUserId._id?.toString() || headUserId.toString())
            : headUserId.toString();
        return headIdStr === user?._id?.toString() || headIdStr === user?.id?.toString();
    };

    const getMyMemberEntry = (p) => {
        return p.members?.find(m => {
            const mUserId = typeof m.userId === 'object'
                ? (m.userId._id?.toString() || m.userId.toString())
                : m.userId.toString();
            return mUserId === user?._id?.toString() || mUserId === user?.id?.toString();
        });
    };

    const filtered = projects.filter(p => {
        const matchSearch =
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase());

        let matchStatus = false;
        if (statusFilter === 'All') {
            matchStatus = true;
        } else if (statusFilter === 'As Head') {
            matchStatus = isHead(p);
        } else if (statusFilter === 'As Member') {
            const myEntry = getMyMemberEntry(p);
            matchStatus = !isHead(p) && myEntry?.status === 'Accepted';
        } else if (statusFilter === 'Accepted') {
            const myEntry = getMyMemberEntry(p);
            matchStatus = !isHead(p) && myEntry?.status === 'Accepted';
        } else if (statusFilter === 'Rejected') {
            const myEntry = getMyMemberEntry(p);
            matchStatus = myEntry?.status === 'Rejected';
        } else {
            matchStatus = p.status === statusFilter;
        }

        return matchSearch && matchStatus;
    });

    const acceptedMembers = (p) => p.members?.filter(m => m.status === 'Accepted').length || 0;

    const acceptedCount = projects.filter(p => {
        const myEntry = getMyMemberEntry(p);
        return !isHead(p) && myEntry?.status === 'Accepted';
    }).length;

    const rejectedCount = projects.filter(p => {
        const myEntry = getMyMemberEntry(p);
        return myEntry?.status === 'Rejected';
    }).length;

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-slate-500 font-medium text-sm">Loading Projects...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
                            <FaFolderOpen className="text-teal-600" />
                            Projects
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Manage and track your projects</p>
                    </div>
                    <div className="flex gap-3">
                        {invitations.length > 0 && (
                            <button
                                onClick={() => navigate('/employee-dashboard/projects/invitations')}
                                className="relative bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                            >
                                <FaBell />
                                Invitations
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                                    {invitations.length}
                                </span>
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/employee-dashboard/projects/add')}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                        >
                            <FaPlus /> New Project
                        </button>
                    </div>
                </div>

                {/* Pending Invitations Banner */}
                {invitations.length > 0 && (
                    <div
                        onClick={() => navigate('/employee-dashboard/projects/invitations')}
                        className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-6 flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center animate-pulse">
                                <FaBell className="text-white" />
                            </div>
                            <div>
                                <p className="font-black text-amber-800 text-sm">
                                    You have {invitations.length} pending project invitation{invitations.length > 1 ? 's' : ''}
                                </p>
                                <p className="text-amber-600 text-xs">Click to view and respond</p>
                            </div>
                        </div>
                        <span className="text-amber-600 font-bold text-sm">View</span>
                    </div>
                )}

                {/* Filter Bar */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 flex flex-col gap-3">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500 transition-colors"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {['All', 'As Head', 'As Member'].map(f => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    statusFilter === f
                                        ? 'bg-teal-600 text-white shadow-md'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {f}
                            </button>
                        ))}

                        <span className="border-l border-slate-200 mx-1"></span>

                        <button
                            onClick={() => setStatusFilter('Accepted')}
                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                statusFilter === 'Accepted'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                        >
                            <FaCheckCircle className="text-[10px]" />
                            Accepted
                            {acceptedCount > 0 && (
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                                    statusFilter === 'Accepted' ? 'bg-white text-green-700' : 'bg-green-200 text-green-800'
                                }`}>
                                    {acceptedCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setStatusFilter('Rejected')}
                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                statusFilter === 'Rejected'
                                    ? 'bg-red-600 text-white shadow-md'
                                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                            }`}
                        >
                            <FaTimesCircle className="text-[10px]" />
                            Rejected
                            {rejectedCount > 0 && (
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                                    statusFilter === 'Rejected' ? 'bg-white text-red-700' : 'bg-red-200 text-red-800'
                                }`}>
                                    {rejectedCount}
                                </span>
                            )}
                        </button>

                        <span className="border-l border-slate-200 mx-1"></span>

                        {['Planning', 'In Progress', 'On Hold', 'Completed', 'Closed'].map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    statusFilter === s
                                        ? 'bg-teal-600 text-white shadow-md'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Project Grid */}
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-20 text-center">
                        <FaFolderOpen className="text-4xl text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-400 font-semibold">
                            {search || statusFilter !== 'All' ? 'No projects match your filters.' : 'No projects yet. Create your first one!'}
                        </p>
                        {!search && statusFilter === 'All' && (
                            <button
                                onClick={() => navigate('/employee-dashboard/projects/add')}
                                className="mt-4 bg-teal-600 text-white px-5 py-2 rounded-xl font-bold text-sm cursor-pointer hover:bg-teal-700"
                            >
                                + Create Project
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.map(project => {
                            const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG['Planning'];
                            const iAmHead   = isHead(project);
                            const myEntry   = getMyMemberEntry(project);
                            const accepted  = acceptedMembers(project);
                            const isClosed  = project.status === 'Closed';
                            const iRejected = !iAmHead && myEntry?.status === 'Rejected';

                            return (
                                <div key={project._id}
                                    className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden group ${
                                        isClosed  ? 'border-red-200 opacity-80' :
                                        iRejected ? 'border-red-200 opacity-70' :
                                        'border-slate-200'
                                    }`}
                                >
                                    <div className="p-5 pb-3">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1 min-w-0 mr-2">
                                                <h3 className="font-black text-slate-800 text-base truncate group-hover:text-teal-700 transition-colors">
                                                    {project.name}
                                                </h3>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {iAmHead && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                                                            Project Head
                                                        </span>
                                                    )}
                                                    {!iAmHead && myEntry?.status === 'Accepted' && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                                            <FaCheckCircle className="text-[8px]" /> Accepted
                                                        </span>
                                                    )}
                                                    {iRejected && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                                            <FaTimesCircle className="text-[8px]" /> Rejected
                                                        </span>
                                                    )}
                                                    {isClosed && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                                            <FaLock className="text-[8px]" /> Closed
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${statusCfg.color} whitespace-nowrap`}>
                                                {statusCfg.icon} {project.status}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                                            {project.description}
                                        </p>

                                        {project.technologies?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-3">
                                                {project.technologies.slice(0, 4).map((t, i) => (
                                                    <span key={i} className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                        {t}
                                                    </span>
                                                ))}
                                                {project.technologies.length > 4 && (
                                                    <span className="text-slate-400 text-[10px] font-bold">+{project.technologies.length - 4}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <FaUsers className="text-teal-500" />
                                                <span className="font-bold">{accepted}</span> members
                                            </span>
                                            {project.deadline && (
                                                <span className="flex items-center gap-1">
                                                    <FaClock className="text-orange-400" />
                                                    {new Date(project.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => navigate(`/employee-dashboard/projects/${project._id}`)}
                                            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer"
                                        >
                                            <FaEye /> View
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectList;