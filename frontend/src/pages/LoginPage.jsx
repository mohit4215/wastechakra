import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, LogIn, Eye, EyeOff, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

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
      <div style={styles.card}>
        {/* Brand */}
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>
            <Leaf size={26} color="#10b981" strokeWidth={2.5} />
          </div>
          <div>
            <div style={styles.logoTitle}>EcoFleet AI</div>
            <div style={styles.logoSub}>MCD Municipal Router · WasteChakra 2026</div>
          </div>
        </div>

        <h1 style={styles.heading}>Command Portal Sign In</h1>
        <p style={styles.subheading}>
          Access fleet dispatch, AI route optimization, and SWM 2026 compliance analytics.
        </p>

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={16} color="#dc2626" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Demo Login */}
        <button type="button" onClick={handleDemoLogin} style={styles.demoLoginBtn}>
          <Sparkles size={16} color="#047857" />
          <span>Quick Evaluator Access (1-Click Demo)</span>
        </button>

        <div style={styles.dividerRow}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or sign in with credentials</span>
          <div style={styles.dividerLine} />
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Official MCD Email</label>
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
            <label style={styles.label}>Password</label>
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
                {showPw ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? (
              <span>Connecting to Dispatch…</span>
            ) : (
              <>
                <LogIn size={16} />
                <span>Enter Command Console</span>
              </>
            )}
          </button>
        </form>

        <div style={styles.demoHintBox}>
          <strong>Default Evaluation Credentials:</strong>
          <div style={styles.hintRow}>
            <span>Email:</span>
            <code>admin@ecofleet.ai</code>
          </div>
          <div style={styles.hintRow}>
            <span>Password:</span>
            <code>EcoFleet@2026</code>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at top center, #0c2720 0%, #061914 50%, #030d0b 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '24px',
    padding: '38px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.45)',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  logoIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTitle: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.3px',
  },
  logoSub: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: 500,
  },
  heading: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: '4px',
  },
  subheading: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '20px',
    lineHeight: 1.4,
  },
  demoLoginBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: '#ecfdf5',
    color: '#047857',
    border: '1.5px solid #a7f3d0',
    borderRadius: '12px',
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
    background: '#e2e8f0',
  },
  dividerText: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: 600,
  },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    padding: '10px 14px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12.5px',
    color: '#dc2626',
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
    color: '#374151',
  },
  input: {
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '13.5px',
    color: '#0f172a',
    background: '#f8fafc',
    outline: 'none',
    width: '100%',
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
    background: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
  },
  demoHintBox: {
    marginTop: '22px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '12px 14px',
    fontSize: '11.5px',
    color: '#475569',
  },
  hintRow: {
    display: 'flex',
    gap: '6px',
    marginTop: '4px',
    alignItems: 'center',
  },
}
