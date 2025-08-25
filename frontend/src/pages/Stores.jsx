import React, { useEffect, useState } from 'react'
import useAuth from '../store'

function Stars({ value = 0, onChange }) {
  return (
    <div>
      {[1,2,3,4,5].map(i => (
        <span key={i} className="star" onClick={() => onChange(i)}>
          {i <= value ? '★' : '☆'}
        </span>
      ))}
    </div>
  )
}

export default function Stores() {
  const { authed, user } = useAuth()
  const api = authed()
  const [stores, setStores] = useState([])
  const [q, setQ] = useState('')
  const [address, setAddress] = useState('')

  async function fetchStores() {
    const res = await api.get(`/stores?q=${encodeURIComponent(q)}&address=${encodeURIComponent(address)}`)
    setStores(res.data)
  }

  useEffect(() => { fetchStores() }, [])

  async function rate(id, value) {
    await api.post(`/stores/${id}/ratings`, { value })
    fetchStores()
  }

  if (!user) {
    return <div className="card">Please login to view stores.</div>
  }

  return (
    <div>
      <div className="searchbar">
        <input className="input" placeholder="Search by name" value={q} onChange={e => setQ(e.target.value)} />
        <input className="input" placeholder="Search by address" value={address} onChange={e => setAddress(e.target.value)} />
        <button className="button" onClick={fetchStores}>Search</button>
      </div>
      <div className="card">
        <h3>Store Listings</h3>
        {stores.map(s => (
          <div key={s.id} className="flex" style={{ justifyContent: 'space-between' }}>
            <div>
              <div><strong>{s.name}</strong></div>
              <div className="badge">{s.address}</div>
              <div>Overall Rating: {s.overallRating ? s.overallRating.toFixed(2) : '—'}</div>
              <div>Your rating: {s.myRating ?? '—'}</div>
            </div>
            <Stars value={s.myRating || 0} onChange={(v) => rate(s.id, v)} />
          </div>
        ))}
      </div>
    </div>
  )
}
