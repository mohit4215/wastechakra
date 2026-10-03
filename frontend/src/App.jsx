import React from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import {
  Leaf, LayoutDashboard, Map, Truck, BarChart2, Navigation,
  ShieldCheck, AlertTriangle
} from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Navbar from './components/common/Navbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import RouteMap from './pages/RouteMap.jsx'
import ForecastPage from './pages/ForecastPage.jsx'
import FleetPage from './pages/FleetPage.jsx'
import DriverPage from './pages/DriverPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import CitizenReportPage from './pages/CitizenReportPage.jsx'
import LoginPage from './pages/LoginPage.jsx'

const NAV_MAIN = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/routes',    icon: Map,             label: 'Route Map' },
  { to: '/forecast',  icon: BarChart2,       label: 'AI Forecasts' },
  { to: '/fleet',     icon: Truck,           label: 'Fleet Ops' },
]

const NAV_OPERATIONS = [
  { to: '/driver',    icon: Navigation,      label: 'Driver Nav', badge: 'Turn-by-Turn' },
  { to: '/analytics', icon: ShieldCheck,     label: 'SWM 2026 ESG' },
  { to: '/report',    icon: AlertTriangle,   label: 'Citizen Report', badge: 'Public' },
]

/** Redirect unauthenticated users to /login. */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null  // Wait for localStorage restore before redirecting
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppShell() {
  const { isAuthenticated } = useAuth()

  // Public-only routes (login page — no shell)
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {/* Citizen report is public */}
      <Route path="/report" element={
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
          <CitizenReportPage />
        </div>
      } />
      {/* All other routes require auth */}
      <Route path="*" element={
        <ProtectedRoute>
          <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            {/* Sidebar */}
            <aside style={styles.sidebar}>
              {/* Logo */}
              <div style={styles.logo}>
                <div style={styles.logoIconWrap}>
                  <Leaf size={24} color="#22c55e" strokeWidth={2.5} />
                </div>
                <div>
                  <div style={styles.logoTitle}>EcoFleet AI</div>
                  <div style={styles.logoSub}>MCD Route Optimizer</div>
                </div>
              </div>

              {/* Nav links */}
              <div style={styles.navContainer}>
                <div style={styles.sectionHeader}>FLEET DISPATCH</div>
                {NAV_MAIN.map(({ to, icon: Icon, label }) => (
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

                <div style={{ ...styles.sectionHeader, marginTop: '20px' }}>OPERATIONS & CITIZEN</div>
                {NAV_OPERATIONS.map(({ to, icon: Icon, label, badge }) => (
                  <NavLink
                    key={to}
                    to={to}
                    style={({ isActive }) => ({
                      ...styles.navLink,
                      ...(isActive ? styles.navLinkActive : {}),
                    })}
                  >
                    <Icon size={18} />
                    <span style={{ flex: 1 }}>{label}</span>
                    {badge && <span style={styles.miniBadge}>{badge}</span>}
                  </NavLink>
                ))}
              </div>

              {/* Footer */}
              <div style={styles.sidebarFooter}>
                <div style={styles.footerCard}>
                  <div style={styles.compBadge}>WasteChakra 2026</div>
                  <div style={styles.teamTitle}>Team Love Nature</div>
                  <div style={styles.leadInfo}>Mohit Agarwal · AKGEC</div>
                  <div style={styles.trackPill}>AI Smart Municipal Governance</div>
                </div>
              </div>
            </aside>

            {/* Main content area */}
            <div style={styles.mainWrapper}>
              <Navbar />
              <main style={styles.main}>
                <Routes>
                  <Route path="/"          element={<Dashboard />} />
                  <Route path="/routes"    element={<RouteMap />} />
                  <Route path="/forecast"  element={<ForecastPage />} />
                  <Route path="/fleet"     element={<FleetPage />} />
                  <Route path="/driver"    element={<DriverPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="*"          element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  )
}

const styles = {
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    background: '#090d16',
    borderRight: '1px solid #1e293b',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 18px',
    borderBottom: '1px solid #1e293b',
  },
  logoIconWrap: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'rgba(34, 197, 94, 0.12)',
    border: '1px solid rgba(34, 197, 94, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTitle: {
    color: '#ffffff',
    fontWeight: 800,
    fontSize: '17px',
    letterSpacing: '-0.3px',
  },
  logoSub: {
    color: '#64748b',
    fontSize: '11px',
    fontWeight: 500,
  },
  navContainer: {
    flex: 1,
    padding: '16px 12px',
    overflowY: 'auto',
  },
  sectionHeader: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#475569',
    letterSpacing: '0.8px',
    padding: '0 12px 6px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '13.5px',
    fontWeight: 500,
    borderRadius: '10px',
    marginBottom: '3px',
    transition: 'all 0.15s ease',
  },
  navLinkActive: {
    color: '#ffffff',
    background: 'rgba(34, 197, 94, 0.15)',
    fontWeight: 600,
    border: '1px solid rgba(34, 197, 94, 0.3)',
  },
  miniBadge: {
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '12px',
    background: 'rgba(56, 189, 248, 0.15)',
    color: '#38bdf8',
  },
  sidebarFooter: {
    padding: '16px 14px',
    borderTop: '1px solid #1e293b',
  },
  footerCard: {
    background: '#111827',
    borderRadius: '12px',
    padding: '12px',
    textAlign: 'center',
    border: '1px solid #1f2937',
  },
  compBadge: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#22c55e',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  teamTitle: {
    color: '#f3f4f6',
    fontSize: '12px',
    fontWeight: 600,
    marginTop: '2px',
  },
  leadInfo: {
    color: '#9ca3af',
    fontSize: '11px',
  },
  trackPill: {
    marginTop: '6px',
    background: '#1f2937',
    color: '#60a5fa',
    fontSize: '9.5px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '10px',
    display: 'inline-block',
  },
  mainWrapper: {
    marginLeft: '240px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: 'calc(100% - 240px)',
  },
  main: {
    flex: 1,
    overflowY: 'auto',
  },
}
