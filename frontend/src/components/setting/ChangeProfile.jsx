import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const ChangeProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [newImage, setNewImage] = useState(null);
    const [employee, setEmployee] = useState({
        name: '', email: '', dob: '', gender: '',
        maritalStatus: '', designation: '', department: '',
        section: '', salary: '', image: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!id || id === "undefined") { setLoading(false); return; }
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:3000/api/employee/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    const emp = res.data.employee;
                    setEmployee({
                        name: emp.userId?.name || '',
                        email: emp.userId?.email || '',
                        dob: emp.dob ? emp.dob.split('T')[0] : '',
                        gender: emp.gender || '',
                        maritalStatus: emp.maritalStatus || 'Single',
                        designation: emp.designation?.designation_name || emp.designation || '',
                        department: emp.department?.dep_name || emp.department || '',
                        section: emp.section?.section_name || emp.section || '',
                        salary: emp.salary || '',
                        image: emp.image || ''
                    });
                }
            } catch (err) {
                console.error("Fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', employee.name);
        formData.append('dob', employee.dob);
        formData.append('gender', employee.gender);
        formData.append('maritalStatus', employee.maritalStatus);
        if (newImage) formData.append('image', newImage);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`http://localhost:3000/api/employee/update-profile/${id}`, formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });
            if (res.data.success) {
                alert("Profile Updated Successfully!");
                navigate('/employee-dashboard');
            }
        } catch (err) {
            alert("Error updating profile");
            console.log(err);
        }
    };

    if (loading) return (
        <div className="text-center mt-10 text-teal-600 font-bold animate-pulse">Loading Profile...</div>
    );

    const readonlyClass = "mt-1 w-full p-2 border rounded-md bg-gray-50 cursor-not-allowed text-sm";
    const inputClass = "mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-teal-500 outline-none text-sm";
    const labelClass = "block text-sm font-semibold text-gray-700";
    const labelReadonlyClass = "block text-sm font-semibold text-gray-400";

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto bg-white rounded-md shadow-md border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-teal-700">Edit My Profile</h2>

                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Full Name</label>
                            <input type="text" value={employee.name} onChange={(e) => setEmployee({ ...employee, name: e.target.value })} className={inputClass} required />
                        </div>
                        <div>
                            <label className={labelReadonlyClass}>Email</label>
                            <input type="text" value={employee.email} readOnly className={readonlyClass} />
                        </div>
                        <div>
                            <label className={labelReadonlyClass}>Department</label>
                            <input type="text" value={employee.department} readOnly className={readonlyClass} />
                        </div>
                        <div>
                            <label className={labelReadonlyClass}>Section</label>
                            <input type="text" value={employee.section} readOnly className={readonlyClass} />
                        </div>
                        <div>
                            <label className={labelReadonlyClass}>Designation</label>
                            <input type="text" value={employee.designation} readOnly className={readonlyClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Gender</label>
                            <select value={employee.gender} onChange={(e) => setEmployee({ ...employee, gender: e.target.value })} className={inputClass}>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Date of Birth</label>
                            <input type="date" value={employee.dob} onChange={(e) => setEmployee({ ...employee, dob: e.target.value })} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Marital Status</label>
                            <select value={employee.maritalStatus} onChange={(e) => setEmployee({ ...employee, maritalStatus: e.target.value })} className={inputClass}>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                            </select>
                        </div>
                        <button type="submit" className="sm:col-span-2 bg-teal-600 text-white py-2.5 rounded-md hover:bg-teal-700 font-bold mt-2 transition-colors cursor-pointer">
                            Save Changes
                        </button>
                    </form>

                    {/* Profile Image */}
                    <div className="flex flex-row md:flex-col items-center gap-4 md:gap-0 md:self-start">
                        <img
                            src={newImage ? URL.createObjectURL(newImage) : employee.image}
                            alt="Profile"
                            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-teal-500 object-cover shadow-lg"
                        />
                        <label className="md:mt-4 text-sm text-teal-600 font-semibold cursor-pointer hover:underline">
                            Change Photo
                            <input type="file" onChange={(e) => setNewImage(e.target.files[0])} className="hidden" />
                        </label>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => navigate('/employee-dashboard')}
                    className="mt-6 text-gray-500 hover:text-black font-semibold flex items-center gap-2 cursor-pointer text-sm"
                >
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default ChangeProfile;