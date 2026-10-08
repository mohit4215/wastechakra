import React from 'react'
import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import {
  Leaf, LayoutDashboard, Map, Truck, BarChart2, Navigation,
  ShieldCheck, AlertTriangle, Play, Sparkles, Award
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
import UnauthorizedPage from './pages/UnauthorizedPage.jsx'

const NAV_MAIN = [
  { to: '/',          icon: LayoutDashboard, label: 'Command Dashboard' },
  { to: '/routes',    icon: Map,             label: 'Live Route Map & Sim', badge: 'Live Sim', badgeColor: '#10b981' },
  { to: '/forecast',  icon: BarChart2,       label: 'AI Volume Forecast' },
  { to: '/fleet',     icon: Truck,           label: 'Fleet Operations',    badge: '6 Trucks' },
]

const NAV_OPERATIONS = [
  { to: '/driver',    icon: Navigation,      label: 'Driver Cockpit HUD',   badge: 'Turn-by-Turn' },
  { to: '/analytics', icon: ShieldCheck,     label: 'SWM 2026 ESG Audit',   badge: '98.7%' },
  { to: '/report',    icon: AlertTriangle,   label: 'Citizen Grievance & AI', badge: 'Public' },
]

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppShell() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route
        path="/report"
        element={
          <div style={{ minHeight: '100vh', background: '#f4f7f6' }}>
            <Navbar pageTitle="Citizen Grievance Redressal" />
            <CitizenReportPage />
          </div>
        }
      />
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f7f6' }}>
              {/* Modern Eco-Obsidian Sidebar */}
              <aside style={styles.sidebar}>
                {/* Brand Header */}
                <div style={styles.brand}>
                  <div style={styles.logoWrap}>
                    <Leaf size={22} color="#10b981" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div style={styles.brandTitle}>EcoFleet AI</div>
                    <div style={styles.brandSub}>MCD Municipal Router</div>
                  </div>
                </div>

                {/* Quick Simulation Link Banner */}
                <NavLink to="/routes" style={styles.simBanner}>
                  <div style={styles.simIcon}>
                    <Play size={13} color="#ffffff" fill="#ffffff" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.simTitle}>Fleet Simulation</div>
                    <div style={styles.simSub}>Dispatch & track live</div>
                  </div>
                  <span style={styles.simPill}>Live</span>
                </NavLink>

                {/* Nav items */}
                <div style={styles.navContainer}>
                  <div style={styles.sectionHeader}>FLEET INTELLIGENCE</div>
                  {NAV_MAIN.map(({ to, icon: Icon, label, badge, badgeColor }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === '/'}
                      style={({ isActive }) => ({
                        ...styles.navLink,
                        ...(isActive ? styles.navLinkActive : {}),
                      })}
                    >
                      <Icon size={17} />
                      <span style={{ flex: 1 }}>{label}</span>
                      {badge && (
                        <span
                          style={{
                            ...styles.miniBadge,
                            background: badgeColor ? `${badgeColor}25` : 'rgba(16, 185, 129, 0.15)',
                            color: badgeColor || '#10b981',
                          }}
                        >
                          {badge}
                        </span>
                      )}
                    </NavLink>
                  ))}

                  <div style={{ ...styles.sectionHeader, marginTop: '22px' }}>
                    OPERATIONS & GOVERNANCE
                  </div>
                  {NAV_OPERATIONS.map(({ to, icon: Icon, label, badge }) => (
                    <NavLink
                      key={to}
                      to={to}
                      style={({ isActive }) => ({
                        ...styles.navLink,
                        ...(isActive ? styles.navLinkActive : {}),
                      })}
                    >
                      <Icon size={17} />
                      <span style={{ flex: 1 }}>{label}</span>
                      {badge && <span style={styles.miniBadge}>{badge}</span>}
                    </NavLink>
                  ))}
                </div>

                {/* Environmental Impact Widget */}
                <div style={styles.sidebarFooter}>
                  <div style={styles.footerCard}>
                    <div style={styles.compBadgeRow}>
                      <Award size={13} color="#10b981" />
                      <span style={styles.compBadge}>WasteChakra 2026</span>
                    </div>
                    <div style={styles.footerStatRow}>
                      <span style={styles.statLabel}>CO₂ Abated:</span>
                      <strong style={styles.statVal}>1,174 kg</strong>
                    </div>
                    <div style={styles.footerStatRow}>
                      <span style={styles.statLabel}>Fuel Saved:</span>
                      <strong style={styles.statVal}>438 Litres</strong>
                    </div>
                    <div style={styles.trackPill}>AI Smart Municipal Governance</div>
                  </div>
                </div>
              </aside>

              {/* Main Content Area */}
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
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppShell />
      </HashRouter>
    </AuthProvider>
  )
}

const styles = {
  sidebar: {
    width: '256px',
    minHeight: '100vh',
    background: '#061914',
    borderRight: '1px solid #143e33',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '18px 20px',
    borderBottom: '1px solid #143e33',
  },
  logoWrap: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: '#ffffff',
    fontWeight: 800,
    fontSize: '17px',
    letterSpacing: '-0.3px',
  },
  brandSub: {
    color: '#6ee7b7',
    fontSize: '11px',
    fontWeight: 500,
  },
  simBanner: {
    margin: '14px 14px 4px 14px',
    padding: '10px 12px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(6,182,212,0.15) 100%)',
    border: '1px solid rgba(16,185,129,0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  simIcon: {
    width: '26px',
    height: '26px',
    borderRadius: '8px',
    background: '#10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  simTitle: {
    fontSize: '12.5px',
    fontWeight: 700,
    color: '#ffffff',
  },
  simSub: {
    fontSize: '10px',
    color: '#a7f3d0',
  },
  simPill: {
    fontSize: '9.5px',
    fontWeight: 800,
    textTransform: 'uppercase',
    color: '#10b981',
    background: 'rgba(16,185,129,0.2)',
    padding: '2px 6px',
    borderRadius: '10px',
  },
  navContainer: {
    flex: 1,
    padding: '14px 12px',
    overflowY: 'auto',
  },
  sectionHeader: {
    fontSize: '10px',
    fontWeight: 800,
    color: '#34d399',
    opacity: 0.7,
    letterSpacing: '0.8px',
    padding: '0 12px 6px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
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
    background: 'rgba(16, 185, 129, 0.18)',
    fontWeight: 700,
    border: '1px solid rgba(16, 185, 129, 0.35)',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
  },
  miniBadge: {
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: '12px',
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
  },
  sidebarFooter: {
    padding: '14px',
    borderTop: '1px solid #143e33',
  },
  footerCard: {
    background: '#0c2720',
    borderRadius: '12px',
    padding: '12px 14px',
    border: '1px solid #1d5244',
  },
  compBadgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px',
  },
  compBadge: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#10b981',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  footerStatRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11.5px',
    marginBottom: '4px',
  },
  statLabel: {
    color: '#6ee7b7',
    opacity: 0.8,
  },
  statVal: {
    color: '#ffffff',
  },
  trackPill: {
    marginTop: '8px',
    background: 'rgba(6, 182, 212, 0.15)',
    border: '1px solid rgba(6, 182, 212, 0.3)',
    color: '#38bdf8',
    fontSize: '9.5px',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  mainWrapper: {
    marginLeft: '256px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: 'calc(100% - 256px)',
  },
  main: {
    flex: 1,
    overflowY: 'auto',
  },
}
