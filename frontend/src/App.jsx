import React from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { Leaf, LayoutDashboard, Map, Truck, BarChart2 } from 'lucide-react'
import Dashboard from './pages/Dashboard.jsx'
import RouteMap from './pages/RouteMap.jsx'
import FleetPage from './pages/FleetPage.jsx'
import ForecastPage from './pages/ForecastPage.jsx'

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/routes',    icon: Map,             label: 'Route Map' },
  { to: '/forecast',  icon: BarChart2,       label: 'Forecasts' },
  { to: '/fleet',     icon: Truck,           label: 'Fleet' },
]

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          {/* Logo */}
          <div style={styles.logo}>
            <Leaf size={28} color="#22c55e" />
            <div>
              <div style={styles.logoTitle}>EcoFleet AI</div>
              <div style={styles.logoSub}>MCD Route Optimizer</div>
            </div>
          </div>

          {/* Nav links */}
          <nav style={{ flex: 1, padding: '8px 0' }}>
            {NAV.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                })}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div style={styles.sidebarFooter}>
            <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
              <div style={{ fontWeight: 600, color: '#22c55e' }}>WasteChakra 2026</div>
              <div>Team: Love Nature</div>
              <div>Mohit Agarwal · AKGEC</div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main style={styles.main}>
          <Routes>
            <Route path="/"         element={<Dashboard />} />
            <Route path="/routes"   element={<RouteMap />} />
            <Route path="/forecast" element={<ForecastPage />} />
            <Route path="/fleet"    element={<FleetPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

const styles = {
  sidebar: {
    width: '220px',
    minHeight: '100vh',
    background: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '20px 16px',
    borderBottom: '1px solid #1e293b',
  },
  logoTitle: {
    color: '#f1f5f9',
    fontWeight: 700,
    fontSize: '16px',
    lineHeight: 1.2,
  },
  logoSub: {
    color: '#64748b',
    fontSize: '11px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '11px 20px',
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.15s',
    borderLeft: '3px solid transparent',
  },
  navLinkActive: {
    color: '#22c55e',
    background: '#0f2a1c',
    borderLeft: '3px solid #22c55e',
  },
  main: {
    marginLeft: '220px',
    flex: 1,
    minHeight: '100vh',
    background: '#f8fafc',
    overflowY: 'auto',
  },
  sidebarFooter: {
    padding: '16px',
    borderTop: '1px solid #1e293b',
  },
}
