import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../hooks/useAuth'
import Logo from '../components/Logo'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, saveProfile } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Step 1: login and get token
      const res = await api.post('/auth/login', form)
      login(res.data) // saves token + role + user_id to localStorage

      // Step 2: if candidate, try to fetch existing profile
      if (res.data.role === 'candidate') {
        try {
          const profileRes = await api.get('/candidates/me', {
            headers: { Authorization: `Bearer ${res.data.access_token}` }
          })
          saveProfile({
            profile_id: profileRes.data.id,
            full_name: profileRes.data.full_name,
            college: profileRes.data.college,
            degree: profileRes.data.degree,
            location: profileRes.data.location,
            verification_status: profileRes.data.verification_status,
          })
        } catch {
          // no profile yet
        }
        navigate('/candidate/dashboard')
      } else {
        // company — setup page will check if profile exists
        navigate('/company/setup')
      }    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/"><Logo size="md" /></Link>
          <p className="text-gray-500 mt-3 text-sm">Sign in to your account</p>
        </div>
        <div className="gradient-border rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">Email</label>
              <input type="email" required placeholder="you@example.com"
                className="w-full bg-dark-4 border border-dark-border text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition placeholder-gray-600"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">Password</label>
              <input type="password" required placeholder="••••••••"
                className="w-full bg-dark-4 border border-dark-border text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition placeholder-gray-600"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary-dark transition glow-green-sm disabled:opacity-50 mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-gray-600 mt-6">
          No account?{' '}
          <Link to="/register" className="text-primary hover:text-primary-light transition font-medium">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  )
}
