import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../hooks/useAuth'

const BADGE = {
  verified: 'bg-primary/10 text-primary',
  test_verified: 'bg-blue-500/10 text-blue-400',
  unverified: 'bg-red-500/10 text-red-400',
}

function ScoreRing({ score, size = 56 }) {
  const r = 20, circ = 2 * Math.PI * r
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 56 56" className="-rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#1A1A1A" strokeWidth="5" />
        <circle cx="28" cy="28" r={r} fill="none" stroke="#00C853" strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - score / 5)}
          style={{ filter: 'drop-shadow(0 0 4px #00C853)' }} />
      </svg>
      <div className="absolute text-center">
        <p className="text-xs font-black text-primary leading-none">{score}</p>
        <p className="text-xs text-gray-600" style={{ fontSize: 8 }}>/5</p>
      </div>
    </div>
  )
}

export default function CompanyDashboard() {
  const { getProfile } = useAuth()
  const profile = getProfile()
  const navigate = useNavigate()

  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [loadingCandidates, setLoadingCandidates] = useState(false)

  useEffect(() => {
    if (!profile) { navigate('/company/setup'); return }
    api.get('/jobs/')
      .then(res => setJobs(res.data))
      .catch(() => {})
      .finally(() => setLoadingJobs(false))
  }, [])

  const loadCandidates = async (jobId) => {
    setSelectedJob(jobId)
    setLoadingCandidates(true)
    try {
      const res = await api.get(`/companies/candidates/${jobId}`)
      setCandidates(res.data.candidates)
    } catch {
      setCandidates([])
    } finally {
      setLoadingCandidates(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">
            {profile?.company_name || 'Company Dashboard'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{profile?.industry} · Only verified candidates shown</p>
        </div>
        <Link to="/company/post-job"
          className="bg-primary text-black font-bold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition glow-green-sm text-sm">
          + Post a Job
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Jobs sidebar */}
        <div className="md:col-span-1">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Your Jobs</p>
          {loadingJobs ? (
            <p className="text-gray-600 text-sm">Loading...</p>
          ) : jobs.length === 0 ? (
            <div className="gradient-border rounded-xl p-5 text-center">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-gray-500 text-sm">No jobs posted yet</p>
              <Link to="/company/post-job" className="text-primary text-xs mt-2 inline-block hover:underline">
                Post your first job →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.map(job => (
                <button key={job.id} onClick={() => loadCandidates(job.id)}
                  className={`w-full text-left gradient-border rounded-xl p-4 transition hover:glow-green-sm ${selectedJob === job.id ? 'border-primary/50' : ''}`}>
                  <p className="font-semibold text-white text-sm">{job.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{job.location || 'Remote'} · {job.experience_level}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(job.required_skills || []).slice(0, 3).map(s => (
                      <span key={s} className="text-xs bg-dark-4 text-gray-500 px-2 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Candidates panel */}
        <div className="md:col-span-2">
          {!selectedJob ? (
            <div className="gradient-border rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
              <p className="text-4xl mb-3">👈</p>
              <p className="text-gray-500">Select a job to view matched candidates</p>
              <p className="text-xs text-gray-600 mt-2">Only verified candidates with score ≥ 3.5 are shown</p>
            </div>
          ) : loadingCandidates ? (
            <div className="gradient-border rounded-2xl p-12 text-center">
              <p className="text-gray-500 text-sm">Loading candidates...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="gradient-border rounded-2xl p-12 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-400 font-medium">No verified candidates yet</p>
              <p className="text-xs text-gray-600 mt-2">Candidates need score ≥ 3.5 and verified status to appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest">{candidates.length} Verified Candidates</p>
              {candidates.map((c, i) => (
                <div key={c.candidate_id}
                  className="gradient-border rounded-2xl p-5 hover:glow-green-sm transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="font-bold text-white">{c.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${BADGE[c.verification_status] || BADGE.unverified}`}>
                          {c.verification_status === 'verified' ? '✅ Verified' : '🧪 Test Verified'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{c.college}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xl font-black text-primary">{c.score}</p>
                        <p className="text-xs text-gray-600">/ 5.0</p>
                        <p className="text-xs text-primary/70">{c.label}</p>
                      </div>
                      <ScoreRing score={c.score} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {c.skills.map(s => (
                      <span key={s} className="text-xs bg-dark-4 text-gray-400 px-2.5 py-1 rounded-md">{s}</span>
                    ))}
                  </div>
                  {c.resume_path && (
                    <a href={`http://localhost:8000/uploads/${c.resume_path.split('/').pop()}`}
                      target="_blank" rel="noreferrer"
                      className="text-xs text-primary hover:underline">
                      📄 Download Resume
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
