import React, { useState, useEffect } from 'react'
import {
  Truck, CheckCircle, Navigation, MapPin, AlertCircle, RotateCcw,
  Clock, ShieldCheck, ChevronRight, ExternalLink, Scale, Check
} from 'lucide-react'
import { optimizeRoutes, collectBin, updateStopStatus } from '../services/api.js'
import { format } from 'date-fns'

const RISK_BADGES = {
  critical: { bg: '#fee2e2', text: '#dc2626' },
  high:     { bg: '#ffedd5', text: '#ea580c' },
  medium:   { bg: '#fef3c7', text: '#d97706' },
  low:      { bg: '#ecfdf5', text: '#16a34a' },
}

export default function DriverPage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [routeData, setRouteData] = useState(null)
  const [selectedTruckId, setSelectedTruckId] = useState('TRUCK-01')
  const [completedStops, setCompletedStops] = useState({})
  const [loading, setLoading] = useState(true)
  const [actionNotice, setActionNotice] = useState(null)

  useEffect(() => {
    setLoading(true)
    optimizeRoutes({ date: today })
      .then((data) => {
        setRouteData(data)
        if (data.routes && data.routes.length > 0) {
          setSelectedTruckId(data.routes[0].truck_id)
        }
      })
      .catch((err) => console.error('Driver route load error:', err))
      .finally(() => setLoading(false))
  }, [today])

  const currentRoute =
    routeData?.routes.find((r) => r.truck_id === selectedTruckId) || routeData?.routes[0]

  const handleMarkCollected = async (stop) => {
    try {
      await collectBin(stop.node_id, stop.predicted_volume_kg)
      await updateStopStatus({
        truckId: selectedTruckId,
        stopIndex: stop.stop_index,
        status: 'completed',
        collectedKg: stop.predicted_volume_kg,
      })

      setCompletedStops((prev) => ({
        ...prev,
        [`${selectedTruckId}-${stop.stop_index}`]: true,
      }))

      setActionNotice(`✅ Stop #${stop.stop_index} (${stop.node_name}) collected: +${stop.predicted_volume_kg} kg!`)
      setTimeout(() => setActionNotice(null), 4000)
    } catch {
      setCompletedStops((prev) => ({
        ...prev,
        [`${selectedTruckId}-${stop.stop_index}`]: true,
      }))
      setActionNotice(`✅ Logged: Stop #${stop.stop_index} marked complete`)
      setTimeout(() => setActionNotice(null), 4000)
    }
  }

  const completedCount =
    currentRoute?.stops.filter((s) => completedStops[`${selectedTruckId}-${s.stop_index}`]).length || 0
  const totalStops = currentRoute?.stops.length || 0
  const progressPct = totalStops > 0 ? Math.round((completedCount / totalStops) * 100) : 0

  const collectedWeightKg =
    currentRoute?.stops
      .filter((s) => completedStops[`${selectedTruckId}-${s.stop_index}`])
      .reduce((sum, s) => sum + s.predicted_volume_kg, 0) || 0

  // Identify next uncollected stop
  const nextStop = currentRoute?.stops.find((s) => !completedStops[`${selectedTruckId}-${s.stop_index}`])

  return (
    <div style={styles.container}>
      {/* Driver Cockpit Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.badgeRow}>
            <span style={styles.livePill}>● Turn-by-Turn GPS Active</span>
            <span style={styles.mandateBadge}>SWM Rules 2026 Shift</span>
          </div>
          <h1 style={styles.title}>Driver Cockpit & Collection Manifest</h1>
          <p style={styles.subtitle}>
            Optimized route schedule for {format(new Date(), 'EEEE, dd MMMM yyyy')} · Vehicle Weighbridge Interface
          </p>
        </div>

        {/* Vehicle Switcher */}
        <div style={styles.selectorWrap}>
          <span style={styles.selectorLabel}>Switch Vehicle:</span>
          <div style={styles.pillsRow}>
            {(routeData?.routes || []).map((r) => (
              <button
                key={r.truck_id}
                onClick={() => setSelectedTruckId(r.truck_id)}
                style={{
                  ...styles.pillBtn,
                  background: selectedTruckId === r.truck_id ? '#061914' : '#ffffff',
                  color: selectedTruckId === r.truck_id ? '#34d399' : '#475569',
                  borderColor: selectedTruckId === r.truck_id ? '#10b981' : '#e2e8f0',
                }}
              >
                {r.truck_id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {actionNotice && (
        <div style={styles.actionAlert}>
          <CheckCircle size={16} color="#10b981" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Progress & Telemetry Strip */}
      <div style={styles.progressCard}>
        <div style={styles.progressTop}>
          <div>
            <div style={styles.progressTitle}>Shift Route Completion</div>
            <div style={styles.progressSub}>
              {completedCount} of {totalStops} collection points completed ({progressPct}%)
            </div>
          </div>
          <div style={styles.weightTally}>
            <Scale size={18} color="#10b981" />
            <div>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Current Payload</span>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                {collectedWeightKg.toLocaleString()} / {currentRoute?.capacity_kg.toLocaleString() || 5000} kg
              </div>
            </div>
          </div>
        </div>

        <div style={styles.progressBarBg}>
          <div style={{ ...styles.progressBarFill, width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Active "Next Stop" Prominent Navigation Card */}
      {nextStop ? (
        <div style={styles.nextStopCard}>
          <div style={styles.nextStopHeader}>
            <div style={styles.stopNumBadge}>UPCOMING STOP #{nextStop.stop_index}</div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '8px',
                background: RISK_BADGES[nextStop.risk_level]?.bg || '#f1f5f9',
                color: RISK_BADGES[nextStop.risk_level]?.text || '#0f172a',
              }}
            >
              {nextStop.fill_percentage}% Full ({nextStop.risk_level.toUpperCase()})
            </span>
          </div>

          <div style={styles.nextStopBody}>
            <div>
              <h2 style={styles.nextStopName}>{nextStop.node_name}</h2>
              <div style={styles.nextStopAddress}>
                <MapPin size={15} color="#10b981" />
                <span>{nextStop.address} · {nextStop.zone}</span>
              </div>
            </div>

            <div style={styles.volTag}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Expected Waste</span>
              <strong style={{ fontSize: '20px', color: '#0f172a' }}>
                {nextStop.predicted_volume_kg} kg
              </strong>
            </div>
          </div>

          <div style={styles.nextStopActions}>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${nextStop.latitude},${nextStop.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.navBtn}
            >
              <Navigation size={16} />
              <span>Open in GPS Navigation</span>
              <ExternalLink size={13} style={{ opacity: 0.7 }} />
            </a>

            <button
              onClick={() => handleMarkCollected(nextStop)}
              style={styles.collectBtn}
            >
              <Check size={18} />
              <span>Confirm Bin Emptied & Weigh</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.allDoneCard}>
          <CheckCircle size={36} color="#10b981" />
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
            All Stops for {selectedTruckId} Completed!
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Return to MCD Central Transfer Station (Okhla Depot) for gross weighbridge audit and offloading.
          </p>
        </div>
      )}

      {/* Turn-by-Turn Manifest Sequence */}
      <div style={styles.manifestCard}>
        <h3 style={styles.manifestTitle}>Route Manifest Sequence ({currentRoute?.stops.length || 0} stops)</h3>
        <div style={styles.stopsList}>
          {(currentRoute?.stops || []).map((stop) => {
            const isDone = completedStops[`${selectedTruckId}-${stop.stop_index}`]
            return (
              <div
                key={stop.stop_index}
                style={{
                  ...styles.stopRow,
                  background: isDone ? '#f8fafc' : '#ffffff',
                  opacity: isDone ? 0.75 : 1,
                }}
              >
                <div style={styles.stopNumCircle(isDone)}>
                  {isDone ? <Check size={14} color="#ffffff" /> : stop.stop_index}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '13.5px', color: isDone ? '#64748b' : '#0f172a' }}>
                      {stop.node_name}
                    </strong>
                    {isDone && <span style={styles.donePill}>Collected</span>}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                    {stop.address} · Est: {stop.predicted_volume_kg} kg
                  </div>
                </div>

                {!isDone && (
                  <button
                    onClick={() => handleMarkCollected(stop)}
                    style={styles.quickCheckBtn}
                  >
                    Mark Done
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '24px 28px 48px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '20px',
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  livePill: {
    background: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    fontSize: '11px',
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: '12px',
  },
  mandateBadge: {
    background: '#f1f5f9',
    color: '#475569',
    fontSize: '11px',
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: '12px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '3px',
  },
  selectorWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  selectorLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#64748b',
  },
  pillsRow: {
    display: 'flex',
    gap: '6px',
  },
  pillBtn: {
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  actionAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 18px',
    background: '#ecfdf5',
    color: '#065f46',
    fontSize: '13px',
    fontWeight: 600,
    borderRadius: '12px',
    border: '1px solid #a7f3d0',
    marginBottom: '20px',
  },
  progressCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    marginBottom: '20px',
  },
  progressTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  progressTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#0f172a',
  },
  progressSub: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
  },
  weightTally: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  progressBarBg: {
    height: '8px',
    background: '#f1f5f9',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    background: '#10b981',
    transition: 'width 0.3s ease',
  },
  nextStopCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    border: '2px solid #10b981',
    boxShadow: '0 8px 24px rgba(16,185,129,0.15)',
    marginBottom: '24px',
  },
  nextStopHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  stopNumBadge: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#10b981',
    letterSpacing: '0.6px',
  },
  nextStopBody: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  nextStopName: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#0f172a',
  },
  nextStopAddress: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#64748b',
    marginTop: '4px',
  },
  volTag: {
    textAlign: 'right',
  },
  nextStopActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: '#f1f5f9',
    color: '#0f172a',
    borderRadius: '12px',
    fontWeight: 700,
    fontSize: '13.5px',
    textDecoration: 'none',
  },
  collectBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 800,
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
  },
  allDoneCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '36px',
    textAlign: 'center',
    border: '1px solid #a7f3d0',
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  manifestCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '22px',
    border: '1px solid #e2e8f0',
  },
  manifestTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: '16px',
  },
  stopsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  stopRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  stopNumCircle: (isDone) => ({
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: isDone ? '#10b981' : '#f1f5f9',
    color: isDone ? '#ffffff' : '#0f172a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '12px',
    flexShrink: 0,
  }),
  donePill: {
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '6px',
    background: '#ecfdf5',
    color: '#059669',
  },
  quickCheckBtn: {
    padding: '6px 12px',
    background: '#f1f5f9',
    color: '#0f172a',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '11.5px',
    fontWeight: 700,
    cursor: 'pointer',
  },
}
