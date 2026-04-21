import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import axios from 'axios';
import { FaCalendarDay, FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Memoized Row Component
const AttendanceRow = memo(({ emp, current, onStatusChange, onTimeChange, onSave, isWeekend }) => {
    const isOnLeave = emp.leaveStatus;
    // Row is disabled if the employee is on leave OR if it is a weekend
    const isDisabled = isOnLeave || isWeekend;
    const isAbsent = ['Absent', 'On Leave'].includes(current?.status);

    return (
        <>
            {/* ── DESKTOP ROW (md+) ── */}
            <tr className="hidden md:table-row hover:bg-teal-50/20 transition-colors border-b">
                <td className="p-4 lg:p-5">
                    <div className="font-bold text-gray-800">{emp.userId.name}</div>
                    <div className="text-xs text-teal-600 font-bold">ID: {emp.employeeId}</div>
                </td>
                <td className="p-4 lg:p-5 text-sm text-gray-600 font-medium">
                    {emp.department?.dep_name || "N/A"}
                </td>
                <td className="p-4 lg:p-5">
                    <select
                        disabled={isDisabled}
                        value={current?.status || ""}
                        onChange={(e) => onStatusChange(emp._id, e.target.value)}
                        className="p-2 border rounded text-sm w-full lg:w-40 bg-white font-semibold outline-none focus:border-teal-500 disabled:bg-gray-100"
                    >
                        <option value="">-- Select --</option>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Half-Day">Half Day</option>
                        <option value="Late">Late Comer</option>
                        {isOnLeave && <option value="On Leave">On Leave</option>}
                    </select>
                </td>
                <td className="p-4 lg:p-5">
                    <input
                        type="time"
                        value={current?.checkIn || ""}
                        disabled={isAbsent || !current?.status || isWeekend}
                        onChange={(e) => onTimeChange(emp._id, 'checkIn', e.target.value)}
                        className="p-2 border rounded text-sm w-full lg:w-32 disabled:bg-gray-100"
                    />
                </td>
                <td className="p-4 lg:p-5">
                    <input
                        type="time"
                        value={current?.checkOut || ""}
                        disabled={isAbsent || !current?.status || isWeekend}
                        onChange={(e) => onTimeChange(emp._id, 'checkOut', e.target.value)}
                        className="p-2 border rounded text-sm w-full lg:w-32 disabled:bg-gray-100"
                    />
                </td>
                <td className="p-4 lg:p-5 text-center">
                    <button
                        onClick={() => onSave(emp._id)}
                        disabled={!current?.status || isWeekend}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        <FaSave className="inline mr-2" /> Save
                    </button>
                </td>
            </tr>

            {/* ── MOBILE CARD (below md) ── */}
            <tr className="md:hidden">
                <td colSpan="6" className="p-0">
                    <div className="m-2 rounded-xl border bg-white border-teal-100 shadow-sm">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                            <div>
                                <p className="font-bold text-gray-800 text-sm">{emp.userId.name}</p>
                                <p className="text-xs text-teal-600 font-bold">ID: {emp.employeeId}</p>
                            </div>
                            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
                                {emp.department?.dep_name || "N/A"}
                            </span>
                        </div>

                        <div className="px-4 py-3 grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Status</label>
                                <select
                                    disabled={isDisabled}
                                    value={current?.status || ""}
                                    onChange={(e) => onStatusChange(emp._id, e.target.value)}
                                    className="w-full p-2 border rounded-lg text-sm bg-white font-semibold outline-none focus:border-teal-500 disabled:bg-gray-100"
                                >
                                    <option value="">-- Select Status --</option>
                                    <option value="Present">Present</option>
                                    <option value="Absent">Absent</option>
                                    <option value="Half-Day">Half Day</option>
                                    <option value="Late">Late Comer</option>
                                    {isOnLeave && <option value="On Leave">On Leave</option>}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Entry Time</label>
                                <input
                                    type="time"
                                    value={current?.checkIn || ""}
                                    disabled={isAbsent || !current?.status || isWeekend}
                                    onChange={(e) => onTimeChange(emp._id, 'checkIn', e.target.value)}
                                    className="w-full p-2 border rounded-lg text-sm disabled:bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Exit Time</label>
                                <input
                                    type="time"
                                    value={current?.checkOut || ""}
                                    disabled={isAbsent || !current?.status || isWeekend}
                                    onChange={(e) => onTimeChange(emp._id, 'checkOut', e.target.value)}
                                    className="w-full p-2 border rounded-lg text-sm disabled:bg-gray-100"
                                />
                            </div>
                        </div>

                        <div className="px-4 pb-3">
                            <button
                                onClick={() => onSave(emp._id)}
                                disabled={!current?.status || isWeekend}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <FaSave /> Save
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        </>
    );
});

const Attendance = () => {
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [today] = useState(() => new Date().toISOString().split('T')[0]);

    // Check if today is Saturday (6) or Sunday (0)
    const isWeekend = useMemo(() => {
        const day = new Date(today).getDay();
        return day === 0 || day === 6;
    }, [today]);

    const fetchData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const [empRes, leaveRes, attendRes] = await Promise.all([
                axios.get('http://localhost:3000/api/employee', { headers }),
                axios.get('http://localhost:3000/api/leave', { headers }),
                axios.get(`http://localhost:3000/api/attendance/fetch?date=${today}`, { headers })
            ]);

            if (empRes.data.success) {
                const rawEmployees = empRes.data.employees;
                const leaves = leaveRes.data.leaves || [];
                const existingAttendance = attendRes.data.records || [];

                const leaveMap = new Map();
                leaves.forEach(l => {
                    if (l.employeeId?._id && l.status === 'Approved') {
                        const start = l.startDate.split('T')[0];
                        const end = l.endDate.split('T')[0];
                        if (today >= start && today <= end) leaveMap.set(l.employeeId._id, 'On Leave');
                    }
                });

                const attendMap = new Map();
                existingAttendance.forEach(r => { if (r.employeeId?._id) attendMap.set(r.employeeId._id, r); });

                const initialAttendance = {};
                const processed = rawEmployees.map(emp => {
                    const leaveStatus = leaveMap.get(emp._id) || null;
                    const dbRecord = attendMap.get(emp._id) || null;
                    
                    const defaultCheckIn = '09:00';
                    const defaultCheckOut = '17:00';
                    
                    initialAttendance[emp._id] = {
                        // If it's a weekend, we might want to keep it empty OR still default to 'Present'
                        // but since buttons are disabled, user can't save anyway.
                        status: leaveStatus || dbRecord?.status || (isWeekend ? "" : "Present"),
                        checkIn: dbRecord?.checkIn || defaultCheckIn,
                        checkOut: dbRecord?.checkOut || defaultCheckOut
                    };
                    return { ...emp, leaveStatus, dbRecord };
                });

                setEmployees(processed);
                setAttendanceData(initialAttendance);
            }
        } catch (error) {
            console.error("Fetch failed:", error);
        } finally {
            setIsInitialLoading(false);
        }
    }, [today, isWeekend]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filteredEmployees = useMemo(() => {
        if (!searchTerm) return employees;
        const lowerSearch = searchTerm.toLowerCase();
        return employees.filter(emp =>
            emp.userId.name.toLowerCase().includes(lowerSearch) ||
            emp.employeeId.toLowerCase().includes(lowerSearch) ||
            emp.department?.dep_name?.toLowerCase().includes(lowerSearch)
        );
    }, [employees, searchTerm]);

    const handleStatusChange = useCallback((empId, status) => {
        if (isWeekend) return; // Guard clause for weekends
        setAttendanceData(prev => {
            const current = prev[empId] || {};
            return {
                ...prev,
                [empId]: {
                    ...current,
                    status,
                    checkIn: current.checkIn || '09:00',
                    checkOut: current.checkOut || '17:00'
                }
            };
        });
    }, [isWeekend]);

    const handleTimeChange = useCallback((empId, field, value) => {
        if (isWeekend) return; // Guard clause for weekends
        setAttendanceData(prev => ({ ...prev, [empId]: { ...prev[empId], [field]: value } }));
    }, [isWeekend]);

    const saveIndividualAttendance = useCallback(async (empId) => {
        if (isWeekend) return alert("Attendance cannot be marked on weekends.");
        
        const record = attendanceData[empId];
        if (!record.status) return alert("Please select a status.");
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:3000/api/attendance/update',
                { attendanceData: { [empId]: record }, date: today },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setEmployees(prev => prev.map(emp => emp._id === empId ? { ...emp, dbRecord: record } : emp));
                alert("Attendance saved successfully!");
            }
        } catch (error) {
            console.error("Save error", error);
            alert("Failed to save attendance. Please try again.");
        }
    }, [attendanceData, today, isWeekend]);

    return (
        <div className="p-3 sm:p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-teal-100">
                    <div className="flex flex-col">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 flex items-center gap-3">
                            <FaCalendarDay className="text-teal-600" /> Attendance
                        </h2>
                        {isWeekend && (
                            <span className="text-red-500 text-xs font-bold mt-1">Weekend: Attendance Marking Disabled</span>
                        )}
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name, ID, dept..."
                        className="w-full sm:w-64 md:w-72 pl-4 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none shadow-sm text-sm"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    <table className="w-full text-left border-collapse">
                        <thead className="hidden md:table-header-group bg-gray-800 text-white text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-5">Employee</th>
                                <th className="p-5">Department</th>
                                <th className="p-5">Status</th>
                                <th className="p-5">Entry Time</th>
                                <th className="p-5">Exit Time</th>
                                <th className="p-5 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isInitialLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="p-5 bg-gray-50 h-16"></td>
                                    </tr>
                                ))
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-16 text-gray-400 font-semibold">
                                        No employees found.
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((emp) => (
                                    <AttendanceRow
                                        key={emp._id}
                                        emp={emp}
                                        current={attendanceData[emp._id]}
                                        onStatusChange={handleStatusChange}
                                        onTimeChange={handleTimeChange}
                                        onSave={saveIndividualAttendance}
                                        isWeekend={isWeekend}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <button
                    onClick={() => navigate('/admin-dashboard')}
                    className="mt-8 text-gray-500 hover:text-black font-semibold flex items-center gap-2 transition-colors cursor-pointer text-sm"
                >
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default Attendance;