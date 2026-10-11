import React from 'react'
import { AlertOctagon, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react'

/**
 * EcoFleet AI — Production Error Boundary
 * Catches JavaScript errors in child component trees, logs them through client
 * telemetry, and renders a recoverable municipal governance fallback interface.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('[EcoFleet ErrorBoundary]', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.hash = '#/'
  }

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }))
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.iconWrap}>
              <AlertOctagon size={40} color="#ef4444" strokeWidth={2} />
            </div>

            <div style={styles.badge}>MCD TELEMETRY EXCEPTION</div>
            <h1 style={styles.title}>Municipal Interface Suspended</h1>
            <p style={styles.description}>
              An unhandled rendering fault occurred within this operational module.
              The underlying background CVRP solver and municipal database records remain secure.
            </p>

            <div style={styles.actions}>
              <button onClick={this.handleReload} style={styles.btnPrimary}>
                <RefreshCw size={16} />
                <span>Reload Application</span>
              </button>

              <button onClick={this.handleReset} style={styles.btnSecondary}>
                <Home size={16} />
                <span>Return to Dashboard</span>
              </button>
            </div>

            <div style={styles.debugSection}>
              <button onClick={this.toggleDetails} style={styles.debugToggle}>
                <span>Technical Diagnostics</span>
                {this.state.showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {this.state.showDetails && (
                <div style={styles.debugBox}>
                  <div style={styles.errorText}>
                    <strong>Error:</strong> {this.state.error?.toString()}
                  </div>
                  {this.state.errorInfo?.componentStack && (
                    <pre style={styles.stackTrace}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#090d16',
    padding: '24px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  card: {
    maxWidth: '560px',
    width: '100%',
    background: '#0f172a',
    borderRadius: '16px',
    border: '1px solid #1e293b',
    padding: '36px 32px',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
  },
  iconWrap: {
    width: '72px',
    height: '72px',
    margin: '0 auto 16px',
    borderRadius: '50%',
    background: 'rgba(239, 68, 68, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    color: '#ef4444',
    background: 'rgba(239, 68, 68, 0.1)',
    padding: '4px 10px',
    borderRadius: '999px',
    marginBottom: '12px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#f8fafc',
    margin: '0 0 10px',
  },
  description: {
    fontSize: '14px',
    color: '#94a3b8',
    lineHeight: 1.6,
    margin: '0 0 24px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '10px',
    background: '#10b981',
    color: '#ffffff',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  btnSecondary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '10px',
    background: '#1e293b',
    color: '#cbd5e1',
    border: '1px solid #334155',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  debugSection: {
    borderTop: '1px solid #1e293b',
    paddingTop: '16px',
    textAlign: 'left',
  },
  debugToggle: {
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    cursor: 'pointer',
    padding: '4px 0',
  },
  debugBox: {
    marginTop: '10px',
    padding: '12px',
    borderRadius: '8px',
    background: '#090d16',
    border: '1px solid #1e293b',
    fontSize: '12px',
    maxHeight: '160px',
    overflowY: 'auto',
  },
  errorText: {
    color: '#f87171',
    marginBottom: '6px',
    wordBreak: 'break-word',
  },
  stackTrace: {
    color: '#64748b',
    margin: 0,
    whiteSpace: 'pre-wrap',
    fontSize: '11px',
    lineHeight: 1.4,
  },
}
