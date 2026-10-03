import React, { useState } from 'react'
import { fetchDailyForecast } from '../services/api.js'
import { format, addDays } from 'date-fns'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

const RISK_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e' }

const WMO_LABELS = {
  0: '☀️ Clear', 1: '🌤️ Mostly Clear', 3: '☁️ Overcast',
  61: '🌧️ Light Rain', 63: '🌧️ Rain', 65: '🌧️ Heavy Rain',
  80: '🌦️ Showers', 95: '⛈️ Thunderstorm',
}

export default function ForecastPage() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [weatherCode, setWeatherCode] = useState(0)
  const [isFestival, setIsFestival] = useState(false)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const runForecast = () => {
    setLoading(true)
    setError(null)
    fetchDailyForecast({ date, weatherCode, isFestival })
      .then(setForecast)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  const areaData = forecast?.forecasts
    .sort((a, b) => b.fill_percentage - a.fill_percentage)
    .map(f => ({
      name: f.node_name.split(' ').slice(0, 2).join(' '),
      fill_pct: f.fill_percentage,
      volume: f.predicted_volume_kg,
    }))

  return (
    <div style={{ padding: '28px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
        Waste Volume Forecasting
      </h2>
      <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
        Predict fill levels across all MCD collection nodes using ML + contextual signals
      </p>

      {/* Controls */}
      <div style={styles.controlsCard}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={styles.label}>Forecast Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              max={format(addDays(new Date(), 14), 'yyyy-MM-dd')}
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.label}>Weather Condition</label>
            <select value={weatherCode} onChange={e => setWeatherCode(Number(e.target.value))} style={styles.input}>
              {Object.entries(WMO_LABELS).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={styles.label}>Festival / Event Day</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={isFestival}
                onChange={e => setIsFestival(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#22c55e' }}
              />
              <span style={{ fontSize: '13px', color: '#1e293b' }}>Enable festival multiplier (+40%)</span>
            </div>
          </div>
          <button onClick={runForecast} disabled={loading} style={styles.btn}>
            {loading ? 'Forecasting…' : '🔮 Run Forecast'}
          </button>
        </div>
      </div>

      {error && <div style={{ color: '#ef4444', padding: '12px', background: '#fef2f2', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

      {forecast && (
        <>
          {/* Summary chips */}
          <div style={styles.chipRow}>
            <Chip label="Total Volume" value={`${Math.round(forecast.total_predicted_volume_kg)} kg`} color="#0ea5e9" />
            <Chip label="High-Risk Nodes" value={forecast.high_risk_count} color="#ef4444" />
            <Chip label="Nodes Analysed" value={forecast.forecasts.length} color="#22c55e" />
            <Chip label="Model Confidence" value="~85%" color="#8b5cf6" />
          </div>

          {/* Area chart */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Fill Level (%) Across All Nodes</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={areaData} margin={{ top: 5, right: 10, bottom: 60, left: 0 }}>
                <defs>
                  <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                <Tooltip formatter={(v) => [`${v}%`, 'Fill %']} />
                <Area type="monotone" dataKey="fill_pct" stroke="#22c55e" fill="url(#fillGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Forecast cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {forecast.forecasts
              .sort((a, b) => b.fill_percentage - a.fill_percentage)
              .map(f => (
              <div key={f.node_id} style={{
                ...styles.nodeCard,
                borderTop: `4px solid ${RISK_COLORS[f.risk_level]}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>{f.node_name}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{f.node_id}</div>
                  </div>
                  <RiskBadge level={f.risk_level} />
                </div>
                {/* Progress bar */}
                <div style={{ background: '#e2e8f0', borderRadius: '4px', height: '8px', marginBottom: '8px' }}>
                  <div style={{
                    width: `${Math.min(f.fill_percentage, 100)}%`,
                    height: '100%',
                    background: RISK_COLORS[f.risk_level],
                    borderRadius: '4px',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                  <span>{f.predicted_volume_kg} kg predicted</span>
                  <span><strong>{f.fill_percentage}%</strong> full</span>
                </div>
                {/* Factors */}
                {Object.keys(f.factors).length > 0 && (
                  <div style={{ marginTop: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                    {Object.entries(f.factors).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>
                        <span>{k.replace(/_/g, ' ')}</span>
                        <span>{typeof v === 'number' ? (v > 0 ? `+${(v * 100).toFixed(1)}%` : `${(v * 100).toFixed(1)}%`) : v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {!forecast && !loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔮</div>
          <p>Select parameters above and click <strong>Run Forecast</strong></p>
        </div>
      )}
    </div>
  )
}

function Chip({ label, value, color }) {
  return (
    <div style={{
      background: '#fff', border: `2px solid ${color}20`, borderRadius: '10px',
      padding: '12px 18px', textAlign: 'center', flex: 1, minWidth: '120px',
    }}>
      <div style={{ color, fontSize: '22px', fontWeight: 700 }}>{value}</div>
      <div style={{ color: '#64748b', fontSize: '12px' }}>{label}</div>
    </div>
  )
}

function RiskBadge({ level }) {
  const c = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e' }[level]
  return (
    <span style={{ background: c + '20', color: c, borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>
      {level}
    </span>
  )
}

const styles = {
  controlsCard: { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '20px' },
  label: { display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', background: '#f8fafc' },
  btn: { padding: '9px 20px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' },
  chipRow: { display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' },
  card: { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '20px' },
  cardTitle: { fontSize: '15px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' },
  nodeCard: { background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
}
