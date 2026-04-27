import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'
import BackButton from '../components/BackButton'

const DOMAINS = ['tech', 'marketing', 'finance', 'general']

export default function TakeTest() {
  const { proofId } = useParams()
  const navigate = useNavigate()
  const [domain, setDomain] = useState('tech')
  const [test, setTest] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const startTest = async () => {
    setLoading(true)
    try {
      const res = await api.post('/tests/start', {
        proof_id: proofId,
        domain,
      })
      setTest(res.data)
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not start test')
    } finally {
      setLoading(false)
    }
  }

  const submitTest = async () => {
    setLoading(true)
    try {
      const res = await api.post('/tests/submit', {
        attempt_id: test.attempt_id,
        answers,
      })
      setResult(res.data)
    } catch (err) {
      alert('Submission failed')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="max-w-xl mx-auto mt-16 px-4 text-center">
        <div className={`p-8 rounded-2xl shadow ${result.passed ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className="text-4xl mb-3">{result.passed ? '✅' : '❌'}</p>
          <h2 className="text-2xl font-bold mb-2">{result.passed ? 'Test Passed!' : 'Test Failed'}</h2>
          <p className="text-gray-600">Score: {result.score}% ({result.correct}/{result.total} correct)</p>
          <p className="mt-2 text-sm text-gray-500">{result.message}</p>
          <button onClick={() => navigate('/candidate/dashboard')} className="mt-6 bg-primary text-white px-6 py-2 rounded-lg">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="max-w-xl mx-auto mt-16 px-4">
        <BackButton to="/candidate/proof" label="Back to Proofs" />
        <h1 className="text-2xl font-bold mb-6">Skill Test</h1>
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <p className="text-gray-500">Select your domain to begin the test.</p>
          <select
            className="w-full border rounded-lg px-4 py-2"
            value={domain} onChange={e => setDomain(e.target.value)}
          >
            {DOMAINS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
          </select>
          <button
            onClick={startTest} disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-indigo-700"
          >
            {loading ? 'Loading...' : 'Start Test'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Skill Test — {test.test_type}</h1>
      <div className="space-y-6">
        {test.questions.map((q, i) => (
          <div key={q.id} className="bg-white rounded-xl shadow p-5">
            <p className="font-medium mb-3">Q{i + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.options.map(opt => (
                <label key={opt} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio" name={`q_${q.id}`} value={opt}
                    checked={answers[String(q.id)] === opt}
                    onChange={() => setAnswers({ ...answers, [String(q.id)]: opt })}
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={submitTest} disabled={loading}
          className="w-full bg-secondary text-white py-3 rounded-lg font-semibold hover:bg-emerald-600"
        >
          {loading ? 'Submitting...' : 'Submit Test'}
        </button>
      </div>
    </div>
  )
}
