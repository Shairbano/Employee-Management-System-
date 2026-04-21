import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/authContext';
import {
    FaPlus, FaFolderOpen, FaUsers, FaClock, FaCheckCircle,
    FaPauseCircle, FaTimesCircle, FaEye, FaSearch, FaBell
} from 'react-icons/fa';

const STATUS_CONFIG = {
    'Planning':     { color: 'bg-blue-100 text-blue-700',   icon: <FaClock className="text-xs" /> },
    'In Progress': { color: 'bg-amber-100 text-amber-700', icon: <FaFolderOpen className="text-xs" /> },
    'On Hold':      { color: 'bg-gray-100 text-gray-600',   icon: <FaPauseCircle className="text-xs" /> },
    'Completed':   { color: 'bg-green-100 text-green-700', icon: <FaCheckCircle className="text-xs" /> },
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

    const isHead = (p) => p.projectHead?.userId?._id === user?._id ||
        p.projectHead?.userId === user?._id;

    const filtered = projects.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase());
        
        // Logical check for filters
        let matchStatus = false;
        if (statusFilter === 'All') {
            matchStatus = true;
        } else if (statusFilter === 'As Head') {
            matchStatus = isHead(p);
        } else {
            matchStatus = p.status === statusFilter;
        }

        return matchSearch && matchStatus;
    });

    const acceptedMembers = (p) => p.members?.filter(m => m.status === 'Accepted').length || 0;

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
                        <span className="text-amber-600 font-bold text-sm">View →</span>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500 transition-colors"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {['All', 'Planning', 'In Progress', 'On Hold', 'Completed'].map(s => (
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

                {/* Stats Row (Clickable Cards) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: 'Total', val: projects.length, filter: 'All', color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' },
                        { label: 'Active', val: projects.filter(p => p.status === 'In Progress').length, filter: 'In Progress', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                        { label: 'Completed', val: projects.filter(p => p.status === 'Completed').length, filter: 'Completed', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
                        { label: 'As Head', val: projects.filter(p => isHead(p)).length, filter: 'As Head', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
                    ].map((s, i) => (
                        <div 
                            key={i} 
                            onClick={() => setStatusFilter(s.filter)}
                            className={`${s.bg} ${s.border} rounded-xl p-3 border shadow-sm cursor-pointer transition-all hover:shadow-md active:scale-95 group ${statusFilter === s.filter ? 'ring-2 ring-teal-500 ring-offset-1' : ''}`}
                        >
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1 group-hover:text-slate-600">{s.label}</p>
                            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                        </div>
                    ))}
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
                            const iAmHead = isHead(project);
                            const accepted = acceptedMembers(project);

                            return (
                                <div key={project._id}
                                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                                >
                                    {/* Card Top */}
                                    <div className="p-5 pb-3">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1 min-w-0 mr-2">
                                                <h3 className="font-black text-slate-800 text-base truncate group-hover:text-teal-700 transition-colors">
                                                    {project.name}
                                                </h3>
                                                {iAmHead && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full mt-1">
                                                         Project Head
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${statusCfg.color} whitespace-nowrap`}>
                                                {statusCfg.icon} {project.status}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                                            {project.description}
                                        </p>

                                        {/* Technologies */}
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

                                    {/* Card Bottom */}
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