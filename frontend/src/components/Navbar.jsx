import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Logo from './Logo'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Landing page has its own navbar
  if (location.pathname === '/') return null

  // Read directly from localStorage as fallback for SSR/hydration timing
  const storedUser = user || JSON.parse(localStorage.getItem('user') || 'null')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-dark-2 border-b border-dark-border px-6 py-3 flex justify-between items-center">
      <Link to="/"><Logo size="sm" /></Link>
      <div className="flex gap-4 items-center text-sm">
        {storedUser ? (
          <>
            <span className="text-gray-600 text-xs uppercase tracking-widest">{storedUser.role}</span>
            {storedUser.role === 'candidate' && (
              <>
                <Link to="/candidate/dashboard" className="text-gray-400 hover:text-white transition">Dashboard</Link>
                <Link to="/candidate/resume" className="text-gray-400 hover:text-white transition">Resume</Link>
                <Link to="/candidate/proof" className="text-gray-400 hover:text-white transition">Proofs</Link>
              </>
            )}
            {storedUser.role === 'company' && (
              <>
                <Link to="/company/dashboard" className="text-gray-400 hover:text-white transition">Dashboard</Link>
                <Link to="/company/post-job" className="text-gray-400 hover:text-white transition">Post Job</Link>
              </>
            )}
            <button onClick={handleLogout}
              className="border border-dark-border text-gray-300 px-4 py-1.5 rounded-lg text-xs font-medium hover:border-gray-500 hover:text-white transition">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-400 hover:text-white transition">Sign In</Link>
            <Link to="/register"
              className="bg-primary text-black px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-primary-dark transition">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
