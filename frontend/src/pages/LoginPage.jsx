import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@ecofleet.ai')
  const [password, setPassword] = useState('EcoFleet@2026')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Already authenticated? Skip to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, authLoading, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
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

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>
            <Leaf size={28} color="#22c55e" strokeWidth={2.5} />
          </div>
          <div>
            <div style={styles.logoTitle}>EcoFleet AI</div>
            <div style={styles.logoSub}>MCD Route Optimizer — WasteChakra 2026</div>
          </div>
        </div>

        <h1 style={styles.heading}>Sign in to your account</h1>
        <p style={styles.subheading}>Fleet managers and drivers use their MCD credentials.</p>

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={16} color="#dc2626" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ ...styles.input, paddingRight: '44px' }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={styles.eyeBtn}
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? (
              <span>Signing in…</span>
            ) : (
              <>
                <LogIn size={16} />
                <span>Sign in</span>
              </>
            )}
          </button>
        </form>

        {/* Demo credentials hint */}
        <div style={styles.demoBox}>
          <strong>Demo credentials:</strong>
          <div style={styles.credRow}><span>Email:</span><code>admin@ecofleet.ai</code></div>
          <div style={styles.credRow}><span>Password:</span><code>EcoFleet@2026</code></div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '28px',
  },
  logoIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.25)',
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
    fontSize: '22px',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: '6px',
  },
  subheading: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '24px',
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
    fontSize: '13px',
    color: '#dc2626',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
  },
  input: {
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    color: '#0f172a',
    background: '#f9fafb',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
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
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '13px',
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(34,197,94,0.35)',
    transition: 'all 0.15s',
  },
  demoBox: {
    marginTop: '24px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '14px 16px',
    fontSize: '12px',
    color: '#475569',
  },
  credRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px',
    alignItems: 'center',
  },
}
