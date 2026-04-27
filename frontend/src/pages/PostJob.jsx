import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'

const EXPERIENCE_LEVELS = ['entry', 'mid', 'senior']
const SKILL_SUGGESTIONS = ['Python', 'JavaScript', 'React', 'Node.js', 'Java', 'SQL', 'Machine Learning',
  'Data Analysis', 'AWS', 'Docker', 'Marketing', 'Finance', 'Excel', 'Communication']

export default function PostJob() {
  const [form, setForm] = useState({
    title: '', description: '', experience_level: 'entry',
    education_required: '', location: '', keywords: ''
  })
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const addSkill = (skill) => {
    const s = skill.trim()
    if (s && !skills.includes(s)) setSkills([...skills, s])
    setSkillInput('')
  }

  const removeSkill = (s) => setSkills(skills.filter(x => x !== s))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (skills.length === 0) { setError('Add at least one required skill'); return }
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/jobs/', {
        ...form,
        required_skills: skills,
        keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
      })
      setSuccess(`Job posted! ID: ${res.data.job_id}`)
      setTimeout(() => navigate('/company/dashboard'), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to post job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 pb-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Post a Job</h1>
          <p className="text-gray-500 text-sm mt-1">Only verified, high-scoring candidates will appear</p>
        </div>
        <Link to="/company/dashboard" className="text-sm text-gray-500 hover:text-white transition">← Back</Link>
      </div>

      <div className="gradient-border rounded-2xl p-7 space-y-5">
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>}
        {success && <div className="bg-primary/10 border border-primary/20 text-primary text-sm px-4 py-3 rounded-lg">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">Job Title *</label>
            <input type="text" required placeholder="e.g. Senior Frontend Engineer"
              className="w-full bg-dark-4 border border-dark-border text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition placeholder-gray-600"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">Job Description *</label>
            <textarea required rows={4} placeholder="Describe the role, responsibilities, and requirements..."
              className="w-full bg-dark-4 border border-dark-border text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition placeholder-gray-600 resize-none"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">Experience Level *</label>
              <select required
                className="w-full bg-dark-4 border border-dark-border text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition capitalize"
                value={form.experience_level} onChange={e => setForm({ ...form, experience_level: e.target.value })}>
                {EXPERIENCE_LEVELS.map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">Location</label>
              <input type="text" placeholder="e.g. Mumbai / Remote"
                className="w-full bg-dark-4 border border-dark-border text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition placeholder-gray-600"
                value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">Education Required</label>
            <input type="text" placeholder="e.g. B.Tech, MBA"
              className="w-full bg-dark-4 border border-dark-border text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition placeholder-gray-600"
              value={form.education_required} onChange={e => setForm({ ...form, education_required: e.target.value })} />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">Required Skills *</label>
            <div className="flex gap-2 mb-2">
              <input type="text" placeholder="Type a skill and press Enter"
                className="flex-1 bg-dark-4 border border-dark-border text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition placeholder-gray-600"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput) } }} />
              <button type="button" onClick={() => addSkill(skillInput)}
                className="bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-lg text-sm hover:bg-primary/20 transition">
                Add
              </button>
            </div>
            {/* Suggestions */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 8).map(s => (
                <button key={s} type="button" onClick={() => addSkill(s)}
                  className="text-xs bg-dark-4 text-gray-500 px-2.5 py-1 rounded-md hover:text-primary hover:border-primary/30 border border-dark-border transition">
                  + {s}
                </button>
              ))}
            </div>
            {/* Selected skills */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <span key={s} className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-xs px-3 py-1.5 rounded-full">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} className="text-primary/60 hover:text-red-400 transition">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">Keywords (comma separated)</label>
            <input type="text" placeholder="e.g. startup, remote, fintech"
              className="w-full bg-dark-4 border border-dark-border text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition placeholder-gray-600"
              value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary-dark transition glow-green-sm disabled:opacity-50">
            {loading ? 'Posting...' : 'Post Job →'}
          </button>
        </form>
      </div>
    </div>
  )
}
