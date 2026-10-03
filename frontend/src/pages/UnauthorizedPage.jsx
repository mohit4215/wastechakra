import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldOff, ArrowLeft, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function UnauthorizedPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <ShieldOff size={40} color="#ef4444" strokeWidth={1.5} />
        </div>
        <h1 style={styles.title}>Access Denied</h1>
        <p style={styles.message}>
          Your account (<strong>{user?.email || 'unknown'}</strong>) does not have permission
          to view this page.
        </p>
        <p style={styles.sub}>
          Role required: <span style={styles.roleBadge}>Fleet Manager</span> or{' '}
          <span style={styles.roleBadge}>Admin</span>
        </p>
        <div style={styles.actions}>
          <button style={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Go Back
          </button>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={16} />
            Switch Account
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
    textAlign: 'center',
  },
  iconWrap: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: '12px',
  },
  message: {
    fontSize: '14px',
    color: '#475569',
    lineHeight: 1.6,
    marginBottom: '12px',
  },
  sub: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '32px',
  },
  roleBadge: {
    display: 'inline-block',
    background: 'rgba(34,197,94,0.1)',
    color: '#16a34a',
    border: '1px solid rgba(34,197,94,0.25)',
    borderRadius: '6px',
    padding: '1px 8px',
    fontSize: '12px',
    fontWeight: 600,
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    background: '#f1f5f9',
    color: '#334155',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
}
