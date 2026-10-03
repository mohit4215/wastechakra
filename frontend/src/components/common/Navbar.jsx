import React, { useState, useEffect } from 'react';
import { Leaf, Cloud, Sun, CloudRain, CloudSnow, Wind, Clock, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const WEATHER_ICONS = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: CloudSnow,
  windy: Wind,
};

function WeatherChip() {
  const [weather, setWeather] = useState({ condition: 'sunny', temp: 28 });

  useEffect(() => {
    // Simulate weather fetch; replace with real API if needed
    const conditions = ['sunny', 'cloudy', 'rainy', 'windy'];
    const temps = [22, 26, 28, 30, 31];
    setWeather({
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      temp: temps[Math.floor(Math.random() * temps.length)],
    });
  }, []);

  const Icon = WEATHER_ICONS[weather.condition] || Sun;

  return (
    <div style={styles.weatherChip}>
      <Icon size={16} color="#10b981" />
      <span style={styles.weatherText}>{weather.temp}°C</span>
    </div>
  );
}

function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div style={styles.clock}>
      <Clock size={14} color="#6b7280" />
      <span style={styles.clockDate}>{dateStr}</span>
      <span style={styles.clockTime}>{timeStr}</span>
    </div>
  );
}

export default function Navbar({ pageTitle = 'Dashboard' }) {
  const { user, logout } = useAuth();

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header style={styles.navbar}>
      {/* Left: Logo + Page Title */}
      <div style={styles.left}>
        <div style={styles.logo}>
          <Leaf size={22} color="#10b981" strokeWidth={2.5} />
          <span style={styles.logoText}>EcoFleet AI</span>
        </div>
        <div style={styles.divider} />
        <h1 style={styles.pageTitle}>{pageTitle}</h1>
      </div>

      {/* Right: Weather, Clock, User, Logout */}
      <div style={styles.right}>
        <WeatherChip />
        <LiveClock />

        <div style={styles.userChip}>
          <div style={styles.avatar}>{initials}</div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user?.full_name || user?.name || 'User'}</span>
            <span style={styles.userRole}>{user?.role || 'admin'}</span>
          </div>
        </div>

        <button style={styles.logoutBtn} onClick={logout} title="Logout">
          <LogOut size={16} />
          <span style={styles.logoutText}>Logout</span>
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
    height: 60,
    background: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    gap: 16,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  logoText: {
    fontSize: 16,
    fontWeight: 700,
    color: '#065f46',
    letterSpacing: '-0.3px',
  },
  divider: {
    width: 1,
    height: 24,
    background: '#d1fae5',
    flexShrink: 0,
  },
  pageTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#374151',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  weatherChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 20,
    padding: '4px 10px',
  },
  weatherText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#065f46',
  },
  clock: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 20,
    padding: '4px 10px',
  },
  clockDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  clockTime: {
    fontSize: 12,
    fontWeight: 600,
    color: '#374151',
    fontVariantNumeric: 'tabular-nums',
  },
  userChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981, #065f46)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.2,
  },
  userName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#111827',
  },
  userRole: {
    fontSize: 11,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    background: 'none',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '6px 12px',
    color: '#6b7280',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    transition: 'all 0.15s',
  },
  logoutText: {
    fontSize: 13,
  },
};
