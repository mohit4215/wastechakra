import React, { useState, useEffect } from 'react';
import {
  Leaf, Sun, CloudRain, Wind, Clock, LogOut, Activity,
  ShieldCheck, RefreshCw, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ pageTitle = 'Dashboard' }) {
  const { user, logout } = useAuth();
  const [weatherIndex, setWeatherIndex] = useState(0);
  const [now, setNow] = useState(new Date());

  const weatherStates = [
    { label: 'Clear 29°C', icon: Sun, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Monsoon Rain 24°C (+30% Waste)', icon: CloudRain, color: '#0ea5e9', bg: '#e0f2fe' },
    { label: 'Breezy 27°C', icon: Wind, color: '#10b981', bg: '#d1fae5' },
  ];

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const toggleWeather = () => {
    setWeatherIndex((prev) => (prev + 1) % weatherStates.length);
  };

  const currentWeather = weatherStates[weatherIndex];
  const WeatherIcon = currentWeather.icon;

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AS';

  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <header style={styles.navbar}>
      {/* Left: Branding & Status */}
      <div style={styles.left}>
        <div style={styles.logoPill}>
          <div style={styles.logoIcon}>
            <Leaf size={18} color="#ffffff" strokeWidth={2.5} />
          </div>
          <span style={styles.logoText}>WasteChakra</span>
          <span style={styles.editionBadge}>2026</span>
        </div>

        <div style={styles.divider} />

        <div style={styles.livePill}>
          <span style={styles.greenDot} />
          <span style={styles.liveText}>ML Dispatch Engine Online</span>
        </div>
      </div>

      {/* Right Controls: Weather, AQI, Live Clock, User Profile */}
      <div style={styles.right}>
        {/* Interactive Weather Toggle */}
        <button
          onClick={toggleWeather}
          style={{ ...styles.weatherBtn, background: currentWeather.bg, borderColor: currentWeather.color + '40' }}
          title="Click to toggle environmental condition"
        >
          <WeatherIcon size={15} color={currentWeather.color} />
          <span style={{ ...styles.weatherText, color: currentWeather.color }}>
            {currentWeather.label}
          </span>
          <RefreshCw size={11} color={currentWeather.color} style={{ opacity: 0.6 }} />
        </button>

        {/* Delhi AQI Metric */}
        <div style={styles.aqiChip}>
          <Activity size={14} color="#059669" />
          <span style={styles.aqiLabel}>Delhi AQI:</span>
          <span style={styles.aqiVal}>142</span>
          <span style={styles.aqiTag}>Moderate</span>
        </div>

        {/* Live Clock */}
        <div style={styles.clockBox}>
          <Clock size={13} color="#64748b" />
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

        {/* Logout */}
        <button style={styles.logoutBtn} onClick={logout} title="Sign Out">
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
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
    height: 64,
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
    gap: 16,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  logoPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#061914',
    padding: '5px 12px 5px 6px',
    borderRadius: '24px',
  },
  logoIcon: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    background: '#10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 14,
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.3px',
  },
  editionBadge: {
    fontSize: 10,
    fontWeight: 700,
    color: '#10b981',
    background: 'rgba(16, 185, 129, 0.15)',
    padding: '2px 6px',
    borderRadius: '10px',
  },
  divider: {
    width: 1,
    height: 22,
    background: '#e2e8f0',
  },
  livePill: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    padding: '4px 10px',
    borderRadius: '20px',
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#10b981',
    boxShadow: '0 0 6px #10b981',
  },
  liveText: {
    fontSize: 11.5,
    fontWeight: 600,
    color: '#065f46',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  weatherBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    border: '1px solid',
    borderRadius: 20,
    padding: '5px 12px',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
  },
  weatherText: {
    fontSize: 12,
    fontWeight: 600,
  },
  aqiChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 20,
    padding: '5px 12px',
  },
  aqiLabel: {
    fontSize: 11.5,
    color: '#64748b',
    fontWeight: 500,
  },
  aqiVal: {
    fontSize: 12.5,
    fontWeight: 700,
    color: '#0f172a',
  },
  aqiTag: {
    fontSize: 10,
    fontWeight: 700,
    color: '#047857',
    background: '#d1fae5',
    padding: '1px 6px',
    borderRadius: '8px',
  },
  clockBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 20,
    padding: '5px 12px',
  },
  clockDate: {
    fontSize: 11.5,
    color: '#64748b',
    fontWeight: 500,
  },
  clockTime: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0f172a',
    fontVariantNumeric: 'tabular-nums',
  },
  userChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '3px 10px 3px 4px',
    background: '#f1f5f9',
    borderRadius: 24,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981 0%, #065f46 100%)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 800,
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.15,
  },
  userName: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0f172a',
  },
  userRole: {
    fontSize: 10,
    color: '#64748b',
  },
  logoutBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
