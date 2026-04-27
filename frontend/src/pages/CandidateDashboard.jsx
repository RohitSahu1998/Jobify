import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import api from '../api/client'

const STATUS_CONFIG = {
  unverified:   { label: 'Pending Verification', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', dot: 'bg-yellow-400' },
  verified:     { label: 'Verified',             cls: 'bg-primary/10 text-primary border-primary/20',         dot: 'bg-primary' },
  test_verified:{ label: 'Test Verified',         cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',     dot: 'bg-blue-400' },
}

function StatCard({ icon, label, value, sub, delay }) {
  return (
    <motion.div className="gradient-border rounded-2xl p-5"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22,1,0.36,1] }}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-2xl font-black text-white">{value}</span>
      </div>
      <p className="text-sm font-semibold text-white">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </motion.div>
  )
}

function StepRow({ num, icon, title, desc, path, done, active }) {
  return (
    <Link to={path}>
      <motion.div
        className={`flex items-center gap-4 rounded-2xl p-5 border transition group cursor-pointer
          ${done ? 'border-primary/30 bg-primary/5' : active ? 'gradient-border' : 'border-dark-border bg-dark-3 opacity-60'}`}
        whileHover={done || active ? { scale: 1.01, x: 4 } : {}}
        transition={{ type: 'spring', stiffness: 300 }}>
        {/* Step indicator */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-black
          ${done ? 'bg-primary text-black' : active ? 'bg-dark-4 border border-primary/40 text-primary' : 'bg-dark-4 text-gray-600'}`}>
          {done ? '✓' : num}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm ${done ? 'text-primary' : active ? 'text-white' : 'text-gray-600'}`}>{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
        </div>
        <span className={`text-lg transition ${done ? 'text-primary' : active ? 'text-gray-400 group-hover:text-primary' : 'text-gray-700'}`}>
          {done ? '✅' : '→'}
        </span>
      </motion.div>
    </Link>
  )
}

export default function CandidateDashboard() {
  const { user, saveProfile, getProfile } = useAuth()
  const [profile, setProfile] = useState(getProfile())
  const [proofCount, setProofCount] = useState(0)
  const [verifiedCount, setVerifiedCount] = useState(0)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(!getProfile())
  const [form, setForm] = useState({ full_name: '', phone: '', location: '', college: '', degree: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!profile) return
    // Always fetch fresh profile from backend to get latest verification status
    api.get('/candidates/me').then(res => {
      const updated = {
        ...profile,
        verification_status: res.data.verification_status,
        profile_completeness: res.data.profile_completeness,
      }
      saveProfile(updated)
      setProfile(updated)
    }).catch(() => {})

    api.get('/candidates/proofs').then(res => {
      setProofCount(res.data.length)
      setVerifiedCount(res.data.filter(p => p.status === 'verified').length)
    }).catch(() => {})
  }, [profile?.profile_id])

  const createProfile = async (e) => {
    e.preventDefault()
    if (!user) return
    setCreating(true)
    setError('')
    try {
      const res = await api.post('/candidates/profile', form)
      const newProfile = {
        profile_id: res.data.profile_id,
        ...form,
        verification_status: 'unverified',
        profile_completeness: 0,
      }
      saveProfile(newProfile)
      setProfile(newProfile)
      setShowForm(false)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create profile')
    } finally {
      setCreating(false)
    }
  }

  // Profile creation form
  if (showForm) {
    return (
      <div className="max-w-lg mx-auto mt-10 px-4 pb-16">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8">
            <h1 className="text-2xl font-black text-white">Complete Your Profile</h1>
            <p className="text-gray-500 text-sm mt-1">Fill in your details to get started on Jobify</p>
          </div>
          <div className="gradient-border rounded-2xl p-7">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">{error}</div>
            )}
            <form onSubmit={createProfile} className="space-y-4">
              {[
                { key: 'full_name', label: 'Full Name', placeholder: 'Rohit Sahu', required: true },
                { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210' },
                { key: 'location', label: 'Location', placeholder: 'Mumbai, India' },
                { key: 'college', label: 'College / University', placeholder: 'IIT Bombay' },
                { key: 'degree', label: 'Degree', placeholder: 'B.Tech Computer Science' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">{f.label}</label>
                  <input type="text" required={f.required} placeholder={f.placeholder}
                    className="w-full bg-dark-4 border border-dark-border text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition placeholder-gray-600"
                    value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}
              <button type="submit" disabled={creating}
                className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary-dark transition glow-green-sm disabled:opacity-50 mt-2">
                {creating ? 'Creating...' : 'Create Profile →'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    )
  }

  const status = STATUS_CONFIG[profile?.verification_status] || STATUS_CONFIG.unverified
  const completeness = Math.round((profile?.profile_completeness || 0) * 100)
  const hasResume = profile?.resume_uploaded || false
  const steps = [
    { num: 1, icon: '📄', title: 'Upload Resume', desc: 'AI parses your skills, education & experience', path: '/candidate/resume', done: hasResume, active: true },
    { num: 2, icon: '📎', title: 'Upload Proofs', desc: `${proofCount} proof${proofCount !== 1 ? 's' : ''} submitted · ${verifiedCount} verified`, path: '/candidate/proof', done: verifiedCount > 0, active: proofCount >= 0 },
    { num: 3, icon: '🧪', title: 'Take Skill Tests', desc: 'Validate claims without proof documents', path: '/candidate/proof', done: profile?.verification_status !== 'unverified', active: proofCount > 0 },
  ]

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4 pb-16">

      {/* Header */}
      <motion.div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8"
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div>
          <p className="text-gray-500 text-sm mb-1">Welcome back 👋</p>
          <h1 className="text-3xl font-black text-white">{profile?.full_name}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {profile?.college && <span>{profile.college}</span>}
            {profile?.degree && <span className="text-gray-600"> · {profile.degree}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border ${status.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon="📊" label="Profile Complete" value={`${completeness}%`} sub="Fill all fields" delay={0.1} />
        <StatCard icon="📎" label="Proofs Submitted" value={proofCount} sub={`${verifiedCount} verified`} delay={0.15} />
        <StatCard icon="🎯" label="Verification" value={profile?.verification_status === 'unverified' ? '—' : '✓'} sub={status.label} delay={0.2} />
        <StatCard icon="⭐" label="Match Score" value="—" sub="Apply to jobs" delay={0.25} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Steps */}
        <div className="md:col-span-2 space-y-3">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Verification Steps</p>
          {steps.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i + 0.3, duration: 0.5 }}>
              <StepRow {...step} />
            </motion.div>
          ))}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Profile completeness */}
          <motion.div className="gradient-border rounded-2xl p-5"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Profile Strength</p>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-black text-white">{completeness}%</span>
              <span className="text-xs text-gray-500">of 100%</span>
            </div>
            <div className="h-2 bg-dark-4 rounded-full overflow-hidden">
              <motion.div className="h-full bg-primary rounded-full"
                initial={{ width: 0 }} animate={{ width: `${completeness}%` }}
                transition={{ duration: 1, delay: 0.6, ease: [0.22,1,0.36,1] }} />
            </div>
            <div className="mt-3 space-y-1.5">
              {[
                { label: 'Basic Info', done: !!profile?.full_name },
                { label: 'Resume Uploaded', done: hasResume },
                { label: 'Proof Submitted', done: proofCount > 0 },
                { label: 'Claim Verified', done: verifiedCount > 0 },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className={`text-xs ${item.done ? 'text-primary' : 'text-gray-600'}`}>
                    {item.done ? '✓' : '○'}
                  </span>
                  <span className={`text-xs ${item.done ? 'text-gray-300' : 'text-gray-600'}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Profile ID */}
          <motion.div className="gradient-border rounded-2xl p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Profile ID</p>
            <p className="text-xs text-gray-500 font-mono break-all leading-relaxed">{profile?.profile_id}</p>
          </motion.div>

          {/* Quick links */}
          <motion.div className="gradient-border rounded-2xl p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Quick Actions</p>
            <div className="space-y-2">
              {[
                { label: '📄 Upload / Update Resume', path: '/candidate/resume' },
                { label: '📎 Manage Proofs', path: '/candidate/proof' },
              ].map(a => (
                <Link key={a.path} to={a.path}
                  className="block text-xs text-gray-400 hover:text-primary transition py-1 hover:translate-x-1 transform duration-150">
                  {a.label} →
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
