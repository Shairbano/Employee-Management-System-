import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import PrivateRoutes from './utils/PrivateRoutes'
import RoleBasedRoutes from './utils/roleBasedRoutes'
import AdminSummary from './components/Dashboards/AdminSummary'
import EmployeeSummary from './components/Dashboards/EmployeeSummary'
import DepartmentList from './components/departments/DepartmentList'
import AddDepartment from './components/departments/AddDepartment'
import EditDepartment from './components/departments/EditDepartment'
import EmployeeList from './components/employee/EmployeeList'
import AddEmployee from './components/employee/AddEmployee'
import EditEmployee from './components/employee/EditEmployee'
import ViewEmployee from './components/employee/ViewEmployee'

import SectionList from './components/sections/SectionList'
import AddSection from './components/sections/AddSection'
import EditSection from './components/sections/EditSection'
import DesignationList from './components/designations/DesignationList'
import AddDesignation from './components/designations/AddDesignation'
import EditDesignation from './components/designations/EditDesignation'
import LeavesApproval from './components/leaves/LeavesApproval'
import Setting from './components/setting/AdminSetting' 
import ForgotPassword from './components/ForgotPassword'

import EmployeeDashboard from './pages/EmployeeDashboard'
import ApplyLeave from './components/leaves/ApplyLeave'
import LeaveHistory from './components/leaves/LeaveHistory'
import ChangeProfile from './components/setting/ChangeProfile'
import EmployeeSetting from './components/setting/EmployeeSetting'
import Attendance from './components/attendence/Attendance'
import AttendanceHistory from './components/attendence/AttendanceHistory'
import ProjectList from './components/projects/ProjectList'
import ProjectDetails from './components/projects/ProjectDetails'
import AddProject from './components/projects/AddProject'
import ProjectInvitations from './components/projects/ProjectInvitations'
import EmployeeProjectHistory from './components/projects/EmployeeProjectHistory' 
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Dashboard Routes (Omitted for brevity) */}
        
        {/* Employee Dashboard Routes */}
        <Route
          path="/employee-dashboard"
          element={
            <PrivateRoutes>
              <RoleBasedRoutes requiredRole={['employee']}>
                <EmployeeDashboard />
              </RoleBasedRoutes>
            </PrivateRoutes>
          }
        >
          <Route index element={<EmployeeSummary />} />
          <Route path='apply-leave' element={<ApplyLeave />} />
          <Route path='leave-history' element={<LeaveHistory />} />
          <Route path='change-profile/:id' element={<ChangeProfile />} />
          <Route path='change-password' element={<EmployeeSetting />} />

          {/* Project Management Routes */}
          <Route path='projects' element={<ProjectList />} />
          <Route path='projects/add' element={<AddProject />} />
          <Route path='projects/:id' element={<ProjectDetails />} />
          <Route path='projects/invitations' element={<ProjectInvitations />} />
          <Route path='projects/history/:id' element={<EmployeeProjectHistory />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;