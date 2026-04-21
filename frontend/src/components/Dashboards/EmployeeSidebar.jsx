import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/authContext';
import {
    FaTachometerAlt, FaCalendarAlt, FaCogs, FaChevronDown, FaChevronUp,
    FaClipboardList, FaPlusCircle, FaKey, FaUserCircle, FaBars, FaTimes,
    FaProjectDiagram, FaListUl, FaBell
} from 'react-icons/fa';

const EmployeeSidebar = () => {
    const { user } = useAuth();
    const [isLeaveOpen, setIsLeaveOpen] = useState(false);
    const [isProjectOpen, setIsProjectOpen] = useState(false);
    const [isSettingOpen, setIsSettingOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const closeSidebar = () => setIsOpen(false);

    const linkClass = ({ isActive }) =>
        `flex items-center space-x-4 py-2.5 px-4 rounded transition-colors ${
            isActive ? 'bg-teal-500 text-white' : 'text-gray-300 hover:bg-gray-700'
        }`;

    const subLinkClass = ({ isActive }) =>
        `flex items-center space-x-4 py-2 px-4 rounded ml-8 transition-colors ${
            isActive ? 'text-teal-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-gray-700 text-sm'
        }`;

    const sidebarNav = (
        <div className="bg-gray-800 text-white h-screen w-64 overflow-y-auto shadow-xl flex flex-col">
            <div className="bg-teal-600 h-12 flex items-center justify-between px-4">
                <h3 className="text-2xl font-bold italic">EMS</h3>
                <button onClick={closeSidebar} className="md:hidden text-white cursor-pointer">
                    <FaTimes size={20} />
                </button>
            </div>

            <div className="px-4 space-y-1 mt-4">
                <NavLink to="/employee-dashboard" className={linkClass} end onClick={closeSidebar}>
                    <FaTachometerAlt /><span>Dashboard</span>
                </NavLink>

                {/* Projects Dropdown */}
                <div>
                    <button onClick={() => setIsProjectOpen(!isProjectOpen)}
                        className="w-full flex items-center justify-between py-2.5 px-4 text-gray-300 hover:bg-gray-700 rounded transition-colors focus:outline-none">
                        <div className="flex items-center space-x-4"><FaProjectDiagram /><span>Projects</span></div>
                        {isProjectOpen ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                    </button>
                    {isProjectOpen && (
                        <div className="mt-1 space-y-1 bg-gray-900/30 rounded-lg">
                            <NavLink to="/employee-dashboard/projects" className={subLinkClass} end onClick={closeSidebar}>
                                <FaListUl className="text-xs" /><span>My Projects</span>
                            </NavLink>
                            {/* FIXED: was /employee-dashboard/projects/invitations */}
                            <NavLink to="/employee-dashboard/projects/invitations" className={subLinkClass} onClick={closeSidebar}>
                                <FaBell className="text-xs" /><span>Invitations</span>
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* Leaves Dropdown */}
                <div>
                    <button onClick={() => setIsLeaveOpen(!isLeaveOpen)}
                        className="w-full flex items-center justify-between py-2.5 px-4 text-gray-300 hover:bg-gray-700 rounded transition-colors focus:outline-none">
                        <div className="flex items-center space-x-4"><FaCalendarAlt /><span>Leaves</span></div>
                        {isLeaveOpen ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                    </button>
                    {isLeaveOpen && (
                        <div className="mt-1 space-y-1 bg-gray-900/30 rounded-lg">
                            <NavLink to="/employee-dashboard/apply-leave" className={subLinkClass} onClick={closeSidebar}>
                                <FaPlusCircle className="text-xs" /><span>Apply Leave</span>
                            </NavLink>
                            <NavLink to="/employee-dashboard/leave-history" className={subLinkClass} onClick={closeSidebar}>
                                <FaClipboardList className="text-xs" /><span>Leave History</span>
                            </NavLink>
                        </div>
                    )}
                </div>

                <div>
                    <button onClick={() => setIsSettingOpen(!isSettingOpen)}
                        className="w-full flex items-center justify-between py-2.5 px-4 text-gray-300 hover:bg-gray-700 rounded transition-colors focus:outline-none">
                        <div className="flex items-center space-x-4"><FaCogs /><span>Settings</span></div>
                        {isSettingOpen ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                    </button>
                    {isSettingOpen && (
                        <div className="mt-1 space-y-1 bg-gray-900/30 rounded-lg">
                            <NavLink
                                to={user ? `/employee-dashboard/change-profile/${user._id || user.id}` : "#"}
                                className={subLinkClass} onClick={closeSidebar}>
                                <FaUserCircle className="text-xs" /><span>Change Profile</span>
                            </NavLink>
                            <NavLink to="/employee-dashboard/change-password" className={subLinkClass} onClick={closeSidebar}>
                                <FaKey className="text-xs" /><span>Change Password</span>
                            </NavLink>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden fixed top-2 left-2 z-50 bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-lg shadow-lg cursor-pointer transition-colors"
            >
                <FaBars size={18} />
            </button>

            <div className="hidden md:block fixed left-0 top-0 z-40">
                {sidebarNav}
            </div>

            {isOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/50" onClick={closeSidebar} />
                    <div className="relative z-10">{sidebarNav}</div>
                </div>
            )}
        </>
    );
}

export default EmployeeSidebar;