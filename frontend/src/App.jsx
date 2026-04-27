import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyOTP from './pages/VerifyOTP'
import CandidateDashboard from './pages/CandidateDashboard'
import ResumeUpload from './pages/ResumeUpload'
import ProofUpload from './pages/ProofUpload'
import TakeTest from './pages/TakeTest'
import CompanySetup from './pages/CompanySetup'
import CompanyDashboard from './pages/CompanyDashboard'
import PostJob from './pages/PostJob'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        {/* Candidate */}
        <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
        <Route path="/candidate/resume" element={<ResumeUpload />} />
        <Route path="/candidate/proof" element={<ProofUpload />} />
        <Route path="/candidate/test/:proofId" element={<TakeTest />} />

        {/* Company */}
        <Route path="/company/setup" element={<CompanySetup />} />
        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/company/post-job" element={<PostJob />} />
      </Routes>
    </div>
  )
}
