import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../store'

export default function Login() {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('Admin@123')
  const [err, setErr] = useState(null)
  const nav = useNavigate()
  const { login } = useAuth()

  async function onSubmit(e) {
    e.preventDefault()
    try {
      await login(email, password)
      nav('/dashboard')
    } catch (e) {
      setErr(e.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h2>Login</h2>
      {err && <div className="badge">{err}</div>}
      <form onSubmit={onSubmit}>
        <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="button" type="submit">Login</button>
      </form>
    </div>
  )
}
