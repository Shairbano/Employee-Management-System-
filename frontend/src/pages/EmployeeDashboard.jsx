import React from 'react';
import EmployeeSidebar from '../components/Dashboards/EmployeeSidebar'
import Navbar from '../components/Dashboards/Navbar'
import { Outlet } from 'react-router-dom'

const EmployeeDashboard = () => {
  return (
    <div className="flex">
      <EmployeeSidebar />
      <div className="flex-1 md:ml-64 bg-gray-100 min-h-screen">
        <Navbar />
        <Outlet />
      </div>
    </div>
  )
}

export default EmployeeDashboard;