import React, { useState } from 'react';
import { useAuth } from '../../context/authContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ApplyLeave = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [leave, setLeave] = useState({
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: '',
    });

    const handleChange = (e) => {
        setLeave({ ...leave, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:3000/api/leave/add', 
                { ...leave, employeeId: user.profileId }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                alert("Leave Applied!");
                navigate('/employee-dashboard/leave-history');
            }
        } catch (err) {
            alert("Error applying leave");
            console.error(err);
        }
    };

    return (
        // Added px-4 to ensure content doesn't touch screen edges on mobile
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-2xl mx-auto bg-white shadow-md rounded p-6">
                <h2 className="text-2xl font-bold mb-6">Apply for Leave</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Leave Type Select */}
                    <div>
                        <label className="block text-sm font-bold mb-2">Leave Type</label>
                        <select name="leaveType" onChange={handleChange} className="w-full border p-2 rounded" required>
                            <option value="">Select Type</option>
                            <option value="Sick Leave">Sick Leave</option>
                            <option value="Casual Leave">Casual Leave</option>
                            <option value="Annual Leave">Annual Leave</option>
                        </select>
                    </div>

                    {/* Responsive Grid for Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">Start Date</label>
                            <input type="date" name="startDate" onChange={handleChange} className="border p-2 w-full rounded" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">End Date</label>
                            <input type="date" name="endDate" onChange={handleChange} className="border p-2 w-full rounded" required />
                        </div>
                    </div>

                    {/* Reason Textarea */}
                    <div>
                        <label className="block text-sm font-bold mb-2">Reason</label>
                        <textarea name="reason" placeholder="Briefly explain the reason" onChange={handleChange} className="w-full border p-2 rounded" rows="4" required></textarea>
                    </div>

                    <button type="submit" className="w-full bg-teal-600 text-white py-3 rounded font-bold hover:bg-teal-700 transition duration-200">
                        Submit Request
                    </button>
                </form>
            </div>

            <div className="max-w-2xl mx-auto mt-6">
                <button 
                    onClick={() => navigate('/employee-dashboard')}
                    className="text-gray-500 hover:text-black font-semibold flex items-center gap-2"
                >
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default ApplyLeave;