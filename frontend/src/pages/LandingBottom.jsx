import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Logo from '../components/Logo'

function ScoreRing({ score, size = 72 }) {
  const r = 28, circ = 2 * Math.PI * r
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 72 72" className="-rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#1A1A1A" strokeWidth="6"/>
        <motion.circle cx="36" cy="36" r={r} fill="none" stroke="#00C853" strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          whileInView={{ strokeDashoffset: circ * (1 - score / 5) }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.22,1,0.36,1], delay: 0.2 }}
          style={{ filter: 'drop-shadow(0 0 5px #00C853)' }}/>
      </svg>
      <div className="absolute text-center">
        <p className="text-sm font-black text-primary leading-none">{score}</p>
        <p className="text-xs text-gray-600">/5</p>
      </div>
    </div>
  )
}

function CandidateCard({ name, college, score, label, skills, status, delay = 0, dimmed = false }) {
  const bars = [
    { label: 'Skills', pct: 82, color: '#00C853' },
    { label: 'Experience', pct: 60, color: '#00E676' },
    { label: 'Test', pct: 88, color: '#69F0AE' },
  ]
  return (
    <motion.div
      className={`bg-dark-3 border rounded-2xl p-5 ${dimmed ? 'border-dark-border opacity-25 grayscale pointer-events-none' : 'border-primary/20'}`}
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: dimmed ? 0.25 : 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5, delay }}
      whileHover={!dimmed ? { scale: 1.02, boxShadow: '0 0 22px rgba(0,200,83,0.15)' } : {}}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <p className="font-bold text-white text-sm">{name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${status === 'verified' ? 'bg-primary/10 text-primary' : status === 'test_verified' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}>
              {status === 'verified' ? '✅ Verified' : status === 'test_verified' ? '🧪 Test' : '❌ Unverified'}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate">{college}</p>
        </div>
        <ScoreRing score={score}/>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {skills.map(s => <span key={s} className="text-xs bg-dark-4 text-gray-400 px-2 py-0.5 rounded-md">{s}</span>)}
      </div>
      <div className="space-y-1.5">
        {bars.map((b, i) => (
          <div key={b.label}>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-gray-500">{b.label}</span>
              <span className="text-gray-600">{b.pct}%</span>
            </div>
            <div className="h-1 bg-dark-4 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ backgroundColor: b.color }}
                initial={{ width: 0 }} whileInView={{ width: `${b.pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: delay + i * 0.1 + 0.3 }}/>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-primary mt-2.5 font-medium">{label}</p>
    </motion.div>
  )
}

const CANDIDATES = [
  { name: 'Aryan Mehta', college: 'IIT Bombay · CS', score: 4.6, label: 'Excellent Match', skills: ['Python','React','ML'], status: 'verified', dimmed: false },
  { name: 'Priya Sharma', college: 'BITS Pilani · ECE', score: 4.1, label: 'Strong Match', skills: ['Java','Spring','SQL'], status: 'test_verified', dimmed: false },
  { name: 'Rahul Gupta', college: 'NIT Trichy · Mech', score: 2.8, label: 'Below Threshold', skills: ['AutoCAD'], status: 'unverified', dimmed: true },
]

const FEATURES = [
  { icon: '✅', title: 'Zero Fake Profiles', desc: 'OCR certificate validation + skill tests eliminate fraudulent resumes entirely.' },
  { icon: '⚡', title: 'Instant Shortlisting', desc: 'Every candidate is pre-scored, pre-verified, and ready to interview.' },
  { icon: '🎯', title: 'JD-Based Scoring', desc: 'Post a job and our engine scores all candidates against your exact requirements.' },
  { icon: '🔍', title: 'Smart Filters', desc: 'Filter by score, skills, location, college — find the right fit in minutes.' },
]

export default function LandingBottom({ FadeUp }) {
  return (
    <>
      {/* How It Works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-28">
        <FadeUp className="text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">For Candidates</p>
          <h2 className="text-3xl md:text-5xl font-black">How Jobify Works</h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">Three steps from signup to being discovered by top companies.</p>
        </FadeUp>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { num: '01', icon: '📄', title: 'Upload Resume', desc: 'AI parses your resume and extracts education, skills, experience, and certifications in seconds.' },
            { num: '02', icon: '🔐', title: 'Verify Claims', desc: 'Upload proof documents or take a domain skill test. Every claim is validated before you go live.' },
            { num: '03', icon: '🎯', title: 'Get Matched', desc: 'Scored against real job descriptions. Only candidates with 3.5+ appear to recruiters.' },
          ].map((step, i) => (
            <FadeUp key={i} delay={i * 0.15}>
              <motion.div className="gradient-border rounded-2xl p-7 h-full"
                whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(0,200,83,0.15)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                <div className="flex items-center justify-between mb-5">
                  <motion.span className="text-4xl" whileHover={{ rotate: [0,-10,10,0] }} transition={{ duration: 0.4 }}>{step.icon}</motion.span>
                  <span className="text-5xl font-black text-dark-border">{step.num}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* Verification Loop */}
      <section className="bg-dark-2 border-y border-dark-border py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-14">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">No Proof? No Problem.</p>
            <h2 className="text-3xl md:text-5xl font-black">The Verification Loop</h2>
            <p className="text-gray-500 mt-4">Missing documents trigger a skill test instead of blocking the candidate.</p>
          </FadeUp>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            {[
              { icon: '📋', label: 'No Proof Available', sub: 'Candidate selects this option', cls: 'border-yellow-500/30 bg-yellow-500/5' },
              { icon: '🧠', label: 'Auto Skill Test', sub: 'Tech→Coding · Finance→MCQ · Marketing→Case', cls: 'border-blue-500/30 bg-blue-500/5' },
              { icon: '🧪', label: 'Test Verified', sub: 'Pass 60%+ → Claim validated → Visible', cls: 'border-primary/30 bg-primary/5' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                <FadeUp delay={i * 0.2}>
                  <motion.div className={`border ${s.cls} rounded-2xl p-6 w-52 text-center`}
                    whileHover={{ scale: 1.04, y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <motion.p className="text-4xl mb-3"
                      initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                      transition={{ type: 'spring', stiffness: 200, delay: i * 0.2 + 0.1 }}>{s.icon}</motion.p>
                    <p className="font-bold text-white text-sm mb-1">{s.label}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{s.sub}</p>
                  </motion.div>
                </FadeUp>
                {i < 2 && (
                  <motion.div className="text-primary text-xl font-black hidden md:block flex-shrink-0"
                    animate={{ x: [0,6,0] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}>→</motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scoring */}
      <section id="scoring" className="max-w-5xl mx-auto px-6 py-28">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <FadeUp>
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Smart Scoring</p>
            <h2 className="text-3xl md:text-5xl font-black leading-tight mb-5">Scored Against<br/>Your Exact JD</h2>
            <p className="text-gray-400 leading-relaxed mb-8">
              Post a job and Jobify automatically scores every verified candidate. Only those hitting
              3.5 / 5 or above appear in your dashboard — no noise, no guesswork.
            </p>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/register" className="inline-block bg-primary text-black font-bold px-6 py-3 rounded-xl hover:bg-primary-dark transition glow-green-sm">
                Post a Job →
              </Link>
            </motion.div>
          </FadeUp>
          <FadeUp delay={0.15}>
            <div className="gradient-border rounded-2xl p-7 glow-green">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">Candidate Score</p>
                  <p className="text-sm text-gray-300 mt-0.5">vs. Senior Frontend Engineer JD</p>
                </div>
                <motion.div className="text-right"
                  initial={{ scale: 0.5, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }} transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}>
                  <p className="text-4xl font-black text-primary">4.2</p>
                  <p className="text-xs text-gray-500">/ 5.0 · Strong Match</p>
                </motion.div>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Skills Match', pct: 40, color: '#00C853' },
                  { label: 'Experience', pct: 20, color: '#00E676' },
                  { label: 'Test Performance', pct: 20, color: '#69F0AE' },
                  { label: 'Education', pct: 10, color: '#B9F6CA' },
                  { label: 'Profile Completeness', pct: 10, color: '#CCFF90' },
                ].map((item, i) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-gray-500">{item.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-dark-4 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: item.color }}
                        initial={{ width: 0 }} whileInView={{ width: `${item.pct * 2.5}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.12 + 0.2, ease: [0.22,1,0.36,1] }}/>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-dark-border flex items-center justify-between">
                <span className="text-xs text-gray-500">Visibility Rule</span>
                <motion.span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full"
                  animate={{ opacity: [1,0.4,1] }} transition={{ duration: 2.5, repeat: Infinity }}>
                  Score ≥ 3.5 + Verified ✓
                </motion.span>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Recruiter Dashboard Preview */}
      <section id="for-companies" className="bg-dark-2 border-y border-dark-border py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-14">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Recruiter Dashboard</p>
            <h2 className="text-3xl md:text-5xl font-black">High-Quality Only</h2>
            <p className="text-gray-500 mt-4">Profiles below 3.5 are grayed out. You only act on the best.</p>
          </FadeUp>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Sidebar */}
            <FadeUp delay={0.1} className="w-full md:w-48 flex-shrink-0">
              <div className="gradient-border rounded-2xl p-5">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Filters</p>
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Min Score</p>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-primary font-bold">3.5</span>
                    <span className="text-xs text-gray-600">5.0</span>
                  </div>
                  <div className="h-1.5 bg-dark-4 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }} whileInView={{ width: '70%' }}
                      viewport={{ once: true }} transition={{ duration: 1, delay: 0.4 }}/>
                  </div>
                </div>
                {['Skills','Location','College'].map(f => (
                  <div key={f} className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded border border-primary/40 bg-primary/10 flex-shrink-0"/>
                    <span className="text-xs text-gray-500">{f}</span>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-dark-border">
                  <p className="text-xs text-gray-500 mb-2">Status</p>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">✅ Verified only</span>
                </div>
              </div>
            </FadeUp>
            {/* Cards grid */}
            <div className="flex-1 grid md:grid-cols-2 gap-4">
              {CANDIDATES.map((c, i) => (
                <CandidateCard key={c.name} {...c} delay={i * 0.15}/>
              ))}
              <FadeUp delay={0.4} className="gradient-border rounded-2xl p-5 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl mb-2">🔒</p>
                  <p className="text-xs text-gray-500">1 profile hidden<br/>Score below 3.5</p>
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* Why Companies */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <FadeUp className="text-center mb-14">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">For Companies</p>
          <h2 className="text-3xl md:text-5xl font-black">Why Recruiters Choose Jobify</h2>
        </FadeUp>
        <div className="grid md:grid-cols-2 gap-5">
          {FEATURES.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.1}>
              <motion.div className="gradient-border rounded-2xl p-7 h-full"
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0,200,83,0.12)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                <motion.p className="text-3xl mb-4" whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}>{f.icon}</motion.p>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 px-6 overflow-hidden border-t border-dark-border">
        <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none"
          animate={{ scale: [1,1.15,1], opacity: [0.3,0.6,0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
          <div className="w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"/>
        </motion.div>
        <FadeUp className="relative max-w-2xl mx-auto text-center">
          <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }} className="inline-block mb-8">
            <Logo size="lg"/>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black mt-2 mb-4">
            Ready to hire<br/><span className="text-primary">smarter?</span>
          </h2>
          <p className="text-gray-400 mb-10 text-lg">Join thousands of verified candidates and companies already on Jobify.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link to="/register" className="inline-block bg-primary text-black font-bold px-10 py-4 rounded-xl hover:bg-primary-dark transition glow-green text-base">
                Create Free Account
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link to="/login" className="inline-block border border-dark-border text-gray-300 font-semibold px-10 py-4 rounded-xl hover:border-gray-500 hover:text-white transition text-base">
                Sign In
              </Link>
            </motion.div>
          </div>
        </FadeUp>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm"/>
          <p className="text-gray-600 text-sm">© 2026 Jobify · Built for verified hiring</p>
          <div className="flex gap-6 text-sm text-gray-600">
            {['Privacy','Terms','Contact'].map(l => (
              <motion.a key={l} href="#" className="hover:text-gray-400 transition" whileHover={{ y: -2 }}>{l}</motion.a>
            ))}
          </div>
        </div>
      </footer>
    </>
  )
}
