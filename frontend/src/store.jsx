import { create } from 'zustand'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

const useAuth = create((set, get) => ({
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  login: async (email, password) => {
    const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    set({ token: res.data.token, user: res.data.user })
  },
  signup: async (payload) => {
    const res = await axios.post(`${API_BASE}/api/auth/signup`, payload)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    set({ token: res.data.token, user: res.data.user })
  },
  logout: () => {
    localStorage.removeItem('token'); localStorage.removeItem('user')
    set({ token: null, user: null })
  },
  authed: () => {
    const { token } = get()
    return axios.create({ baseURL: `${API_BASE}/api`, headers: { Authorization: `Bearer ${token}` } })
  }
}))

export default useAuth
