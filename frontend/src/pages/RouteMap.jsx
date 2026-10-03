import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import { optimizeRoutes } from '../services/api.js'
import { format } from 'date-fns'

// Fix Leaflet default icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const TRUCK_COLORS = [
  '#22c55e', '#3b82f6', '#f97316', '#a855f7', '#ec4899',
  '#06b6d4', '#eab308', '#ef4444', '#14b8a6', '#f59e0b',
]

const RISK_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e' }

// Depot location: MCD Okhla
const DEPOT = [28.5355, 77.2510]

export default function RouteMap() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [routeData, setRouteData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTruck, setSelectedTruck] = useState(null)
  const [numTrucks, setNumTrucks] = useState(5)

  const loadRoutes = () => {
    setLoading(true)
    setError(null)
    optimizeRoutes({ date: today, numTrucks })
      .then(data => { setRouteData(data); setSelectedTruck(null) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadRoutes() }, [])

  const displayRoutes = selectedTruck
    ? routeData?.routes.filter(r => r.truck_id === selectedTruck)
    : routeData?.routes

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.title}>Optimized Route Map</h2>
          <p style={styles.sub}>{format(new Date(), 'EEEE, dd MMMM yyyy')} — MCD South Delhi</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ fontSize: '13px', color: '#64748b' }}>Trucks:</label>
          <select
            value={numTrucks}
            onChange={e => setNumTrucks(Number(e.target.value))}
            style={styles.select}
          >
            {[3, 4, 5, 6, 8, 10].map(n => <option key={n} value={n}>{n} trucks</option>)}
          </select>
          <button onClick={loadRoutes} style={styles.btn} disabled={loading}>
            {loading ? 'Optimizing…' : '🔄 Re-optimize'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          {/* Savings panel */}
          {routeData && (
            <div style={styles.savingsBox}>
              <div style={styles.savingsRow}>
                <span>Total Routes</span>
                <strong>{routeData.total_routes}</strong>
              </div>
              <div style={styles.savingsRow}>
                <span>Nodes Serviced</span>
                <strong style={{ color: '#22c55e' }}>{routeData.total_nodes_serviced}</strong>
              </div>
              <div style={styles.savingsRow}>
                <span>Nodes Skipped</span>
                <strong style={{ color: '#94a3b8' }}>{routeData.total_nodes_skipped}</strong>
              </div>
              <div style={styles.savingsRow}>
                <span>Total Distance</span>
                <strong>{routeData.total_distance_km} km</strong>
              </div>
              <div style={styles.savingsRow}>
                <span>⛽ Fuel Saved</span>
                <strong style={{ color: '#0ea5e9' }}>{routeData.estimated_fuel_saved_liters} L</strong>
              </div>
              <div style={styles.savingsRow}>
                <span>🌿 CO₂ Saved</span>
                <strong style={{ color: '#22c55e' }}>{routeData.co2_saved_kg} kg</strong>
              </div>
            </div>
          )}

          {/* Truck list */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {(routeData?.routes || []).map((route, i) => (
              <div
                key={route.truck_id}
                onClick={() => setSelectedTruck(selectedTruck === route.truck_id ? null : route.truck_id)}
                style={{
                  ...styles.truckCard,
                  borderLeft: `4px solid ${TRUCK_COLORS[i % TRUCK_COLORS.length]}`,
                  background: selectedTruck === route.truck_id ? '#f0fdf4' : '#fff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '14px' }}>{route.truck_id}</strong>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{route.stops.length} stops</span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  {route.total_distance_km} km · {route.total_waste_kg} kg
                </div>
                {/* Stop list */}
                {selectedTruck === route.truck_id && (
                  <ol style={{ margin: '8px 0 0 16px', fontSize: '11px', color: '#475569' }}>
                    {route.stops.map(s => (
                      <li key={s.node_id} style={{ marginBottom: '3px' }}>
                        <span style={{ color: RISK_COLORS[s.risk_level], fontWeight: 600 }}>●</span>{' '}
                        {s.node_name}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          {loading && (
            <div style={styles.mapOverlay}>
              <div style={styles.spinner} />
              <p>Calculating optimal routes…</p>
            </div>
          )}
          {error && (
            <div style={{ padding: '20px', color: '#ef4444' }}>
              Error: {error}<br />
              <small>Ensure the backend is running on port 8000.</small>
            </div>
          )}
          {!error && (
            <MapContainer center={DEPOT} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Depot marker */}
              <Marker position={DEPOT}>
                <Popup><strong>MCD South Zone Depot</strong><br />Okhla, New Delhi</Popup>
              </Marker>

              {/* Route polylines and stop markers */}
              {(displayRoutes || []).map((route, ri) => {
                const color = TRUCK_COLORS[
                  (routeData?.routes || []).findIndex(r => r.truck_id === route.truck_id) % TRUCK_COLORS.length
                ]
                const positions = [DEPOT, ...route.stops.map(s => [s.latitude, s.longitude]), DEPOT]
                return (
                  <React.Fragment key={route.truck_id}>
                    <Polyline positions={positions} color={color} weight={3} opacity={0.75} />
                    {route.stops.map(stop => (
                      <CircleMarker
                        key={stop.node_id}
                        center={[stop.latitude, stop.longitude]}
                        radius={10}
                        fillColor={RISK_COLORS[stop.risk_level]}
                        color="#fff"
                        weight={2}
                        fillOpacity={0.9}
                      >
                        <Popup>
                          <strong>{stop.node_name}</strong><br />
                          Stop #{stop.stop_index} · {route.truck_id}<br />
                          Predicted: {stop.predicted_volume_kg} kg<br />
                          Risk: <strong style={{ color: RISK_COLORS[stop.risk_level] }}>{stop.risk_level.toUpperCase()}</strong>
                        </Popup>
                      </CircleMarker>
                    ))}
                  </React.Fragment>
                )
              })}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  topBar: {
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    padding: '14px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: '18px', fontWeight: 700, color: '#0f172a' },
  sub: { fontSize: '13px', color: '#64748b', marginTop: '2px' },
  select: {
    padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0',
    fontSize: '13px', background: '#f8fafc', cursor: 'pointer',
  },
  btn: {
    padding: '7px 16px', background: '#22c55e', color: '#fff',
    border: 'none', borderRadius: '8px', fontWeight: 600,
    fontSize: '13px', cursor: 'pointer',
  },
  sidebar: {
    width: '260px',
    background: '#f8fafc',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  savingsBox: {
    background: '#0f172a',
    padding: '14px',
    color: '#e2e8f0',
    fontSize: '13px',
  },
  savingsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0',
    borderBottom: '1px solid #1e293b',
  },
  truckCard: {
    padding: '12px 14px',
    borderBottom: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  mapOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(255,255,255,0.8)',
    zIndex: 999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    fontSize: '14px',
    color: '#64748b',
  },
  spinner: {
    width: '36px', height: '36px',
    border: '4px solid #e2e8f0',
    borderTopColor: '#22c55e',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
}
