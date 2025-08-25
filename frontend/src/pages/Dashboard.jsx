import React, { useEffect, useState } from 'react'
import useAuth from '../store'

export default function Dashboard() {
  const { user, authed } = useAuth()
  const api = authed()

  if (!user) return <div className="card">Please login first.</div>

  if (user.role === 'ADMIN') return <AdminDash api={api} />
  if (user.role === 'OWNER') return <OwnerDash api={api} />
  return <UserDash />
}

function AdminDash({ api }) {
  const [metrics, setMetrics] = useState({ users: 0, stores: 0, ratings: 0 })
  const [users, setUsers] = useState([])
  const [stores, setStores] = useState([])
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' })
  const [sort, setSort] = useState({ by: 'id', order: 'asc' })

  async function fetchAll() {
    const [m, u, s] = await Promise.all([
      api.get('/admin/metrics'),
      api.get(`/admin/users?name=${filters.name}&email=${filters.email}&address=${filters.address}&role=${filters.role}&sortBy=${sort.by}&order=${sort.order}`),
      api.get(`/admin/stores?name=${filters.name}&email=${filters.email}&address=${filters.address}&sortBy=${sort.by}&order=${sort.order}`)
    ])
    setMetrics(m.data)
    setUsers(u.data)
    setStores(s.data)
  }

  useEffect(() => { fetchAll() }, [])

  return (
    <div>
      <div className="flex">
        <div className="card">Users: <strong>{metrics.users}</strong></div>
        <div className="card">Stores: <strong>{metrics.stores}</strong></div>
        <div className="card">Ratings: <strong>{metrics.ratings}</strong></div>
      </div>

      <div className="card">
        <h3>Filters</h3>
        <div className="flex">
          <input className="input" placeholder="Name" value={filters.name} onChange={e => setFilters({ ...filters, name: e.target.value })} />
          <input className="input" placeholder="Email" value={filters.email} onChange={e => setFilters({ ...filters, email: e.target.value })} />
          <input className="input" placeholder="Address" value={filters.address} onChange={e => setFilters({ ...filters, address: e.target.value })} />
          <input className="input" placeholder="Role ADMIN/USER/OWNER" value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value })} />
          <select className="input" value={sort.by} onChange={e => setSort({ ...sort, by: e.target.value })}>
            <option value="id">id</option>
            <option value="name">name</option>
            <option value="email">email</option>
            <option value="address">address</option>
            <option value="role">role</option>
          </select>
          <select className="input" value={sort.order} onChange={e => setSort({ ...sort, order: e.target.value })}>
            <option value="asc">asc</option>
            <option value="desc">desc</option>
          </select>
          <button className="button" onClick={fetchAll}>Apply</button>
        </div>
      </div>

      <div className="card">
        <h3>Users</h3>
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th><th>Address</th><th>Role</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}><td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.address}</td><td><span className="badge">{u.role}</span></td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Stores</h3>
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th><th>Address</th><th>Rating</th></tr>
          </thead>
          <tbody>
            {stores.map(s => (
              <tr key={s.id}><td>{s.id}</td><td>{s.name}</td><td>{s.email}</td><td>{s.address}</td><td>{s.rating?.toFixed?.(2) ?? '—'}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function OwnerDash({ api }) {
  const [data, setData] = useState([])
  useEffect(() => { api.get('/owner/ratings').then(r => setData(r.data)) }, [])

  return (
    <div className="card">
      <h3>My Store Ratings</h3>
      {data.map(s => (
        <div key={s.storeId} className="card">
          <div><strong>{s.storeName}</strong> — Avg: {s.averageRating?.toFixed?.(2) ?? '—'}</div>
          <table className="table">
            <thead><tr><th>User</th><th>Email</th><th>Rating</th></tr></thead>
            <tbody>
              {s.ratings.map(r => (
                <tr key={r.id}><td>{r.user.name}</td><td>{r.user.email}</td><td>{r.value}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

function UserDash() {
  return <div className="card">Welcome! Visit the Stores page to submit/modify your ratings.</div>
}
