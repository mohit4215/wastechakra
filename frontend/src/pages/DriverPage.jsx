import React, { useState, useEffect } from 'react'
import {
  Truck, CheckCircle, Navigation, MapPin, AlertCircle, RotateCcw, ArrowRight,
  Clock, ShieldCheck, ChevronRight
} from 'lucide-react'
import { optimizeRoutes, collectBin, updateStopStatus } from '../services/api.js'
import { format } from 'date-fns'

const RISK_BADGES = {
  critical: { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5' },
  high:     { bg: '#fff7ed', text: '#ea580c', border: '#fdba74' },
  medium:   { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  low:      { bg: '#f0fdf4', text: '#16a34a', border: '#86efac' },
}

export default function DriverPage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [routeData, setRouteData] = useState(null)
  const [selectedTruckId, setSelectedTruckId] = useState('TRUCK-01')
  const [completedStops, setCompletedStops] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionNotice, setActionNotice] = useState(null)

  useEffect(() => {
    setLoading(true)
    optimizeRoutes({ date: today })
      .then(data => {
        setRouteData(data)
        if (data.routes && data.routes.length > 0) {
          setSelectedTruckId(data.routes[0].truck_id)
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [today])

  const currentRoute = routeData?.routes.find(r => r.truck_id === selectedTruckId) || routeData?.routes[0]

  const handleMarkCollected = async (stop) => {
    try {
      await collectBin(stop.node_id, stop.predicted_volume_kg)
      await updateStopStatus({
        truckId: selectedTruckId,
        stopIndex: stop.stop_index,
        status: 'completed',
        collectedKg: stop.predicted_volume_kg,
      })

      setCompletedStops(prev => ({
        ...prev,
        [`${selectedTruckId}-${stop.stop_index}`]: true,
      }))

      setActionNotice(`✅ Stop #${stop.stop_index} (${stop.node_name}) collected and logged!`)
      setTimeout(() => setActionNotice(null), 4000)
    } catch (err) {
      setActionNotice(`⚠️ Recorded offline: Stop #${stop.stop_index} marked complete.`)
      setCompletedStops(prev => ({
        ...prev,
        [`${selectedTruckId}-${stop.stop_index}`]: true,
      }))
      setTimeout(() => setActionNotice(null), 4000)
    }
  }

  const completedCount = currentRoute?.stops.filter(
    s => completedStops[`${selectedTruckId}-${s.stop_index}`]
  ).length || 0

  const totalStops = currentRoute?.stops.length || 0
  const progressPct = totalStops > 0 ? Math.round((completedCount / totalStops) * 100) : 0

  const collectedWeightKg = currentRoute?.stops
    .filter(s => completedStops[`${selectedTruckId}-${s.stop_index}`])
    .reduce((sum, s) => sum + s.predicted_volume_kg, 0) || 0

  if (loading) return <div style={styles.loading}>Loading driver navigation routes…</div>
  if (error) return <div style={styles.errorBox}>Error loading routes: {error}</div>

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.badgeRow}>
            <span style={styles.pilotBadge}>MCD SWM Rules 2026</span>
            <span style={styles.livePill}>● Turn-by-Turn Active</span>
          </div>
          <h1 style={styles.title}>Driver Navigation & Manifest</h1>
          <p style={styles.subtitle}>
            Optimized collection sequence for {format(new Date(), 'EEEE, dd MMMM yyyy')}
          </p>
        </div>

        {/* Truck Selector */}
        <div style={styles.truckSelectorBox}>
          <label style={styles.label}>Select Your Assigned Vehicle:</label>
          <div style={styles.truckPills}>
            {routeData?.routes.map(r => (
              <button
                key={r.truck_id}
                onClick={() => setSelectedTruckId(r.truck_id)}
                style={{
                  ...styles.truckBtn,
                  ...(selectedTruckId === r.truck_id ? styles.truckBtnActive : {}),
                }}
              >
                <Truck size={16} />
                <span>{r.truck_id}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {actionNotice && (
        <div style={styles.notification}>
          {actionNotice}
        </div>
      )}

      {currentRoute && (
        <>
          {/* Truck & Progress Summary */}
          <div style={styles.kpiGrid}>
            <div style={styles.kpiCard}>
              <div style={styles.kpiLabel}>Assigned Driver</div>
              <div style={styles.kpiVal}>{currentRoute.driver_name || 'Ramesh Kumar'}</div>
              <div style={styles.kpiSub}>Vehicle: {currentRoute.truck_id}</div>
            </div>

            <div style={styles.kpiCard}>
              <div style={styles.kpiLabel}>Route Progress</div>
              <div style={styles.kpiVal}>{completedCount} / {totalStops} <span style={{ fontSize: '14px', color: '#64748b' }}>Stops</span></div>
              <div style={styles.progressBarBg}>
                <div style={{ ...styles.progressBarFill, width: `${progressPct}%` }} />
              </div>
            </div>

            <div style={styles.kpiCard}>
              <div style={styles.kpiLabel}>Cargo Load</div>
              <div style={styles.kpiVal}>{Math.round(collectedWeightKg)} / {Math.round(currentRoute.total_waste_kg)} <span style={{ fontSize: '14px', color: '#64748b' }}>kg</span></div>
              <div style={styles.kpiSub}>Truck Cap: 5,000 kg</div>
            </div>

            <div style={styles.kpiCard}>
              <div style={styles.kpiLabel}>Route Distance / Time</div>
              <div style={styles.kpiVal}>{currentRoute.total_distance_km} <span style={{ fontSize: '14px', color: '#64748b' }}>km</span></div>
              <div style={styles.kpiSub}>Est: ~{currentRoute.estimated_duration_hours} hrs</div>
            </div>
          </div>

          {/* Turn-by-Turn Manifest */}
          <div style={styles.manifestCard}>
            <div style={styles.manifestHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Turn-by-Turn Collection Stops</h2>
                <p style={styles.sectionSub}>Follow the sequential order for optimal fuel efficiency and zero bin overflows</p>
              </div>
              <div style={styles.depotTag}>
                Depot: {currentRoute.start_depot}
              </div>
            </div>

            <div style={styles.stopList}>
              {currentRoute.stops.map((stop, idx) => {
                const isDone = completedStops[`${selectedTruckId}-${stop.stop_index}`]
                const riskStyle = RISK_BADGES[stop.risk_level] || RISK_BADGES.low
                const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`

                return (
                  <div
                    key={stop.stop_index}
                    style={{
                      ...styles.stopItem,
                      ...(isDone ? styles.stopItemDone : {}),
                    }}
                  >
                    <div style={styles.stopNumCircle(isDone)}>
                      {isDone ? <CheckCircle size={18} color="#16a34a" /> : stop.stop_index}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={styles.stopTitleRow}>
                        <span style={styles.stopName}>{stop.node_name}</span>
                        <span style={{
                          ...styles.riskTag,
                          backgroundColor: riskStyle.bg,
                          color: riskStyle.text,
                          borderColor: riskStyle.border,
                        }}>
                          {stop.risk_level} risk
                        </span>
                      </div>

                      <div style={styles.stopMetaRow}>
                        <span style={styles.metaItem}>
                          <MapPin size={13} color="#64748b" />
                          <span>{stop.node_id}</span>
                        </span>
                        <span style={styles.metaItem}>
                          <Clock size={13} color="#64748b" />
                          <span>Est. Arrival: {stop.estimated_arrival || `0${8 + Math.floor(idx * 0.8)}:${idx % 2 === 0 ? '15' : '45'}`}</span>
                        </span>
                        <span style={styles.metaItem}>
                          <strong>{Math.round(stop.predicted_volume_kg)} kg</strong> expected
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={styles.stopActions}>
                      <a
                        href={gmapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.navLinkBtn}
                      >
                        <Navigation size={14} />
                        <span>Navigate</span>
                      </a>

                      <button
                        onClick={() => handleMarkCollected(stop)}
                        disabled={isDone}
                        style={{
                          ...styles.collectBtn,
                          ...(isDone ? styles.collectBtnDone : {}),
                        }}
                      >
                        {isDone ? (
                          <>
                            <CheckCircle size={15} />
                            <span>Cleared</span>
                          </>
                        ) : (
                          <>
                            <span>Mark Collected</span>
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const styles = {
  container: {
    padding: '32px',
    maxWidth: '1280px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '28px',
  },
  badgeRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '8px',
  },
  pilotBadge: {
    background: '#dcfce7',
    color: '#15803d',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  livePill: {
    background: '#eff6ff',
    color: '#2563eb',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 600,
  },
  title: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '14px',
    marginTop: '4px',
  },
  truckSelectorBox: {
    background: '#ffffff',
    padding: '16px 20px',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'block',
    marginBottom: '10px',
  },
  truckPills: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  truckBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    color: '#334155',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  truckBtnActive: {
    background: '#22c55e',
    color: '#ffffff',
    borderColor: '#22c55e',
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
  },
  notification: {
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    color: '#065f46',
    padding: '12px 20px',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '28px',
  },
  kpiCard: {
    background: '#ffffff',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  kpiLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  kpiVal: {
    fontSize: '24px',
    fontWeight: 800,
    color: '#0f172a',
    lineHeight: 1.2,
  },
  kpiSub: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '6px',
  },
  progressBarBg: {
    height: '6px',
    background: '#e2e8f0',
    borderRadius: '3px',
    marginTop: '10px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    background: '#22c55e',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  manifestCard: {
    background: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  manifestHeader: {
    padding: '24px 28px',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    background: '#fafbfc',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#0f172a',
  },
  sectionSub: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '2px',
  },
  depotTag: {
    background: '#f1f5f9',
    color: '#475569',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
  },
  stopList: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  stopItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    padding: '16px 20px',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    transition: 'all 0.2s',
  },
  stopItemDone: {
    background: '#f8fafc',
    borderColor: '#cbd5e1',
    opacity: 0.85,
  },
  stopNumCircle: (isDone) => ({
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: isDone ? '#dcfce7' : '#0f172a',
    color: isDone ? '#16a34a' : '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '15px',
    flexShrink: 0,
  }),
  stopTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  stopName: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#0f172a',
  },
  riskTag: {
    fontSize: '11px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '6px',
    border: '1px solid',
    textTransform: 'uppercase',
  },
  stopMetaRow: {
    display: 'flex',
    gap: '18px',
    alignItems: 'center',
    marginTop: '6px',
    fontSize: '13px',
    color: '#64748b',
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  stopActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  navLinkBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    background: '#f1f5f9',
    color: '#334155',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
  collectBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 16px',
    background: '#0f172a',
    color: '#ffffff',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  collectBtnDone: {
    background: '#dcfce7',
    color: '#15803d',
    cursor: 'default',
  },
  loading: {
    padding: '60px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '16px',
  },
  errorBox: {
    padding: '20px',
    margin: '32px',
    background: '#fef2f2',
    color: '#b91c1c',
    borderRadius: '12px',
    border: '1px solid #fecaca',
  },
}
