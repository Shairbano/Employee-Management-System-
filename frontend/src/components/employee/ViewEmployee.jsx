import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaFolderOpen, FaCrown, FaUsers, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaUserCircle } from 'react-icons/fa';

const ViewEmployee = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [projectHistory, setProjectHistory] = useState(null);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [projectError, setProjectError] = useState('');

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:3000/api/employee/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setEmployee(res.data.employee);
                    console.log('Employee data:', res.data.employee);
                }
            } catch (err) {
                alert("Error fetching employee details");
                console.error("Employee fetch error:", err);
            }
        };

        const fetchProjectHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log('Fetching project history for employee ID:', id);

                const res = await axios.get(`http://localhost:3000/api/project/employee/${id}/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log('Project history response:', res.data);

                if (res.data.success) {
                    setProjectHistory(res.data);
                } else {
                    setProjectError('Unable to load project history');
                }
            } catch (err) {
                console.error("Project history fetch error:", err);
                console.error("Error response:", err.response?.data);
                setProjectError(err.response?.data?.error || 'Failed to load project history');
            } finally {
                setLoadingProjects(false);
            }
        };

        fetchEmployee();
        fetchProjectHistory();
    }, [id]);

    if (!employee) return (
        <div className="p-6 text-center text-gray-400 animate-pulse">Loading employee details...</div>
    );

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

    const fields = [
        { label: "Employee ID", value: employee.employeeId },
        { label: "Department", value: employee.department?.dep_name || "N/A" },
        { label: "Section", value: employee.section?.section_name || "N/A" },
        { label: "Salary", value: `$${employee.salary}` },
        { label: "Marital Status", value: employee.maritalStatus },
    ];

    // Derived counts from projectHistory
    const projectsLedCount    = projectHistory?.projectsAsHead?.length || 0;
    const invitedToCount      = projectHistory?.projectsAsMember?.length || 0;
    const acceptedCount       = projectHistory?.projectsAsMember?.filter(p => p.inviteStatus === 'Accepted').length || 0;
    const rejectedCount       = projectHistory?.projectsAsMember?.filter(p => p.inviteStatus === 'Rejected').length || 0;
    const pendingCount        = projectHistory?.projectsAsMember?.filter(p => p.inviteStatus === 'Pending').length || 0;

    // Reusable members list component
    const MembersList = ({ members }) => {
        if (!members || members.length === 0) return null;
        return (
            <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2 flex items-center gap-1">
                    <FaUsers className="text-[10px]" /> Team Members
                </p>
                <div className="flex flex-wrap gap-2">
                    {members.map((m, i) => {
                        const name = m.employeeId?.userId?.name || m.name || 'Unknown';
                        const role = m.role || '';
                        const status = m.inviteStatus || '';
                        const invCfg = INVITE_STATUS_CONFIG[status] || INVITE_STATUS_CONFIG['Pending'];
                        return (
                            <div key={i} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full pl-1 pr-2.5 py-1 shadow-sm">
                                <FaUserCircle className="text-gray-400 text-base shrink-0" />
                                <span className="text-xs font-semibold text-gray-700">{name}</span>
                                {role && (
                                    <span className="text-[10px] text-teal-600 font-bold">· {role}</span>
                                )}
                                {status && (
                                    <span className={`flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full ${invCfg.color}`}>
                                        {invCfg.icon} {status}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Profile Card */}
                <div className="bg-white rounded-lg shadow-md border p-6 sm:p-8">
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

                {/* Project History Section */}
                <div className="bg-white rounded-lg shadow-md border overflow-hidden">
                    <div className="bg-teal-600 px-6 py-4">
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            <FaFolderOpen /> Project History
                        </h3>
                    </div>

                    {loadingProjects ? (
                        <div className="p-8 text-center">
                            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-gray-400 text-sm mt-2">Loading projects...</p>
                        </div>
                    ) : projectError ? (
                        <div className="p-8 text-center">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
                                <FaTimesCircle className="text-red-500 text-2xl mx-auto mb-2" />
                                <p className="text-red-600 text-sm font-semibold">{projectError}</p>
                            </div>
                        </div>
                    ) : !projectHistory ? (
                        <div className="p-8 text-center text-gray-400">
                            <p>Unable to load project history</p>
                        </div>
                    ) : (
                        <div className="p-6">
                            {/* Summary Stats — now 6 cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                                {[
                                    { label: 'Projects Led', val: projectsLedCount,  color: 'text-teal-600',   bg: 'bg-teal-50'  },
                                    { label: 'Invited To',   val: invitedToCount,    color: 'text-blue-600',   bg: 'bg-blue-50'  },
                                    { label: 'Accepted',     val: acceptedCount,     color: 'text-green-600',  bg: 'bg-green-50' },
                                    { label: 'Rejected',     val: rejectedCount,     color: 'text-red-600',    bg: 'bg-red-50'   },
                                    { label: 'Pending',      val: pendingCount,      color: 'text-amber-600',  bg: 'bg-amber-50' },
                                    { label: 'Total',        val: projectsLedCount + invitedToCount, color: 'text-slate-700', bg: 'bg-slate-50' },
                                ].map((s, i) => (
                                    <div key={i} className={`${s.bg} rounded-xl p-4 border border-white shadow-sm`}>
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">{s.label}</p>
                                        <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Projects as Head */}
                            {projectHistory.projectsAsHead && projectHistory.projectsAsHead.length > 0 && (
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FaCrown className="text-amber-500" />
                                        <h4 className="font-bold text-gray-800">Projects Led ({projectHistory.projectsAsHead.length})</h4>
                                    </div>
                                    <div className="space-y-2">
                                        {projectHistory.projectsAsHead.map(p => (
                                            <div key={p.projectId} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-800">{p.projectName}</p>
                                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <FaUsers className="text-[10px]" /> {p.totalMembers} members
                                                            </span>
                                                            <span>
                                                                Created: {new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </span>
                                                        </div>
                                                        {/* Members list for projects led */}
                                                        <MembersList members={p.members} />
                                                    </div>
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${STATUS_COLORS[p.projectStatus]}`}>
                                                        {p.projectStatus}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Projects as Member */}
                            {projectHistory.projectsAsMember && projectHistory.projectsAsMember.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <FaUsers className="text-blue-500" />
                                        <h4 className="font-bold text-gray-800">Member Invitations ({projectHistory.projectsAsMember.length})</h4>
                                    </div>

                                    {/* Accepted invitations */}
                                    {projectHistory.projectsAsMember.filter(p => p.inviteStatus === 'Accepted').length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-[11px] font-black text-green-600 uppercase flex items-center gap-1 mb-2">
                                                <FaCheckCircle /> Accepted ({acceptedCount})
                                            </p>
                                            <div className="space-y-2">
                                                {projectHistory.projectsAsMember.filter(p => p.inviteStatus === 'Accepted').map((p, i) => {
                                                    const invCfg = INVITE_STATUS_CONFIG['Accepted'];
                                                    return (
                                                        <div key={i} className="border border-green-100 bg-green-50 rounded-lg p-4">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="flex-1">
                                                                    <p className="font-bold text-gray-800">{p.projectName}</p>
                                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                                        <span className="text-xs text-gray-500">
                                                                            Role: <span className="font-semibold text-teal-600">{p.role}</span>
                                                                        </span>
                                                                        <span className="text-xs text-gray-400">
                                                                            by {p.projectHead?.userId?.name || 'N/A'}
                                                                        </span>
                                                                    </div>
                                                                    {p.respondedAt && (
                                                                        <p className="text-[10px] text-gray-400 mt-1">
                                                                            Responded: {new Date(p.respondedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                        </p>
                                                                    )}
                                                                    <MembersList members={p.members} />
                                                                </div>
                                                                <div className="flex flex-col items-end gap-1">
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
                                        </div>
                                    )}

                                    {/* Rejected invitations */}
                                    {projectHistory.projectsAsMember.filter(p => p.inviteStatus === 'Rejected').length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-[11px] font-black text-red-600 uppercase flex items-center gap-1 mb-2">
                                                <FaTimesCircle /> Rejected ({rejectedCount})
                                            </p>
                                            <div className="space-y-2">
                                                {projectHistory.projectsAsMember.filter(p => p.inviteStatus === 'Rejected').map((p, i) => {
                                                    const invCfg = INVITE_STATUS_CONFIG['Rejected'];
                                                    return (
                                                        <div key={i} className="border border-red-100 bg-red-50 rounded-lg p-4">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="flex-1">
                                                                    <p className="font-bold text-gray-800">{p.projectName}</p>
                                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                                        <span className="text-xs text-gray-500">
                                                                            Role: <span className="font-semibold text-teal-600">{p.role}</span>
                                                                        </span>
                                                                        <span className="text-xs text-gray-400">
                                                                            by {p.projectHead?.userId?.name || 'N/A'}
                                                                        </span>
                                                                    </div>
                                                                    {p.rejectionReason && (
                                                                        <div className="mt-2 bg-white border border-red-200 rounded-lg px-3 py-2">
                                                                            <p className="text-[10px] font-black text-red-500 uppercase mb-0.5">Decline Reason</p>
                                                                            <p className="text-xs text-red-700 italic">"{p.rejectionReason}"</p>
                                                                        </div>
                                                                    )}
                                                                    {p.respondedAt && (
                                                                        <p className="text-[10px] text-gray-400 mt-1">
                                                                            Responded: {new Date(p.respondedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                        </p>
                                                                    )}
                                                                    <MembersList members={p.members} />
                                                                </div>
                                                                <div className="flex flex-col items-end gap-1">
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
                                        </div>
                                    )}

                                    {/* Pending invitations */}
                                    {projectHistory.projectsAsMember.filter(p => p.inviteStatus === 'Pending').length > 0 && (
                                        <div>
                                            <p className="text-[11px] font-black text-amber-600 uppercase flex items-center gap-1 mb-2">
                                                <FaHourglassHalf /> Pending ({pendingCount})
                                            </p>
                                            <div className="space-y-2">
                                                {projectHistory.projectsAsMember.filter(p => p.inviteStatus === 'Pending').map((p, i) => {
                                                    const invCfg = INVITE_STATUS_CONFIG['Pending'];
                                                    return (
                                                        <div key={i} className="border border-gray-200 rounded-lg p-4">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="flex-1">
                                                                    <p className="font-bold text-gray-800">{p.projectName}</p>
                                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                                        <span className="text-xs text-gray-500">
                                                                            Role: <span className="font-semibold text-teal-600">{p.role}</span>
                                                                        </span>
                                                                        <span className="text-xs text-gray-400">
                                                                            by {p.projectHead?.userId?.name || 'N/A'}
                                                                        </span>
                                                                    </div>
                                                                    <MembersList members={p.members} />
                                                                </div>
                                                                <div className="flex flex-col items-end gap-1">
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
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* No Projects State */}
                            {(!projectHistory.projectsAsHead || projectHistory.projectsAsHead.length === 0) &&
                             (!projectHistory.projectsAsMember || projectHistory.projectsAsMember.length === 0) && (
                                <div className="text-center py-12 text-gray-400">
                                    <FaFolderOpen className="text-4xl mx-auto mb-3 opacity-30" />
                                    <p className="font-semibold">No project history available</p>
                                    <p className="text-sm mt-1">This employee hasn't been involved in any projects yet</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="max-w-6xl mx-auto">
                    <button
                        onClick={() => navigate('/admin-dashboard/employees')}
                        className="mt-6 text-gray-500 hover:text-black font-semibold flex items-center gap-2 cursor-pointer text-sm"
                    >
                        ← Back to Employees
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewEmployee;