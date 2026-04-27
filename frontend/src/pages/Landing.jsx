import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import Logo from '../components/Logo'
import { useCountUp } from '../hooks/useCountUp'
import LandingBottom from './LandingBottom'

function FadeUp({ children, delay = 0, className = '' }) {
  return (
    <motion.div className={className}
      initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

function GridBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(0,200,83,0.07)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl"/>
    </div>
  )
}

function Particles() {
  const dots = Array.from({ length: 18 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 2 + 1, dur: Math.random() * 6 + 5, delay: Math.random() * 4,
  }))
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map(d => (
        <motion.div key={d.id} className="absolute rounded-full bg-primary/25"
          style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.size, height: d.size }}
          animate={{ y: [-14, 14, -14], opacity: [0.15, 0.5, 0.15] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}/>
      ))}
    </div>
  )
}

function ScanHero() {
  const [phase, setPhase] = useState(0)
  const badges = ['Education ✅', 'Internship ✅', 'Certification ✅', 'Skills ✅']
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 900)
    const t2 = setTimeout(() => setPhase(2), 2900)
    const t3 = setTimeout(() => { setPhase(0); }, 6000)
    const t4 = setTimeout(() => setPhase(1), 6800)
    const t5 = setTimeout(() => setPhase(2), 8800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5) }
  }, [])
  return (
    <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 mt-14 max-w-3xl mx-auto">
      {/* Resume card */}
      <motion.div className="relative flex-1 bg-dark-3 border border-dark-border rounded-2xl p-6 overflow-hidden min-h-[220px]"
        initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        style={{ filter: phase < 2 ? 'blur(1px)' : 'none', transition: 'filter 0.6s ease' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-red-500"/>
          <div className="w-2 h-2 rounded-full bg-yellow-500"/>
          <div className="w-2 h-2 rounded-full bg-green-500"/>
          <p className="text-xs text-gray-500 ml-2 uppercase tracking-widest">resume.pdf</p>
        </div>
        <div className="space-y-2.5">
          <div className="h-3 rounded bg-gray-500 w-2/5"/>
          <div className="h-2 rounded bg-dark-4 w-full"/>
          <div className="h-2 rounded bg-dark-4 w-5/6"/>
          <div className="h-2 rounded bg-dark-4 w-4/6"/>
          <div className="h-px bg-dark-border my-3"/>
          <div className="h-2 rounded bg-dark-4 w-3/4"/>
          <div className="h-2 rounded bg-dark-4 w-full"/>
          <div className="h-2 rounded bg-dark-4 w-2/3"/>
          <div className="h-px bg-dark-border my-3"/>
          <div className="h-2 rounded bg-dark-4 w-5/6"/>
          <div className="h-2 rounded bg-dark-4 w-full"/>
        </div>
        <AnimatePresence>
          {phase === 1 && (
            <motion.div className="absolute left-0 right-0 h-[2px] z-10"
              style={{ background: 'linear-gradient(90deg,transparent 0%,#00C853 30%,#00ff88 50%,#00C853 70%,transparent 100%)', boxShadow: '0 0 20px 6px rgba(0,200,83,0.6), 0 0 40px 10px rgba(0,200,83,0.2)' }}
              initial={{ top: '0%' }} animate={{ top: '105%' }} exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: 'linear' }}/>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Arrow */}
      <div className="flex items-center justify-center">
        <motion.div className="text-primary text-3xl font-black"
          animate={{ x: [0, 10, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity }}>→</motion.div>
      </div>

      {/* Verified Profile card */}
      <motion.div className="relative flex-1 bg-dark-3 border border-primary/30 rounded-2xl p-6 min-h-[220px]"
        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        style={{ boxShadow: phase === 2 ? '0 0 30px rgba(0,200,83,0.15)' : 'none', transition: 'box-shadow 0.5s ease' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Verified Profile</p>
          <motion.span className="text-sm font-black text-primary"
            animate={{ opacity: phase === 2 ? 1 : 0.3 }} transition={{ duration: 0.4 }}>
            4.6 / 5
          </motion.span>
        </div>
        <p className="font-bold text-white mb-4">Aryan Mehta</p>
        <div className="space-y-2">
          {badges.map((badge, i) => (
            <AnimatePresence key={badge}>
              {phase === 2 && (
                <motion.div className="flex items-center gap-2 bg-primary/10 border border-primary/25 rounded-lg px-3 py-2"
                  initial={{ opacity: 0, x: 20, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: i * 0.2, type: 'spring', stiffness: 220, damping: 18 }}>
                  <span className="text-sm text-primary font-medium">{badge}</span>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function StatItem({ value, suffix, label }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const count = useCountUp(value, 1800, inView)
  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl font-black text-primary">{count}{suffix}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}

const STATS = [
  { value: '98', suffix: '%', label: 'Verified Profiles' },
  { value: '3.5', suffix: '+', label: 'Min Match Score' },
  { value: '4', suffix: 'x', label: 'Faster Hiring' },
  { value: '0', suffix: '', label: 'Fake Resumes' },
]

export default function Landing() {
  return (
    <div className="bg-dark text-white min-h-screen overflow-x-hidden">
      {/* Navbar */}
      <motion.header className="fixed top-0 left-0 right-0 z-50 border-b border-dark-border bg-dark/80 backdrop-blur-md"
        initial={{ y: -70, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="md"/>
          <nav className="hidden md:flex items-center gap-8">
            {['How It Works','Scoring','For Companies'].map((l, i) => (
              <motion.a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`}
                className="text-sm text-gray-400 hover:text-white transition"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.3 }}>{l}</motion.a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-400 hover:text-white transition px-3 py-2">Sign In</Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Link to="/register" className="text-sm font-bold bg-primary text-black px-5 py-2 rounded-lg hover:bg-primary-dark transition glow-green-sm">
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        <GridBg/>
        <Particles/>
        <motion.div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none"
          animate={{ scale: [1,1.1,1], opacity: [0.5,0.9,0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}/>
        <motion.div className="absolute top-60 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"
          animate={{ scale: [1,1.2,1], opacity: [0.3,0.6,0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}/>
        <motion.div className="absolute top-60 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"
          animate={{ scale: [1,1.2,1], opacity: [0.3,0.6,0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 5 }}/>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-4 py-2 rounded-full mb-8 tracking-wide"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <motion.span className="w-1.5 h-1.5 bg-primary rounded-full"
              animate={{ opacity: [1,0.2,1] }} transition={{ duration: 1.5, repeat: Infinity }}/>
            AI-Powered Candidate Verification Platform
          </motion.div>
          <div className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            {['Hire','Only'].map((w, i) => (
              <motion.span key={w} className="inline-block mr-4"
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.12, ease: [0.22,1,0.36,1] }}>{w}</motion.span>
            ))}
            <motion.span className="block text-primary"
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.56, ease: [0.22,1,0.36,1] }}>Real Talent.</motion.span>
          </div>
          <motion.p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            Every candidate on Jobify is verified, skill-tested, and scored against your job description
            before they ever appear in your dashboard.
          </motion.p>
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center mb-4"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/register" className="inline-block bg-primary text-black font-bold px-8 py-4 rounded-xl hover:bg-primary-dark transition glow-green text-base">
                Start for Free →
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/login" className="inline-block border border-dark-border text-gray-300 font-semibold px-8 py-4 rounded-xl hover:border-gray-500 hover:text-white transition text-base">
                Sign In
              </Link>
            </motion.div>
          </motion.div>
          <ScanHero/>
          <p className="text-xs text-gray-600 mt-6 text-center">↑ Watch the AI scan and verify a resume in real-time</p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-dark-border bg-dark-2 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"/>
        <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => <FadeUp key={s.label} delay={i * 0.1}><StatItem {...s}/></FadeUp>)}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"/>
      </section>

      <LandingBottom FadeUp={FadeUp}/>
    </div>
  )
}
