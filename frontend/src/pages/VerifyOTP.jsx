import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import api from '../api/client'
import Logo from '../components/Logo'

export default function VerifyOTP() {
  const location = useLocation()
  const email = location.state?.email || ''
  const [devOtp, setDevOtp] = useState(location.state?.dev_otp || '')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/verify-otp', { email, otp })
      setSuccess('Email verified! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      const res = await api.post('/auth/resend-otp', { email })
      setError('')
      setSuccess(res.data.message || 'New OTP sent!')
      if (res.data.dev_otp) {
        setDevOtp(res.data.dev_otp)
      }
    } catch (err) {
      setError('Failed to resend OTP')
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/"><Logo size="md" /></Link>
          <p className="text-gray-500 mt-3 text-sm">Verify your email to continue</p>
        </div>
        <div className="gradient-border rounded-2xl p-8">
          <p className="text-sm text-gray-400 mb-6 text-center">
            OTP sent to <span className="text-white font-medium">{email}</span>
          </p>

          {/* Dev mode OTP hint */}
          {devOtp && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 mb-5 text-center">
              <p className="text-xs text-yellow-400 mb-1">Dev Mode — Your OTP:</p>
              <p className="text-2xl font-black text-yellow-300 tracking-widest">{devOtp}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-primary/10 border border-primary/20 text-primary text-sm px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">Enter OTP</label>
              <input
                type="text" required maxLength={6} placeholder="6-digit code"
                className="w-full bg-dark-4 border border-dark-border text-white rounded-lg px-4 py-3 text-center text-2xl font-black tracking-widest focus:outline-none focus:border-primary transition placeholder-gray-700"
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>
            <button type="submit" disabled={loading || otp.length < 6}
              className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary-dark transition disabled:opacity-50">
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <button onClick={handleResend}
            className="w-full mt-3 text-sm text-gray-500 hover:text-gray-300 transition py-2">
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  )
}
