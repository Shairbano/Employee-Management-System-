import React from 'react'
import AdminSidebar from '../components/Dashboards/AdminSidebar'
import Navbar from '../components/Dashboards/Navbar'
import { Outlet } from 'react-router-dom'

const AdminDashboard = () => {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 md:ml-64 bg-gray-100 min-h-screen">
        <Navbar />
        <Outlet />
      </div>
    </div>
  )
}

export default AdminDashboard