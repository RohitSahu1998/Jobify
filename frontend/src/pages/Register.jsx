import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import Logo from '../components/Logo'

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', role: 'candidate' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/register', form)
      setSuccess('Account created! Redirecting...')
      setTimeout(() => navigate('/verify-otp', {
        state: { email: form.email, dev_otp: res?.data?.dev_otp }
      }), 800)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/"><Logo size="md" /></Link>
          <p className="text-gray-500 mt-3 text-sm">Create your free account</p>
        </div>

        <div className="gradient-border rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-primary/10 border border-primary/20 text-primary text-sm px-4 py-3 rounded-lg mb-5">
              {success}
            </div>
          )}

          {/* Role toggle */}
          <div className="flex bg-dark-4 rounded-lg p-1 mb-6">
            {['candidate', 'company'].map(r => (
              <button
                key={r} type="button"
                onClick={() => setForm({ ...form, role: r })}
                className={`flex-1 py-2 rounded-md text-sm font-semibold transition capitalize ${
                  form.role === r
                    ? 'bg-primary text-black'
                    : 'text-gray-500 hover:text-gray-300'
                }`}>
                {r === 'candidate' ? '👤 Candidate' : '🏢 Company'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">Email</label>
              <input
                type="email" required placeholder="you@example.com"
                className="w-full bg-dark-4 border border-dark-border text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition placeholder-gray-600"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">Password</label>
              <input
                type="password" required placeholder="••••••••"
                className="w-full bg-dark-4 border border-dark-border text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition placeholder-gray-600"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary-dark transition glow-green-sm disabled:opacity-50 mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-light transition font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
