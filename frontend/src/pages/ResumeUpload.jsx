import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../hooks/useAuth'
import BackButton from '../components/BackButton'

export default function ResumeUpload() {
  const { getProfile, saveProfile } = useAuth()
  const profile = getProfile()
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center px-4">
        <p className="text-gray-400 mb-4">No profile found. Please complete your profile first.</p>
        <button onClick={() => navigate('/candidate/dashboard')}
          className="bg-primary text-black font-bold px-6 py-2 rounded-lg">
          Go to Dashboard
        </button>
      </div>
    )
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setError('')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('candidate_id', profile.profile_id)
    try {
      const res = await api.post('/candidates/upload-resume', formData)
      setResult(res.data.parsed)
      // Refresh profile to update completeness
      const profileRes = await api.get('/candidates/me')
      saveProfile({
        ...profile,
        resume_uploaded: true,
        profile_completeness: profileRes.data.profile_completeness,
        verification_status: profileRes.data.verification_status,
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <BackButton to="/candidate/dashboard" label="Back to Dashboard" />
      <h1 className="text-2xl font-black mb-1 text-white">Upload Your Resume</h1>
      <p className="text-gray-500 text-sm mb-6">PDF only · AI will extract your skills, experience and education</p>

      <div className="gradient-border rounded-2xl p-6">
        <form onSubmit={handleUpload} className="space-y-4">
          <label className="block border-2 border-dashed border-dark-border rounded-xl p-10 text-center cursor-pointer hover:border-primary/40 transition">
            <p className="text-3xl mb-2">📄</p>
            <p className="text-gray-400 text-sm mb-2">{file ? file.name : 'Click to select PDF'}</p>
            <input type="file" accept=".pdf" className="hidden"
              onChange={e => setFile(e.target.files[0])} />
            {file && <p className="text-xs text-primary mt-1">✓ File selected</p>}
          </label>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button type="submit" disabled={!file || loading}
            className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary-dark transition disabled:opacity-50">
            {loading ? 'Parsing resume...' : 'Upload & Parse'}
          </button>
        </form>

        {result && (
          <div className="mt-6 space-y-3">
            <p className="font-semibold text-white">Parsed Resume Data</p>
            {['education', 'skills', 'experience', 'certifications', 'internships'].map(key => (
              <div key={key} className="bg-dark-4 rounded-xl p-4">
                <p className="text-xs font-semibold uppercase text-gray-500 mb-2 tracking-widest">{key}</p>
                {result[key]?.length > 0
                  ? result[key].map((item, i) => (
                    <p key={i} className="text-sm text-gray-300 mb-0.5">{item}</p>
                  ))
                  : <p className="text-sm text-gray-600">None found</p>
                }
              </div>
            ))}
            <button onClick={() => navigate('/candidate/proof')}
              className="w-full border border-primary/30 text-primary font-semibold py-2.5 rounded-lg hover:bg-primary/10 transition mt-2">
              Next: Upload Proofs →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
