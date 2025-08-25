import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../store'

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' })
  const [err, setErr] = useState(null)
  const nav = useNavigate()
  const { signup } = useAuth()

  async function onSubmit(e) {
    e.preventDefault()
    try {
      await signup(form)
      nav('/stores')
    } catch (e) {
      setErr(e.response?.data?.message || 'Signup failed')
    }
  }

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <h2>Signup</h2>
      {err && <div className="badge">{err}</div>}
      <form onSubmit={onSubmit}>
        <input className="input" placeholder="Full Name (20-60 chars)"
               value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input className="input" placeholder="Email" value={form.email}
               onChange={e => setForm({ ...form, email: e.target.value })} />
        <input className="input" placeholder="Address (<=400 chars)" value={form.address}
               onChange={e => setForm({ ...form, address: e.target.value })} />
        <input className="input" placeholder="Password (8-16, 1 uppercase & special)"
               type="password" value={form.password}
               onChange={e => setForm({ ...form, password: e.target.value })} />
        <button className="button" type="submit">Create account</button>
      </form>
    </div>
  )
}
