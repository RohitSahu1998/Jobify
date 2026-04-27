import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../hooks/useAuth'
import Logo from '../components/Logo'

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Marketing',
  'E-Commerce', 'Manufacturing', 'Consulting', 'Media', 'Other'
]

export default function CompanySetup() {
  const { user, saveProfile, getProfile } = useAuth()
  const [form, setForm] = useState({ company_name: '', industry: 'Technology', website: '', location: '' })
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Check if company profile already exists
    api.get('/companies/me')
      .then(res => {
        saveProfile({ profile_id: res.data.id, company_name: res.data.company_name, industry: res.data.industry })
        navigate('/company/dashboard')
      })
      .catch(() => setChecking(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/companies/profile', form)
      saveProfile({ profile_id: res.data.company_id, ...form })
      navigate('/company/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Logo size="md" />
          <h1 className="text-2xl font-black text-white mt-4">Set Up Your Company</h1>
          <p className="text-gray-500 text-sm mt-2">Tell us about your company to start hiring</p>
        </div>

        <div className="gradient-border rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">Company Name *</label>
              <input type="text" required placeholder="e.g. Acme Corp"
                className="w-full bg-dark-4 border border-dark-border text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition placeholder-gray-600"
                value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">Industry *</label>
              <select required
                className="w-full bg-dark-4 border border-dark-border text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition"
                value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })}>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">Website</label>
              <input type="url" placeholder="https://yourcompany.com"
                className="w-full bg-dark-4 border border-dark-border text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition placeholder-gray-600"
                value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">Location</label>
              <input type="text" placeholder="e.g. Mumbai, India"
                className="w-full bg-dark-4 border border-dark-border text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition placeholder-gray-600"
                value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary-dark transition glow-green-sm disabled:opacity-50 mt-2">
              {loading ? 'Creating...' : 'Create Company Profile →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
