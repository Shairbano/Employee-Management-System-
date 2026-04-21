import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import {
  FaBuilding, FaCogs, FaTachometerAlt, FaUsers, FaLayerGroup,
  FaChevronDown, FaChevronRight, FaCalendarAlt, FaClipboardCheck,
  FaHistory, FaUserTag, FaBars, FaTimes
} from 'react-icons/fa';

const AdminSidebar = () => {
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const leaveRes = await axios.get('http://localhost:3000/api/leave', { headers });
        if (leaveRes.data.success) {
          const count = leaveRes.data.leaves.filter(l => l.status === 'Pending').length;
          setPendingCount(count);
        }
      } catch (error) {
        console.error('Sidebar fetch error:', error);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const closeSidebar = () => setIsOpen(false);

  const linkClass = ({ isActive }) =>
    `flex items-center justify-between py-2.5 px-4 rounded transition-colors ${
      isActive ? 'bg-teal-500 text-white' : 'text-gray-300 hover:bg-gray-700'
    }`;

  const subLinkClass = ({ isActive }) =>
    `flex items-center space-x-4 py-2 px-4 rounded ml-6 transition-colors ${
      isActive ? 'text-teal-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-gray-700 text-sm'
    }`;

  const sidebarNav = (
    <div className="bg-gray-800 text-white h-screen w-64 overflow-y-auto shadow-xl flex flex-col">
      <div className="bg-teal-600 h-12 flex items-center justify-between px-2">
        <h3 className="text-2xl font-bold">EMS</h3>
        <button onClick={closeSidebar} className="md:hidden text-white cursor-pointer">
          <FaTimes size={25} />
        </button>
      </div>

      <div className="px-4 space-y-1 mt-4">
        <NavLink to="/admin-dashboard" className={linkClass} end onClick={closeSidebar}>
          <div className="flex items-center space-x-4">
            <FaTachometerAlt /><span>Dashboard</span>
          </div>
        </NavLink>

        <div>
          <button onClick={() => setIsAttendanceOpen(!isAttendanceOpen)}
            className="w-full flex items-center justify-between py-2.5 px-4 rounded text-gray-300 hover:bg-gray-700 transition-colors">
            <div className="flex items-center space-x-4"><FaClipboardCheck /><span>Attendance</span></div>
            {isAttendanceOpen ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
          </button>
          {isAttendanceOpen && (
            <div className="mt-1 space-y-1 bg-gray-900/50 rounded-b-md">
              <NavLink to="/admin-dashboard/attendance" className={subLinkClass} end onClick={closeSidebar}>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div><span>Mark Attendance</span>
              </NavLink>
              <NavLink to="/admin-dashboard/attendance-history" className={subLinkClass} onClick={closeSidebar}>
                <FaHistory className="text-xs" /><span>Attendance History</span>
              </NavLink>
            </div>
          )}
        </div>

        <div>
          <button onClick={() => setIsDeptOpen(!isDeptOpen)}
            className="w-full flex items-center justify-between py-2.5 px-4 rounded text-gray-300 hover:bg-gray-700 transition-colors">
            <div className="flex items-center space-x-4"><FaBuilding /><span>Departments</span></div>
            {isDeptOpen ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
          </button>
          {isDeptOpen && (
            <div className="mt-1 space-y-1 bg-gray-900/50 rounded-b-md">
              <NavLink to="/admin-dashboard/departments" className={subLinkClass} end onClick={closeSidebar}>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div><span>All Departments</span>
              </NavLink>
              <NavLink to="/admin-dashboard/sections" className={subLinkClass} onClick={closeSidebar}>
                <FaLayerGroup className="text-xs" /><span>Sections</span>
              </NavLink>
              <NavLink to="/admin-dashboard/designations" className={subLinkClass} onClick={closeSidebar}>
                <FaUserTag className="text-xs" /><span>Designations</span>
              </NavLink>
              <NavLink to="/admin-dashboard/employees" className={subLinkClass} onClick={closeSidebar}>
                <FaUsers className="text-xs" /><span>Employees</span>
              </NavLink>
            </div>
          )}
        </div>

        <NavLink to="/admin-dashboard/leaves" className={linkClass} onClick={closeSidebar}>
          <div className="flex items-center space-x-4 relative">
            <FaCalendarAlt /><span>Leaves</span>
            {pendingCount > 0 && (
              <span className="absolute -top-1 -left-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
            )}
          </div>
          {pendingCount > 0 && (
            <span className="bg-teal-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
          )}
        </NavLink>

        <NavLink to="/admin-dashboard/setting" className={linkClass} onClick={closeSidebar}>
          <div className="flex items-center space-x-4"><FaCogs /><span>Settings</span></div>
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Hamburger — teal, top-4 */}
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
};

export default AdminSidebar;