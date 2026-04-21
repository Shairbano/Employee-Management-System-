import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/authContext';
import {
    FaUsers, FaUserPlus, FaTrash, FaEdit, FaSave, FaTimes,
    FaSearch, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf,
    FaCrown, FaCode, FaCalendarAlt, FaArrowLeft, FaFolderOpen, FaUser
} from 'react-icons/fa';

const API = 'http://localhost:3000/api';

const STATUS_COLORS = {
    'Planning':    'bg-blue-100 text-blue-700 border-blue-200',
    'In Progress': 'bg-amber-100 text-amber-700 border-amber-200',
    'On Hold':     'bg-gray-100 text-gray-600 border-gray-200',
    'Completed':   'bg-green-100 text-green-700 border-green-200',
};

const MEMBER_STATUS_ICON = {
    'Pending':  <FaHourglassHalf className="text-amber-500" />,
    'Accepted': <FaCheckCircle className="text-green-500" />,
    'Rejected': <FaTimesCircle className="text-red-500" />,
};

// ── Reusable avatar: shows profile photo if available, else coloured initial ──
const Avatar = ({ image, name, size = 'md', bgColor = 'bg-teal-500' }) => {
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
    };
    return image ? (
        <img
            src={image}
            alt={name}
            className={`${sizes[size]} rounded-full object-cover border-2 border-white shadow-sm shrink-0`}
        />
    ) : (
        <div className={`${sizes[size]} ${bgColor} rounded-full flex items-center justify-center font-black text-white shrink-0`}>
            {name?.charAt(0)?.toUpperCase() || <FaUser className="text-xs" />}
        </div>
    );
};

const ProjectDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Add member state
    const [showAddMember, setShowAddMember] = useState(false);
    const [memberSearch, setMemberSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [memberRole, setMemberRole] = useState('');
    const [addingMember, setAddingMember] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const searchTimeout = useRef(null);

    const fetchProject = useCallback(async () => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const res = await axios.get(`${API}/project/${id}`, { headers });
            if (res.data.success) {
                setProject(res.data.project);
                const p = res.data.project;
                setEditForm({
                    name: p.name,
                    description: p.description,
                    technologies: p.technologies?.join(', ') || '',
                    deadline: p.deadline ? p.deadline.split('T')[0] : '',
                    status: p.status
                });
            }
        } catch (err) {
            setError('Failed to load project');
            console.log(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchProject(); }, [fetchProject]);

    const isHead = project && (
        project.projectHead?.userId?._id === user?._id ||
        project.projectHead?.userId === user?._id
    );

    // Debounced employee search
    useEffect(() => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        if (!memberSearch.trim()) { setSearchResults([]); return; }
        clearTimeout(searchTimeout.current);
        setSearchLoading(true);
        searchTimeout.current = setTimeout(async () => {
            try {
                const res = await axios.get(`${API}/project/search`, {
                    params: { q: memberSearch, projectId: id },
                    headers
                });
                if (res.data.success) setSearchResults(res.data.employees);
            } catch { setSearchResults([]); }
            finally { setSearchLoading(false); }
        }, 350);
    }, [memberSearch, id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        setError(''); setSuccess('');
        try {
            const techArr = editForm.technologies
                ? editForm.technologies.split(',').map(t => t.trim()).filter(Boolean)
                : [];
            await axios.put(`${API}/project/${id}`, { ...editForm, technologies: techArr }, { headers });
            setSuccess('Project updated!');
            setEditing(false);
            fetchProject();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Update failed');
        }
    };

    const handleAddMember = async () => {
        if (!selectedEmployee || !memberRole.trim()) return;
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        setAddingMember(true);
        try {
            await axios.post(`${API}/project/${id}/members`, {
                employeeId: selectedEmployee._id,
                role: memberRole
            }, { headers });
            setSuccess('Invitation sent!');
            setShowAddMember(false);
            setSelectedEmployee(null);
            setMemberRole('');
            setMemberSearch('');
            setSearchResults([]);
            fetchProject();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add member');
        } finally {
            setAddingMember(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm('Remove this member from the project?')) return;
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            await axios.delete(`${API}/project/${id}/members/${memberId}`, { headers });
            fetchProject();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to remove member');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this project permanently?')) return;
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            await axios.delete(`${API}/project/${id}`, { headers });
            navigate('/employee-dashboard/projects');
        } catch (err) {
            setError(err.response?.data?.error || 'Delete failed');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!project) return (
        <div className="p-8 text-center text-slate-500">Project not found.</div>
    );

    const accepted = project.members?.filter(m => m.status === 'Accepted') || [];
    const pending  = project.members?.filter(m => m.status === 'Pending')  || [];
    const rejected = project.members?.filter(m => m.status === 'Rejected') || [];

    const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all bg-slate-50 focus:bg-white";

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Alerts */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-xl p-3 text-sm font-semibold flex items-center justify-between">
                        <span>⚠ {error}</span>
                        <button onClick={() => setError('')} className="cursor-pointer"><FaTimes /></button>
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border-2 border-green-200 text-green-700 rounded-xl p-3 text-sm font-semibold flex items-center justify-between">
                        <span>✓ {success}</span>
                        <button onClick={() => setSuccess('')} className="cursor-pointer"><FaTimes /></button>
                    </div>
                )}

                {/* ── PROJECT HEADER ── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-linear-to-r from-slate-800 to-slate-700 p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex-1">
                                {!editing ? (
                                    <>
                                        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                                            <FaFolderOpen className="text-teal-400" />
                                            {project.name}
                                        </h1>
                                        <span className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-black border ${STATUS_COLORS[project.status]}`}>
                                            {project.status}
                                        </span>
                                    </>
                                ) : (
                                    <input
                                        className="text-2xl font-black bg-white/10 text-white border-b-2 border-teal-400 outline-none w-full pb-1"
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    />
                                )}
                                <div className="flex flex-wrap gap-4 mt-3 text-slate-400 text-xs">
                                    <span className="flex items-center gap-2">
                                        <FaCrown className="text-amber-400" />
                                        Head:
                                        <span className="text-white font-bold flex items-center gap-1.5">
                                            <Avatar
                                                image={project.projectHead?.employeeId?.image}
                                                name={project.projectHead?.userId?.name}
                                                size="sm"
                                                bgColor="bg-amber-400"
                                            />
                                            {project.projectHead?.userId?.name}
                                        </span>
                                    </span>
                                    {project.deadline && (
                                        <span className="flex items-center gap-1">
                                            <FaCalendarAlt />
                                            Deadline: <span className="text-white ml-1">{new Date(project.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <FaUsers />
                                        <span className="text-white">{accepted.length}</span> Active Members
                                    </span>
                                </div>
                            </div>
                            {isHead && (
                                <div className="flex gap-2">
                                    {editing ? (
                                        <>
                                            <button onClick={handleUpdate} className="bg-teal-500 hover:bg-teal-400 text-white p-2.5 rounded-xl cursor-pointer transition-all" title="Save">
                                                <FaSave />
                                            </button>
                                            <button onClick={() => setEditing(false)} className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl cursor-pointer" title="Cancel">
                                                <FaTimes />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => setEditing(true)} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all">
                                                <FaEdit /> Edit
                                            </button>
                                            <button onClick={handleDelete} className="bg-red-500/20 hover:bg-red-500/40 text-red-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all">
                                                <FaTrash /> Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Project Body */}
                    <div className="p-6 sm:p-8">
                        {editing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase mb-1">Description</label>
                                    <textarea className={inputClass} rows={4} value={editForm.description}
                                        onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase mb-1">Status</label>
                                        <select className={inputClass} value={editForm.status}
                                            onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                                            {['Planning', 'In Progress', 'On Hold', 'Completed'].map(s => (
                                                <option key={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase mb-1">Deadline</label>
                                        <input type="date" className={inputClass} value={editForm.deadline}
                                            onChange={e => setEditForm({ ...editForm, deadline: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase mb-1">Technologies (comma-separated)</label>
                                    <input className={inputClass} value={editForm.technologies}
                                        onChange={e => setEditForm({ ...editForm, technologies: e.target.value })} />
                                </div>
                                <button onClick={handleUpdate}
                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg">
                                    <FaSave /> Save Changes
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="text-slate-600 leading-relaxed text-sm">{project.description}</p>
                                {project.technologies?.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {project.technologies.map((t, i) => (
                                            <span key={i} className="flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">
                                                <FaCode className="text-teal-500 text-[10px]" /> {t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* ── MEMBERS SECTION ── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-black text-slate-800 flex items-center gap-2">
                            <FaUsers className="text-teal-600" /> Team Members
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-1">
                                {accepted.length} active
                            </span>
                        </h2>
                        {isHead && (
                            <button
                                onClick={() => setShowAddMember(true)}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                            >
                                <FaUserPlus /> Add Member
                            </button>
                        )}
                    </div>

                    <div className="p-6">
                        {/* ── Project Head ── */}
                        <div className="mb-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Project Head</p>
                            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                                <Avatar
                                    image={project.projectHead?.employeeId?.image}
                                    name={project.projectHead?.userId?.name}
                                    size="md"
                                    bgColor="bg-amber-400"
                                />
                                <div>
                                    <p className="font-black text-slate-800 text-sm">{project.projectHead?.userId?.name}</p>
                                    <p className="text-slate-500 text-xs">{project.projectHead?.userId?.email}</p>
                                </div>
                                <span className="ml-auto flex items-center gap-1 text-amber-600 text-xs font-black">
                                    <FaCrown /> Head
                                </span>
                            </div>
                        </div>

                        {/* ── Active Members ── */}
                        {accepted.length > 0 && (
                            <div className="mb-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Active Members ({accepted.length})</p>
                                <div className="space-y-2">
                                    {accepted.map(m => (
                                        <div key={m._id} className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
                                            <Avatar
                                                image={m.employeeId?.image}
                                                name={m.userId?.name}
                                                size="md"
                                                bgColor="bg-teal-500"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-800 text-sm truncate">{m.userId?.name}</p>
                                                <p className="text-teal-600 text-xs font-semibold">{m.role}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {MEMBER_STATUS_ICON[m.status]}
                                                {isHead && (
                                                    <button
                                                        onClick={() => handleRemoveMember(m._id)}
                                                        className="text-red-400 hover:text-red-600 cursor-pointer p-1 transition-colors"
                                                        title="Remove member"
                                                    >
                                                        <FaTrash className="text-xs" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Pending Members ── */}
                        {pending.length > 0 && (
                            <div className="mb-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Pending Invitations ({pending.length})</p>
                                <div className="space-y-2">
                                    {pending.map(m => (
                                        <div key={m._id} className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 opacity-80">
                                            <Avatar
                                                image={m.employeeId?.image}
                                                name={m.userId?.name}
                                                size="md"
                                                bgColor="bg-amber-300"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-700 text-sm truncate">{m.userId?.name}</p>
                                                <p className="text-slate-500 text-xs">{m.role} · Awaiting response</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {MEMBER_STATUS_ICON[m.status]}
                                                {isHead && (
                                                    <button onClick={() => handleRemoveMember(m._id)}
                                                        className="text-red-400 hover:text-red-600 cursor-pointer p-1">
                                                        <FaTrash className="text-xs" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Rejected Members ── */}
                        {rejected.length > 0 && (
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Declined ({rejected.length})</p>
                                <div className="space-y-2">
                                    {rejected.map(m => (
                                        <div key={m._id} className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3 opacity-70">
                                            <Avatar
                                                image={m.employeeId?.image}
                                                name={m.userId?.name}
                                                size="md"
                                                bgColor="bg-red-300"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-700 text-sm truncate">{m.userId?.name}</p>
                                                <p className="text-xs text-slate-500">{m.role}</p>
                                                {m.rejectionReason && (
                                                    <p className="text-xs text-red-600 mt-0.5 italic">"{m.rejectionReason}"</p>
                                                )}
                                            </div>
                                            <FaTimesCircle className="text-red-400 text-sm shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {project.members?.length === 0 && (
                            <div className="text-center py-8 text-slate-400">
                                <FaUsers className="text-3xl mx-auto mb-2 opacity-30" />
                                <p className="text-sm font-semibold">No members yet</p>
                                {isHead && <p className="text-xs mt-1">Click "Add Member" to invite team members</p>}
                            </div>
                        )}
                    </div>
                </div>

                <button onClick={() => navigate('/employee-dashboard/projects')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm cursor-pointer transition-colors">
                    <FaArrowLeft /> Back to Projects
                </button>
            </div>

            {/* ── Add Member Modal ── */}
            {showAddMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => {
                        setShowAddMember(false); setSelectedEmployee(null); setMemberRole('');
                        setMemberSearch(''); setSearchResults([]);
                    }} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-teal-600 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-white font-black text-lg flex items-center gap-2">
                                <FaUserPlus /> Add Team Member
                            </h3>
                            <button onClick={() => { setShowAddMember(false); setSelectedEmployee(null); setMemberRole(''); setMemberSearch(''); setSearchResults([]); }}
                                className="text-white hover:rotate-90 transition-transform cursor-pointer">
                                <FaTimes className="text-xl" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2">Search Employee</label>
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500 transition-all"
                                        value={memberSearch}
                                        onChange={e => { setMemberSearch(e.target.value); setSelectedEmployee(null); }}
                                    />
                                </div>

                                {searchLoading && (
                                    <div className="mt-2 text-center text-xs text-slate-400">Searching...</div>
                                )}
                                {searchResults.length > 0 && !selectedEmployee && (
                                    <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                                        {searchResults.map(emp => (
                                            <button
                                                key={emp._id}
                                                onClick={() => { setSelectedEmployee(emp); setMemberSearch(emp.userId?.name); setSearchResults([]); }}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-teal-50 transition-colors text-left border-b border-slate-100 last:border-0 cursor-pointer"
                                            >
                                                {/* Show real photo in search results too */}
                                                <Avatar image={emp.image} name={emp.userId?.name} size="sm" bgColor="bg-teal-500" />
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-800 text-sm truncate">{emp.userId?.name}</p>
                                                    <p className="text-xs text-slate-500 truncate">{emp.department?.dep_name} · {emp.designation?.designation_name}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {memberSearch && !searchLoading && searchResults.length === 0 && !selectedEmployee && (
                                    <p className="mt-2 text-center text-xs text-slate-400">No employees found</p>
                                )}
                            </div>

                            {/* Selected Employee */}
                            {selectedEmployee && (
                                <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-3 flex items-center gap-3">
                                    <Avatar image={selectedEmployee.image} name={selectedEmployee.userId?.name} size="md" bgColor="bg-teal-500" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-slate-800 text-sm">{selectedEmployee.userId?.name}</p>
                                        <p className="text-xs text-slate-500">{selectedEmployee.department?.dep_name}</p>
                                    </div>
                                    <button onClick={() => { setSelectedEmployee(null); setMemberSearch(''); }}
                                        className="text-slate-400 hover:text-red-500 cursor-pointer transition-colors">
                                        <FaTimes />
                                    </button>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2">Role in Project *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Frontend Developer, UI Designer, QA..."
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-500 transition-all"
                                    value={memberRole}
                                    onChange={e => setMemberRole(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button onClick={() => { setShowAddMember(false); setSelectedEmployee(null); setMemberRole(''); setMemberSearch(''); setSearchResults([]); }}
                                    className="flex-1 border-2 border-slate-200 text-slate-600 py-3 rounded-xl font-bold text-sm cursor-pointer hover:bg-slate-50 transition-all">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddMember}
                                    disabled={!selectedEmployee || !memberRole.trim() || addingMember}
                                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                                >
                                    {addingMember ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : <><FaUserPlus /> Send Invite</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetail;