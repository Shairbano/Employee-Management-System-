import React from 'react'
import { useAuth } from '../../context/authContext'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="h-12 flex justify-between items-center bg-teal-600 text-white px-6 pl-14 md:pl-6">
      <p className="font-medium truncate">{user?.name}</p>
      <div className="flex gap-2">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-teal-500 rounded cursor-pointer hover:bg-teal-700 transition-colors text-sm whitespace-nowrap"
        >
          Log out
        </button>
      </div>
    </div>
  )
}

export default Navbar