import React, { useState, useEffect } from 'react'
import {
  Leaf, Sun, CloudRain, Wind, Clock, LogOut, Activity,
  RefreshCw, Menu, X, ArrowUpRight
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar({ pageTitle = 'Dashboard' }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [weatherIndex, setWeatherIndex] = useState(0)
  const [now, setNow] = useState(new Date())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const weatherStates = [
    { label: 'Clear 29°C (Dry)', icon: Sun, color: '#b45309', bg: '#fef3c7' },
    { label: 'Monsoon 24°C (+30% Waste)', icon: CloudRain, color: '#0369a1', bg: '#e0f2fe' },
    { label: 'Moderate 26°C', icon: Wind, color: '#1b4332', bg: '#d8f3dc' },
  ]

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const toggleWeather = () => {
    setWeatherIndex((prev) => (prev + 1) % weatherStates.length)
  }

  const currentWeather = weatherStates[weatherIndex]
  const WeatherIcon = currentWeather.icon

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AS'

  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })

  return (
    <header style={styles.navbar}>
      {/* Left: Branding & Status */}
      <div style={styles.left}>
        <Link to="/about" style={styles.logoPill}>
          <div style={styles.logoIcon}>
            <Leaf size={16} color="#ffffff" strokeWidth={2.5} />
          </div>
          <span style={styles.logoText}>WasteChakra</span>
          <span style={styles.editionBadge}>2026</span>
        </Link>

        <div style={styles.divider} />

        <div style={styles.livePill}>
          <span style={styles.greenDot} />
          <span style={styles.liveText}>ML Dispatch Active</span>
        </div>

        <Link to="/about" style={styles.storyLink}>
          <span>Public Manifesto</span>
          <ArrowUpRight size={12} />
        </Link>
      </div>

      {/* Right Controls: Weather, AQI, Clock, User Profile */}
      <div style={styles.right}>
        {/* Environmental Weather Trigger */}
        <button
          onClick={toggleWeather}
          style={{ ...styles.weatherBtn, background: currentWeather.bg, borderColor: currentWeather.color + '40' }}
          title="Click to toggle environmental condition simulation"
          aria-label={`Toggle weather condition, currently ${currentWeather.label}`}
        >
          <WeatherIcon size={14} color={currentWeather.color} />
          <span style={{ ...styles.weatherText, color: currentWeather.color }}>
            {currentWeather.label}
          </span>
          <RefreshCw size={11} color={currentWeather.color} style={{ opacity: 0.6 }} />
        </button>

        {/* Delhi AQI Metric */}
        <div style={styles.aqiChip}>
          <Activity size={14} color="#1b4332" />
          <span style={styles.aqiLabel}>Delhi AQI:</span>
          <span style={styles.aqiVal}>142</span>
          <span style={styles.aqiTag}>Moderate</span>
        </div>

        {/* Live Clock */}
        <div style={styles.clockBox}>
          <Clock size={12} color="#6b7280" />
          <span style={styles.clockDate}>{dateStr}</span>
          <span style={styles.clockTime}>{timeStr}</span>
        </div>

        {/* User Card */}
        <div style={styles.userChip}>
          <div style={styles.avatar}>{initials}</div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user?.full_name || user?.name || 'Aditya Singh'}</span>
            <span style={styles.userRole}>MCD Fleet Admin</span>
          </div>
        </div>

        {/* Sign Out */}
        <button style={styles.logoutBtn} onClick={logout} title="Sign Out" aria-label="Sign Out">
          <LogOut size={14} />
        </button>
      </div>
    </header>
  )
}

const styles = {
  navbar: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: 62,
    background: '#ffffff',
    borderBottom: '1px solid #e2ddd2',
    boxShadow: '0 1px 3px rgba(27,67,50,0.03)',
    gap: 16,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logoPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    background: '#1b4332',
    padding: '4px 10px 4px 5px',
    borderRadius: '20px',
    textDecoration: 'none',
  },
  logoIcon: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: '#2d6a4f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13.5,
    fontWeight: 700,
    color: '#ffffff',
    letterSpacing: '-0.2px',
  },
  editionBadge: {
    fontSize: 9.5,
    fontWeight: 700,
    color: '#d8f3dc',
    background: 'rgba(216, 243, 220, 0.15)',
    padding: '1px 5px',
    borderRadius: '8px',
  },
  divider: {
    width: 1,
    height: 20,
    background: '#e2ddd2',
  },
  livePill: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#edf7f0',
    border: '1px solid #b7e4c7',
    padding: '3px 9px',
    borderRadius: '16px',
  },
  greenDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: '50%',
    background: '#1b4332',
  },
  liveText: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1b4332',
  },
  storyLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11.5,
    fontWeight: 600,
    color: '#556b2f',
    textDecoration: 'none',
    padding: '3px 8px',
    borderRadius: '6px',
    background: '#f7f5f0',
    border: '1px solid #e2ddd2',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  weatherBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    border: '1px solid',
    borderRadius: 16,
    padding: '4px 10px',
    cursor: 'pointer',
    fontSize: 11.5,
    fontWeight: 600,
  },
  weatherText: {
    fontSize: 11.5,
    fontWeight: 600,
  },
  aqiChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    background: '#f7f5f0',
    border: '1px solid #e2ddd2',
    borderRadius: 16,
    padding: '4px 10px',
  },
  aqiLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: 600,
  },
  aqiVal: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 12,
    fontWeight: 700,
    color: '#1c2421',
  },
  aqiTag: {
    fontSize: 9.5,
    fontWeight: 700,
    color: '#1b4332',
    background: '#d8f3dc',
    padding: '1px 5px',
    borderRadius: '6px',
  },
  clockBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    background: '#f7f5f0',
    border: '1px solid #e2ddd2',
    borderRadius: 16,
    padding: '4px 10px',
  },
  clockDate: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: 500,
  },
  clockTime: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11.5,
    fontWeight: 600,
    color: '#1c2421',
  },
  userChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '3px 8px 3px 4px',
    background: '#f7f5f0',
    border: '1px solid #e2ddd2',
    borderRadius: 20,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    background: '#1b4332',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 800,
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.15,
  },
  userName: {
    fontSize: 11.5,
    fontWeight: 700,
    color: '#1c2421',
  },
  userRole: {
    fontSize: 9.5,
    color: '#6b7280',
  },
  logoutBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: '1px solid #e2ddd2',
    background: '#ffffff',
    color: '#6b7280',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}
