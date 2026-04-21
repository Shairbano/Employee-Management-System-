import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminSetting = () => {
    const navigate = useNavigate();
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [msg, setMsg] = useState("");

    const handleChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) return alert("New passwords do not match");
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('http://localhost:3000/api/settings/change-password',
                { oldPassword: passwords.oldPassword, newPassword: passwords.newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setMsg("Password changed successfully!");
                setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (err) {
            alert(err.response?.data?.error || "Server error. Please try again.");
        }
    };

    const inputClass = "w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm";

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-bold mb-6 text-gray-800">Change Password</h2>
                {msg && <p className="text-green-600 bg-green-50 p-2 rounded mb-4 font-medium text-sm">{msg}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="password" name="oldPassword" placeholder="Old Password" value={passwords.oldPassword} onChange={handleChange} required className={inputClass} />
                    <input type="password" name="newPassword" placeholder="New Password" value={passwords.newPassword} onChange={handleChange} required className={inputClass} />
                    <input type="password" name="confirmPassword" placeholder="Confirm New Password" value={passwords.confirmPassword} onChange={handleChange} required className={inputClass} />
                    <button type="submit" className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition-all cursor-pointer shadow-md">
                        Update Password
                    </button>
                </form>
            </div>
            <div className="max-w-md mx-auto">
                <button onClick={() => navigate('/admin-dashboard')} className="mt-6 text-gray-500 hover:text-black font-semibold flex items-center gap-2 transition-colors cursor-pointer text-sm">
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default AdminSetting;