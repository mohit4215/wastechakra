import React from 'react'
import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import {
  Leaf, LayoutDashboard, Map, Truck, BarChart2, Navigation,
  ShieldCheck, AlertTriangle, Play, Award, Compass, BookOpen
} from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import Navbar from './components/common/Navbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import RouteMap from './pages/RouteMap.jsx'
import ForecastPage from './pages/ForecastPage.jsx'
import FleetPage from './pages/FleetPage.jsx'
import DriverPage from './pages/DriverPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import CitizenReportPage from './pages/CitizenReportPage.jsx'
import LandingPortal from './pages/LandingPortal.jsx'
import LoginPage from './pages/LoginPage.jsx'
import UnauthorizedPage from './pages/UnauthorizedPage.jsx'
import DelhiWelcomeScreen from './components/common/DelhiWelcomeScreen.jsx'

const NAV_MAIN = [
  { to: '/',          icon: LayoutDashboard, label: 'Command Console' },
  { to: '/routes',    icon: Map,             label: 'Live Route Map & Sim', badge: 'Live Sim', badgeColor: '#52b788' },
  { to: '/forecast',  icon: BarChart2,       label: 'AI Volume Forecast' },
  { to: '/fleet',     icon: Truck,           label: 'Fleet Operations',    badge: '8 Trucks' },
]

const NAV_OPERATIONS = [
  { to: '/driver',    icon: Navigation,      label: 'Driver Cockpit HUD',   badge: 'Turn-by-Turn' },
  { to: '/analytics', icon: ShieldCheck,     label: 'SWM 2026 ESG Audit',   badge: '98.7%' },
  { to: '/report',    icon: AlertTriangle,   label: 'Citizen Grievance & AI', badge: 'Public' },
  { to: '/about',     icon: BookOpen,        label: 'Public Waste Manifesto' },
]

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppShell() {
  return (
    <>
      <DelhiWelcomeScreen />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route
        path="/about"
        element={
          <div style={{ minHeight: '100vh', background: '#f7f5f0' }}>
            <Navbar pageTitle="WasteChakra Manifesto" />
            <LandingPortal />
          </div>
        }
      />
      <Route
        path="/report"
        element={
          <div style={{ minHeight: '100vh', background: '#f7f5f0' }}>
            <Navbar pageTitle="Citizen Grievance Redressal" />
            <CitizenReportPage />
          </div>
        }
      />
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f5f0' }}>
              {/* Forest-Earth Architectural Sidebar */}
              <aside style={styles.sidebar}>
                {/* Brand Header */}
                <div style={styles.brand}>
                  <div style={styles.logoWrap}>
                    <Leaf size={20} color="#d8f3dc" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div style={styles.brandTitle}>WasteChakra</div>
                    <div style={styles.brandSub}>EcoFleet AI · MCD Delhi</div>
                  </div>
                </div>

                {/* Quick Simulation Link Banner */}
                <NavLink to="/routes" style={styles.simBanner}>
                  <div style={styles.simIcon}>
                    <Play size={12} color="#ffffff" fill="#ffffff" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.simTitle}>Fleet Simulation</div>
                    <div style={styles.simSub}>Dispatch & track CVRP</div>
                  </div>
                  <span style={styles.simPill}>Live</span>
                </NavLink>

                {/* Nav items */}
                <nav style={styles.navContainer} aria-label="Main Navigation">
                  <div style={styles.sectionHeader}>MUNICIPAL INTELLIGENCE</div>
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
                      <Icon size={16} />
                      <span style={{ flex: 1 }}>{label}</span>
                      {badge && (
                        <span
                          style={{
                            ...styles.miniBadge,
                            background: badgeColor ? `${badgeColor}22` : 'rgba(82, 183, 136, 0.2)',
                            color: badgeColor || '#a7f3d0',
                          }}
                        >
                          {badge}
                        </span>
                      )}
                    </NavLink>
                  ))}

                  <div style={{ ...styles.sectionHeader, marginTop: '20px' }}>
                    FIELD OPERATIONS & CIVIC
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
                      <Icon size={16} />
                      <span style={{ flex: 1 }}>{label}</span>
                      {badge && <span style={styles.miniBadge}>{badge}</span>}
                    </NavLink>
                  ))}
                </nav>

                {/* Environmental Impact Widget */}
                <div style={styles.sidebarFooter}>
                  <div style={styles.footerCard}>
                    <div style={styles.compBadgeRow}>
                      <Award size={13} color="#52b788" />
                      <span style={styles.compBadge}>SWM Rules 2026 Audit</span>
                    </div>
                    <div style={styles.footerStatRow}>
                      <span style={styles.statLabel}>CO₂ Abated:</span>
                      <strong style={styles.statVal}>1,174 kg</strong>
                    </div>
                    <div style={styles.footerStatRow}>
                      <span style={styles.statLabel}>Fuel Saved:</span>
                      <strong style={styles.statVal}>438 Litres</strong>
                    </div>
                    <div style={styles.trackPill}>MoHUA Smart City Certified</div>
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
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <HashRouter>
          <AppShell />
        </HashRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}

const styles = {
  sidebar: {
    width: '254px',
    minHeight: '100vh',
    background: '#05140e',
    borderRight: '1px solid #133a2c',
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
    padding: '16px 18px',
    borderBottom: '1px solid #133a2c',
  },
  logoWrap: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: '#1b4332',
    border: '1px solid #2d6a4f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: '#ffffff',
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: '16.5px',
    letterSpacing: '-0.3px',
  },
  brandSub: {
    color: '#74c69d',
    fontSize: '11px',
    fontWeight: 500,
  },
  simBanner: {
    margin: '12px 12px 2px 12px',
    padding: '10px 12px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, rgba(45,106,79,0.4) 0%, rgba(27,67,50,0.3) 100%)',
    border: '1px solid rgba(82,183,136,0.35)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  simIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    background: '#2d6a4f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  simTitle: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#ffffff',
  },
  simSub: {
    fontSize: '10px',
    color: '#b7e4c7',
  },
  simPill: {
    fontSize: '9px',
    fontWeight: 800,
    textTransform: 'uppercase',
    color: '#d8f3dc',
    background: 'rgba(82,183,136,0.25)',
    padding: '2px 5px',
    borderRadius: '6px',
  },
  navContainer: {
    flex: 1,
    padding: '14px 10px',
    overflowY: 'auto',
  },
  sectionHeader: {
    fontSize: '10px',
    fontWeight: 800,
    color: '#74c69d',
    letterSpacing: '0.07em',
    padding: '0 10px 6px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 12px',
    color: '#8b9f97',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 500,
    borderRadius: '8px',
    marginBottom: '2px',
    transition: 'all 0.12s ease',
  },
  navLinkActive: {
    color: '#ffffff',
    background: 'rgba(45, 106, 79, 0.45)',
    fontWeight: 700,
    border: '1px solid rgba(82, 183, 136, 0.3)',
  },
  miniBadge: {
    fontSize: '9.5px',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '8px',
    background: 'rgba(82, 183, 136, 0.18)',
    color: '#b7e4c7',
  },
  sidebarFooter: {
    padding: '12px',
    borderTop: '1px solid #133a2c',
  },
  footerCard: {
    background: '#0c231a',
    borderRadius: '10px',
    padding: '12px',
    border: '1px solid #1a4435',
  },
  compBadgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '6px',
  },
  compBadge: {
    fontSize: '10.5px',
    fontWeight: 800,
    color: '#74c69d',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  footerStatRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    marginBottom: '3px',
  },
  statLabel: {
    color: '#b7e4c7',
    opacity: 0.85,
  },
  statVal: {
    color: '#ffffff',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  trackPill: {
    marginTop: '6px',
    background: 'rgba(45, 106, 79, 0.35)',
    border: '1px solid rgba(82, 183, 136, 0.25)',
    color: '#d8f3dc',
    fontSize: '9px',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '6px',
    textAlign: 'center',
  },
  mainWrapper: {
    marginLeft: '254px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: 'calc(100% - 254px)',
  },
  main: {
    flex: 1,
    overflowY: 'auto',
  },
}
