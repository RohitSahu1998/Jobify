import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../hooks/useAuth'
import BackButton from '../components/BackButton'

const CATEGORIES = ['internship', 'work_experience', 'certification', 'education', 'skill']

const STATUS_STYLE = {
  verified:  { cls: 'bg-primary/10 text-primary border-primary/20',     label: '✅ Verified' },
  pending:   { cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', label: '⏳ Pending Review' },
  no_proof:  { cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',   label: '🧪 Test Assigned' },
  rejected:  { cls: 'bg-red-500/10 text-red-400 border-red-500/20',      label: '❌ Rejected' },
}

export default function ProofUpload() {
  const { getProfile } = useAuth()
  const profile = getProfile()
  const [proofs, setProofs] = useState([])
  const [form, setForm] = useState({ category: 'internship', claim_text: '', no_proof: false })
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingProofs, setLoadingProofs] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()

  // Load existing proofs on mount
  useEffect(() => {
    if (!profile) return
    api.get('/candidates/proofs')
      .then(res => setProofs(res.data))
      .catch(() => {})
      .finally(() => setLoadingProofs(false))
  }, [])

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center px-4">
        <p className="text-gray-400 mb-4">No profile found.</p>
        <button onClick={() => navigate('/candidate/dashboard')}
          className="bg-primary text-black font-bold px-6 py-2 rounded-lg">Go to Dashboard</button>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    const formData = new FormData()
    formData.append('category', form.category)
    formData.append('claim_text', form.claim_text)
    formData.append('no_proof', form.no_proof)
    if (!form.no_proof && file) formData.append('file', file)

    try {
      const res = await api.post('/candidates/upload-proof', formData)
      setResult(res.data)

      // Add new proof to the list
      setProofs(prev => [...prev, {
        id: res.data.proof_id,
        category: form.category,
        claim_text: form.claim_text,
        status: res.data.test_required ? 'no_proof' : res.data.status,
        no_proof_selected: form.no_proof,
        test_assigned: res.data.test_required || false,
      }])

      // Reset form
      setForm({ category: 'internship', claim_text: '', no_proof: false })
      setFile(null)
      setShowForm(false)

      if (res.data.test_required) {
        setTimeout(() => navigate(`/candidate/test/${res.data.proof_id}`), 1800)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 pb-16">
      <BackButton to="/candidate/dashboard" label="Back to Dashboard" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Proof Documents</h1>
          <p className="text-gray-500 text-sm mt-1">Verify each claim on your resume</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setResult(null); setError('') }}
          className="bg-primary text-black font-bold px-4 py-2 rounded-lg text-sm hover:bg-primary-dark transition">
          {showForm ? '✕ Cancel' : '+ Add Proof'}
        </button>
      </div>

      {/* Add proof form */}
      {showForm && (
        <div className="gradient-border rounded-2xl p-6 mb-6">
          <p className="text-sm font-semibold text-white mb-4">New Proof Entry</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">Category</label>
              <select className="w-full bg-dark-4 border border-dark-border text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">What are you claiming?</label>
              <input type="text" required placeholder="e.g. Internship at Google, 2023"
                className="w-full bg-dark-4 border border-dark-border text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition placeholder-gray-600"
                value={form.claim_text} onChange={e => setForm({ ...form, claim_text: e.target.value })} />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition flex-shrink-0 ${form.no_proof ? 'bg-primary border-primary' : 'border-dark-border'}`}
                onClick={() => setForm({ ...form, no_proof: !form.no_proof })}>
                {form.no_proof && <span className="text-black text-xs font-bold">✓</span>}
              </div>
              <span className="text-sm text-gray-400">No proof available — I'll take a skill test instead</span>
            </label>

            {!form.no_proof && (
              <label className="block border-2 border-dashed border-dark-border rounded-xl p-5 text-center cursor-pointer hover:border-primary/40 transition">
                <p className="text-xl mb-1">📎</p>
                <p className="text-gray-400 text-sm">{file ? file.name : 'Upload certificate / document (PDF or Image)'}</p>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                  onChange={e => setFile(e.target.files[0])} />
                {file && <p className="text-xs text-primary mt-1">✓ File selected</p>}
              </label>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>
            )}

            {result && (
              <div className={`p-4 rounded-xl border ${result.test_required ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-primary/10 border-primary/20'}`}>
                <p className="font-medium text-white text-sm">{result.message}</p>
                {result.test_required && <p className="text-xs text-yellow-400 mt-1">Redirecting to skill test...</p>}
                {result.ocr_name_matched !== undefined && (
                  <p className="text-xs mt-1 text-gray-400">
                    Name match: {result.ocr_name_matched ? '✅ Matched' : '⚠️ Not matched — pending review'}
                  </p>
                )}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary-dark transition disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit Proof'}
            </button>
          </form>
        </div>
      )}

      {/* Existing proofs list */}
      {loadingProofs ? (
        <p className="text-gray-600 text-sm">Loading proofs...</p>
      ) : proofs.length === 0 ? (
        <div className="gradient-border rounded-2xl p-10 text-center">
          <p className="text-3xl mb-3">📭</p>
          <p className="text-gray-500">No proofs submitted yet</p>
          <p className="text-xs text-gray-600 mt-1">Click "+ Add Proof" to verify your first claim</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-500 uppercase tracking-widest">{proofs.length} Proof{proofs.length > 1 ? 's' : ''} Submitted</p>
          {proofs.map((proof, i) => {
            const s = STATUS_STYLE[proof.status] || STATUS_STYLE.pending
            return (
              <div key={proof.id || i} className="gradient-border rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs bg-dark-4 text-gray-400 px-2 py-0.5 rounded capitalize">
                      {proof.category?.replace('_', ' ')}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${s.cls}`}>
                      {s.label}
                    </span>
                  </div>
                  <p className="text-sm text-white font-medium">{proof.claim_text}</p>
                  {proof.ocr_extracted && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                      OCR: {proof.ocr_extracted.slice(0, 100)}...
                    </p>
                  )}
                  {/* File actions */}
                  {proof.file_url && (
                    <div className="flex gap-3 mt-2">
                      <a href={`http://localhost:8000${proof.file_url}`}
                        target="_blank" rel="noreferrer"
                        className="text-xs text-primary hover:underline">
                        👁 View
                      </a>
                      <a href={`http://localhost:8000${proof.file_url}`}
                        download
                        className="text-xs text-gray-400 hover:text-white transition">
                        ⬇ Download
                      </a>
                    </div>
                  )}
                </div>
                {proof.test_assigned && proof.status === 'no_proof' && (
                  <button onClick={() => navigate(`/candidate/test/${proof.id}`)}
                    className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition flex-shrink-0">
                    Take Test →
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
