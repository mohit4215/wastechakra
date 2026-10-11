import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, LogIn, Eye, EyeOff, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import ChakraLoader from '../components/common/ChakraLoader.jsx'

export default function LoginPage() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@ecofleet.ai')
  const [password, setPassword] = useState('EcoFleet@2026')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!authLoading && isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, authLoading, navigate])

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await login(email.trim(), password)
    setLoading(false)
    if (result.success) {
      navigate('/', { replace: true })
    } else {
      setError(result.error || 'Invalid credentials. Please try again.')
    }
  }

  const handleDemoLogin = () => {
    setEmail('admin@ecofleet.ai')
    setPassword('EcoFleet@2026')
    handleSubmit()
  }

  return (
    <div style={styles.page}>
      <div style={styles.card} className="brass-card">
        {/* Heritage Municipal Top Crest */}
        <div style={styles.crestRow}>
          <div className="civic-stamp">
            <span>✦</span>
            <span>MUNICIPAL CORPORATION OF DELHI · EST. 2026</span>
            <span>✦</span>
          </div>
        </div>

        {/* Brand Header with Classical Chakra Seal */}
        <div style={styles.logoRow}>
          <div style={styles.chakraIconWrap}>
            <svg
              width="44"
              height="44"
              viewBox="0 0 96 96"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ animation: 'chakra-spin 20s linear infinite' }}
            >
              <circle cx="48" cy="48" r="44" stroke="#c59b27" strokeWidth="2.5" strokeDasharray="3 4" />
              <circle cx="48" cy="48" r="38" stroke="#17372c" strokeWidth="1" strokeOpacity="0.4" />
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = i * 30
                const rad = (angle * Math.PI) / 180
                return (
                  <line
                    key={i}
                    x1="48"
                    y1="48"
                    x2={48 + 36 * Math.cos(rad)}
                    y2={48 + 36 * Math.sin(rad)}
                    stroke="#c59b27"
                    strokeWidth="1.2"
                    strokeOpacity="0.75"
                  />
                )
              })}
              <path d="M48 10 C53 22 58 28 48 36 C38 28 43 22 48 10 Z" fill="#1b4332" stroke="#c59b27" strokeWidth="1" />
              <path d="M86 48 C74 53 68 58 60 48 C68 38 74 43 86 48 Z" fill="#2d6a4f" stroke="#c59b27" strokeWidth="1" />
              <path d="M48 86 C43 74 38 68 48 60 C58 68 53 74 48 86 Z" fill="#1b4332" stroke="#c59b27" strokeWidth="1" />
              <path d="M10 48 C22 43 28 38 36 48 C28 58 22 53 10 48 Z" fill="#2d6a4f" stroke="#c59b27" strokeWidth="1" />
              <circle cx="48" cy="48" r="8" fill="#c59b27" />
              <circle cx="48" cy="48" r="4" fill="#071510" />
            </svg>
          </div>
          <div>
            <div style={styles.logoTitle} className="font-editorial">WasteChakra</div>
            <div style={styles.logoSub}>Imperial Dispatch Desk · Greater Capital Region</div>
          </div>
        </div>

        <h1 style={styles.heading} className="font-serif">Official Dispatch Portal</h1>
        <p style={styles.subheading}>
          Access live telemetric fleet routing, predictive fill heuristics, and SWM 2026 municipal compliance records.
        </p>

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={16} color="#b84a39" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Demo Login */}
        <button type="button" onClick={handleDemoLogin} style={styles.demoLoginBtn}>
          <Sparkles size={16} color="#c59b27" />
          <span>Quick Evaluator Access (1-Click Demo)</span>
        </button>

        <div style={styles.dividerRow}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or sign in with gazetted credentials</span>
          <div style={styles.dividerLine} />
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Official Municipal Dispatch ID / Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={styles.input}
              placeholder="admin@ecofleet.ai"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Authorisation Key</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ ...styles.input, paddingRight: '44px' }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={styles.eyeBtn}
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={16} color="#8c6d16" /> : <Eye size={16} color="#8c6d16" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? (
              <>
                <ChakraLoader size={18} color="#ffffff" accentColor="#f5e8b7" />
                <span>Authenticating with Municipal Dispatch…</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span>Enter Municipal Console</span>
              </>
            )}
          </button>
        </form>

        <div style={styles.demoHintBox}>
          <strong>Default Evaluation Credentials:</strong>
          <div style={styles.hintRow}>
            <span>Dispatch ID:</span>
            <code style={styles.code}>admin@ecofleet.ai</code>
          </div>
          <div style={styles.hintRow}>
            <span>Key:</span>
            <code style={styles.code}>EcoFleet@2026</code>
          </div>
        </div>

        {/* Heart in Delhi NCR footer seal */}
        <div style={styles.delhiFooterBadge}>
          <span>Crafted with Heart in Delhi NCR</span>
          <span style={{ opacity: 0.7 }}>·</span>
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>दिल से दिल्ली NCR में निर्मित</span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at top center, #17372c 0%, #0d2019 45%, #071510 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '36px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 24px 64px rgba(7, 21, 16, 0.45)',
    border: '1px solid #c59b27',
  },
  crestRow: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f1ede1',
  },
  chakraIconWrap: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: '#071510',
    border: '1.5px solid #c59b27',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 14px rgba(197, 155, 39, 0.25)',
  },
  logoTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#112820',
    letterSpacing: '-0.3px',
  },
  logoSub: {
    fontSize: '11px',
    color: '#8c6d16',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#112820',
    marginBottom: '6px',
  },
  subheading: {
    fontSize: '13px',
    color: '#5e6d66',
    marginBottom: '20px',
    lineHeight: 1.45,
  },
  demoLoginBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '11px',
    background: '#fcfaf5',
    color: '#8c6d16',
    border: '1px solid #dfb743',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    marginBottom: '16px',
    transition: 'all 0.15s ease',
  },
  dividerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '12px 0 18px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#e2dac9',
  },
  dividerText: {
    fontSize: '11px',
    color: '#899891',
    fontWeight: 600,
    letterSpacing: '0.04em',
  },
  errorBox: {
    background: '#fcf1ef',
    border: '1px solid #f2c7c0',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12.5px',
    color: '#b84a39',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#112820',
    letterSpacing: '0.02em',
  },
  input: {
    padding: '11px 14px',
    borderRadius: '8px',
    border: '1px solid #e2dac9',
    fontSize: '13.5px',
    color: '#112820',
    background: '#faf8f3',
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  submitBtn: {
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: '#112820',
    color: '#f8f6f0',
    border: '1px solid #c59b27',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(17,40,32,0.3)',
    letterSpacing: '0.03em',
  },
  demoHintBox: {
    marginTop: '20px',
    background: '#f8f6f0',
    border: '1px solid #e2dac9',
    borderRadius: '8px',
    padding: '12px 14px',
    fontSize: '11.5px',
    color: '#5e6d66',
  },
  hintRow: {
    display: 'flex',
    gap: '6px',
    marginTop: '4px',
    alignItems: 'center',
  },
  code: {
    fontFamily: 'var(--font-mono)',
    color: '#112820',
    background: '#ede7d8',
    padding: '1px 5px',
    borderRadius: '4px',
  },
  delhiFooterBadge: {
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #f1ede1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '11px',
    color: '#8c6d16',
    fontWeight: 600,
    letterSpacing: '0.04em',
  },
}
