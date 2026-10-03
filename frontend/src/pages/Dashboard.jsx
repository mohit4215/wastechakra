import React, { useState, useEffect } from 'react'
import { Flame, Leaf, Fuel, AlertTriangle, CheckCircle } from 'lucide-react'
import { fetchDailyForecast, optimizeRoutes } from '../services/api.js'
import { format } from 'date-fns'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const RISK_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e' }

function StatCard({ icon: Icon, label, value, unit, color = '#22c55e' }) {
  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: '#64748b', fontSize: '13px', marginBottom: '6px' }}>{label}</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>
            {value} <span style={{ fontSize: '14px', color: '#64748b' }}>{unit}</span>
          </div>
        </div>
        <div style={{ background: color + '20', borderRadius: '10px', padding: '10px' }}>
          <Icon size={22} color={color} />
        </div>
      </div>
    </div>
  )
}

function RiskBadge({ level }) {
  const colors = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e' }
  return (
    <span style={{
      background: colors[level] + '20',
      color: colors[level],
      borderRadius: '6px',
      padding: '2px 10px',
      fontSize: '12px',
      fontWeight: 600,
      textTransform: 'capitalize',
    }}>
      {level}
    </span>
  )
}

export default function Dashboard() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [forecast, setForecast] = useState(null)
  const [routes, setRoutes] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetchDailyForecast({ date: today }),
      optimizeRoutes({ date: today }),
    ])
      .then(([fc, rt]) => { setForecast(fc); setRoutes(rt) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [today])

  if (loading) return <LoadingState />
  if (error)   return <ErrorState message={error} />

  const riskDist = ['critical', 'high', 'medium', 'low'].map(r => ({
    name: r,
    value: forecast.forecasts.filter(f => f.risk_level === r).length,
  })).filter(r => r.value > 0)

  const volumeData = forecast.forecasts
    .sort((a, b) => b.predicted_volume_kg - a.predicted_volume_kg)
    .slice(0, 8)
    .map(f => ({
      name: f.node_name.split(' ').slice(0, 2).join(' '),
      volume: f.predicted_volume_kg,
      fill: RISK_COLORS[f.risk_level],
    }))

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>EcoFleet AI Dashboard</h1>
          <p style={styles.subtitle}>MCD South Delhi — {format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
        </div>
        <div style={styles.badge}>
          <CheckCircle size={16} color="#22c55e" />
          <span>System Operational</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={styles.grid4}>
        <StatCard icon={AlertTriangle} label="High-Risk Nodes" value={forecast.high_risk_count}
          unit="nodes" color="#ef4444" />
        <StatCard icon={Flame} label="Total Predicted Waste" value={Math.round(forecast.total_predicted_volume_kg)}
          unit="kg" color="#f97316" />
        <StatCard icon={Fuel} label="Fuel Saved vs Baseline" value={routes?.estimated_fuel_saved_liters}
          unit="litres" color="#0ea5e9" />
        <StatCard icon={Leaf} label="CO₂ Reduction" value={routes?.co2_saved_kg}
          unit="kg" color="#22c55e" />
      </div>

      {/* Charts */}
      <div style={styles.grid2}>
        {/* Predicted volume bar chart */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Predicted Waste Volume (Top 8 Nodes)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={volumeData} margin={{ top: 5, right: 10, bottom: 60, left: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} unit=" kg" />
              <Tooltip formatter={(v) => [`${v} kg`, 'Volume']} />
              <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                {volumeData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk distribution pie */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Risk Level Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={riskDist} dataKey="value" nameKey="name" cx="50%" cy="50%"
                outerRadius={80} label={({ name, value }) => `${name}: ${value}`} labelLine>
                {riskDist.map((entry, i) => (
                  <Cell key={i} fill={RISK_COLORS[entry.name]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Node table */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Today's Node Forecast ({forecast.forecasts.length} nodes)</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Node</th>
                <th style={styles.th}>Zone</th>
                <th style={styles.th}>Predicted Volume</th>
                <th style={styles.th}>Fill %</th>
                <th style={styles.th}>Risk</th>
                <th style={styles.th}>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {forecast.forecasts
                .sort((a, b) => b.fill_percentage - a.fill_percentage)
                .map(f => (
                <tr key={f.node_id} style={styles.tr}>
                  <td style={styles.td}><strong>{f.node_name}</strong></td>
                  <td style={{ ...styles.td, color: '#64748b', fontSize: '12px' }}>
                    {f.node_id}
                  </td>
                  <td style={styles.td}>{f.predicted_volume_kg} kg / {f.capacity_kg} kg</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '80px', height: '8px', background: '#e2e8f0', borderRadius: '4px',
                      }}>
                        <div style={{
                          width: `${Math.min(f.fill_percentage, 100)}%`,
                          height: '100%',
                          background: RISK_COLORS[f.risk_level],
                          borderRadius: '4px',
                          transition: 'width 0.3s',
                        }} />
                      </div>
                      <span>{f.fill_percentage}%</span>
                    </div>
                  </td>
                  <td style={styles.td}><RiskBadge level={f.risk_level} /></td>
                  <td style={styles.td}>{Math.round(f.confidence * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Route summary */}
      {routes && routes.routes.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Today's Route Summary</h3>
          <div style={styles.grid4}>
            {routes.routes.map(r => (
              <div key={r.truck_id} style={styles.routeCard}>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{r.truck_id}</div>
                <div style={{ color: '#64748b', fontSize: '12px' }}>{r.stops.length} stops</div>
                <div style={{ color: '#22c55e', fontSize: '13px', marginTop: '4px' }}>
                  {r.total_distance_km} km · {r.estimated_duration_hours}h
                </div>
                <div style={{ color: '#f97316', fontSize: '12px' }}>{r.total_waste_kg} kg load</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#22c55e', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#64748b' }}>Loading EcoFleet AI data…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div style={{ padding: '40px', color: '#ef4444' }}>
      <strong>API Error:</strong> {message}
      <p style={{ color: '#64748b', marginTop: '8px' }}>Make sure the backend is running on port 8000.</p>
    </div>
  )
}

const styles = {
  page: { padding: '28px', maxWidth: '1400px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  h1: { fontSize: '24px', fontWeight: 700, color: '#0f172a' },
  subtitle: { color: '#64748b', fontSize: '14px', marginTop: '2px' },
  badge: { display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: '#15803d', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '16px', marginBottom: '20px' },
  card: { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '20px' },
  cardTitle: { fontSize: '15px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  thead: { borderBottom: '2px solid #e2e8f0' },
  th: { padding: '10px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tr: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s' },
  td: { padding: '10px 12px', color: '#1e293b' },
  routeCard: { background: '#f8fafc', borderRadius: '8px', padding: '14px', border: '1px solid #e2e8f0' },
}
