import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTimes, FaRocket } from 'react-icons/fa';

const API = 'http://localhost:3000/api';

const AddProject = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        description: '',
        technologies: '',
        deadline: '',
        status: 'Planning'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.name.trim()) return setError('Project name is required');
        if (!form.description.trim()) return setError('Project description is required');

        const techArray = form.technologies
            ? form.technologies.split(',').map(t => t.trim()).filter(Boolean)
            : [];

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API}/project`, {
                name: form.name,
                description: form.description,
                technologies: techArray,
                deadline: form.deadline || null,
                status: form.status
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (res.data.success) {
                navigate(`/employee-dashboard/projects/${res.data.project._id}`);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all bg-slate-50 focus:bg-white";
    const labelClass = "block text-xs font-black text-slate-500 uppercase tracking-wider mb-2";

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
            <div className="max-w-2xl mx-auto">

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="bg-linear-to-r from-teal-600 to-teal-700 p-6 sm:p-8">
                        <h1 className="text-2xl font-black text-white flex items-center gap-3">
                            <FaRocket /> Create New Project
                        </h1>
                        <p className="text-teal-200 text-sm mt-1">You will be the Project Head</p>
                    </div>

                    {/* Form */}
                    <div className="p-6 sm:p-8">
                        {error && (
                            <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-xl p-3 mb-6 text-sm font-semibold flex items-center gap-2">
                                <FaTimes /> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className={labelClass}>Project Name *</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="e.g. Website Redesign"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Description *</label>
                                <textarea
                                    className={inputClass}
                                    placeholder="Describe the project goals, scope, and deliverables..."
                                    rows={5}
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Status</label>
                                    {/*  Added Closed option */}
                                    <select
                                        className={inputClass}
                                        value={form.status}
                                        onChange={e => setForm({ ...form, status: e.target.value })}
                                    >
                                        <option value="Planning">Planning</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="On Hold">On Hold</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Deadline (optional)</label>
                                    <input
                                        type="date"
                                        className={inputClass}
                                        value={form.deadline}
                                        onChange={e => setForm({ ...form, deadline: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Technologies (comma-separated)</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="e.g. React, Node.js, MongoDB, Tailwind CSS"
                                    value={form.technologies}
                                    onChange={e => setForm({ ...form, technologies: e.target.value })}
                                />
                                <p className="text-slate-400 text-xs mt-1">Separate technologies with commas</p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => navigate('/employee-dashboard/projects')}
                                    className="flex-1 border-2 border-slate-200 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all cursor-pointer text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
                                    ) : (
                                        <><FaPlus /> Create Project</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/employee-dashboard/projects')}
                    className="mt-6 text-slate-500 hover:text-slate-800 font-semibold text-sm cursor-pointer transition-colors"
                >
                    ← Back to Projects
                </button>
            </div>
        </div>
    );
};

export default AddProject;