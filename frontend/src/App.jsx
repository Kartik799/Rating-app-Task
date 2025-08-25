import React from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import useAuth from './store'

export default function App() {
  const { user, logout } = useAuth()
  const nav = useNavigate()

  return (
    <div>
      <nav className="nav">
        <div className="brand">Rating Platform</div>
        <div className="links">
          <Link to="/stores">Stores</Link>
          <Link to="/dashboard">Dashboard</Link>
          {!user && <Link to="/login">Login</Link>}
          {!user && <Link to="/signup">Signup</Link>}
          {user && <button onClick={() => { logout(); nav('/login') }}>Logout</button>}
        </div>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </div>
  )
}
