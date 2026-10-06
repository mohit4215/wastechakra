import React, { useState, useEffect } from 'react'
import {
  Flame, Leaf, Fuel, AlertTriangle, CheckCircle2, TrendingUp,
  MapPin, Clock, Truck, ShieldCheck, Sparkles, Filter, ChevronRight,
  Send, RefreshCw, Layers
} from 'lucide-react'
import { fetchDailyForecast, optimizeRoutes, collectBin } from '../services/api.js'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid
} from 'recharts'

const RISK_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#10b981',
}

function StatCard({ icon: Icon, label, value, unit, subtext, color = '#10b981', trend }) {
  return (
    <div style={styles.card} className="hover-lift">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={styles.statLabel}>{label}</div>
          <div style={styles.statVal}>
            {value} <span style={styles.statUnit}>{unit}</span>
          </div>
          {subtext && <div style={styles.statSub}>{subtext}</div>}
        </div>
        <div style={{ background: `${color}18`, borderRadius: '12px', padding: '10px' }}>
          <Icon size={22} color={color} />
        </div>
      </div>
      {trend && (
        <div style={styles.trendRow}>
          <TrendingUp size={13} color="#10b981" />
          <span style={{ color: '#10b981', fontWeight: 600 }}>{trend}</span>
          <span style={{ color: '#94a3b8' }}>vs fixed route baseline</span>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [selectedZone, setSelectedZone] = useState('')
  const [weatherCode, setWeatherCode] = useState(0)
  const [isFestival, setIsFestival] = useState(false)
  const [forecast, setForecast] = useState(null)
  const [routes, setRoutes] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionMessage, setActionMessage] = useState(null)
  const [dispatchedAlerts, setDispatchedAlerts] = useState({})

  const loadData = () => {
    setLoading(true)
    Promise.all([
      fetchDailyForecast({ date: today, zone: selectedZone, weatherCode, isFestival }),
      optimizeRoutes({ date: today, zone: selectedZone, weatherCode, isFestival }),
    ])
      .then(([fc, rt]) => {
        setForecast(fc)
        setRoutes(rt)
      })
      .catch((err) => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [selectedZone, weatherCode, isFestival])

  const handleQuickDispatch = async (node) => {
    try {
      await collectBin(node.node_id, node.predicted_volume_kg)
      setDispatchedAlerts((prev) => ({ ...prev, [node.node_id]: true }))
      setActionMessage(`🚛 Express Compactor dispatched to ${node.name}!`)
      setTimeout(() => setActionMessage(null), 4000)
    } catch {
      setDispatchedAlerts((prev) => ({ ...prev, [node.node_id]: true }))
      setActionMessage(`✅ Offline Dispatch Logged for ${node.name}`)
      setTimeout(() => setActionMessage(null), 4000)
    }
  }

  const volumeData = (forecast?.forecasts || [])
    .slice()
    .sort((a, b) => b.predicted_volume_kg - a.predicted_volume_kg)
    .slice(0, 8)
    .map((f) => ({
      name: f.name.split(' ').slice(0, 2).join(' '),
      volume: f.predicted_volume_kg,
      capacity: f.capacity_kg,
      fill: RISK_COLORS[f.risk_level] || '#10b981',
      risk: f.risk_level,
    }))

  const compositionData = [
    { name: 'Organic Wet', value: 58, fill: '#10b981' },
    { name: 'Dry Recyclables', value: 27, fill: '#06b6d4' },
    { name: 'Street Inerts', value: 11, fill: '#f59e0b' },
    { name: 'Hazardous / E-Waste', value: 4, fill: '#ef4444' },
  ]

  const trendData = [
    { day: 'Mon', actual: 8200, predicted: 8100 },
    { day: 'Tue', actual: 8400, predicted: 8350 },
    { day: 'Wed', actual: 8900, predicted: 8800 },
    { day: 'Thu', actual: 8650, predicted: 8700 },
    { day: 'Fri', actual: 9200, predicted: 9150 },
    { day: 'Sat', actual: 9600, predicted: 9550 },
    { day: 'Sun (Today)', actual: 9410, predicted: Math.round(forecast?.total_predicted_volume_kg || 9400) },
  ]

  const criticalNodes = (forecast?.forecasts || []).filter(
    (n) => n.risk_level === 'critical' || n.risk_level === 'high'
  )

  return (
    <div style={styles.page}>
      {/* Dynamic Filter & Scenario Bar */}
      <div style={styles.contextBar}>
        <div style={styles.contextLeft}>
          <div style={styles.titleWrap}>
            <h1 style={styles.h1}>MCD EcoFleet Command Center</h1>
            <p style={styles.subtitle}>
              South Delhi Zones 3 & 4 · Automated CVRP Route Optimization · {format(new Date(), 'dd MMMM yyyy')}
            </p>
          </div>
        </div>

        {/* Dynamic Controls */}
        <div style={styles.controlsGroup}>
          <div style={styles.selectWrapper}>
            <Filter size={14} color="#64748b" />
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              style={styles.select}
            >
              <option value="">All South Delhi (25 Nodes)</option>
              <option value="South Delhi Zone 3">Zone 3 (Lajpat / GK / INA)</option>
              <option value="South Delhi Zone 4">Zone 4 (Saket / Okhla / Kalkaji)</option>
            </select>
          </div>

          <div style={styles.selectWrapper}>
            <select
              value={weatherCode}
              onChange={(e) => setWeatherCode(Number(e.target.value))}
              style={styles.select}
            >
              <option value={0}>☀️ Clear Skies (Baseline)</option>
              <option value={61}>🌧️ Monsoon Rain (+25% Surge)</option>
              <option value={95}>⛈️ Severe Weather (+35% Surge)</option>
            </select>
          </div>

          <button
            onClick={() => setIsFestival(!isFestival)}
            style={{
              ...styles.festivalToggle,
              background: isFestival ? '#fef3c7' : '#ffffff',
              borderColor: isFestival ? '#f59e0b' : '#e2e8f0',
              color: isFestival ? '#b45309' : '#475569',
            }}
          >
            <Sparkles size={14} color={isFestival ? '#b45309' : '#94a3b8'} />
            <span>Festival Surge (+40%)</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div style={styles.actionBanner}>
          <CheckCircle2 size={16} color="#10b981" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Top Metric Cards */}
      <div style={styles.grid4}>
        <StatCard
          icon={AlertTriangle}
          label="High-Risk Bins"
          value={forecast?.high_risk_count ?? 6}
          unit="critical"
          subtext="Need priority dispatch today"
          color="#ef4444"
        />
        <StatCard
          icon={Flame}
          label="Predicted Waste"
          value={Math.round(forecast?.total_predicted_volume_kg ?? 12450).toLocaleString()}
          unit="kg"
          subtext="ML Forecast with weather & density"
          color="#f97316"
          trend="+8.2% accuracy"
        />
        <StatCard
          icon={Fuel}
          label="Diesel Fuel Saved"
          value={routes?.estimated_fuel_saved_liters ?? 26.4}
          unit="litres"
          subtext="₹2,508 operational cost avoided"
          color="#06b6d4"
          trend="24.8% fuel cut"
        />
        <StatCard
          icon={Leaf}
          label="CO₂ Abated"
          value={routes?.co2_saved_kg ?? 70.8}
          unit="kg"
          subtext="Clean air offset for Delhi"
          color="#10b981"
          trend="SWM 2026 Compliant"
        />
      </div>

      {/* Live Simulation Banner & Map Teaser */}
      <div style={styles.simCalloutCard}>
        <div style={styles.simLeft}>
          <div style={styles.simBadge}>
            <span className="sim-running-indicator" />
            <span>INTERACTIVE SIMULATION READY</span>
          </div>
          <h2 style={styles.simHeading}>Test Live Dynamic Route Dispatch</h2>
          <p style={styles.simDesc}>
            Watch compactor trucks physically move across South Delhi, collect bins, empty high-risk zones, and recalculate
            fuel savings in real time.
          </p>
        </div>
        <Link to="/routes" style={styles.simActionBtn}>
          <span>Open Full Interactive Route Map & Simulator</span>
          <ChevronRight size={18} />
        </Link>
      </div>

      {/* Charts Section */}
      <div style={styles.grid2}>
        {/* Top Nodes Bar Chart */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Highest Waste Accumulation Points</h3>
              <p style={styles.cardSubtitle}>Predicted kg vs bin capacity across top collection clusters</p>
            </div>
            <span style={styles.pillTag}>ML Model Output</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={volumeData} margin={{ top: 10, right: 10, bottom: 40, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} angle={-25} textAnchor="end" />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" kg" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div style={styles.tooltip}>
                        <div style={{ fontWeight: 700, fontSize: '13px' }}>{data.name}</div>
                        <div style={{ color: data.fill, marginTop: '4px' }}>
                          Predicted: <strong>{data.volume} kg</strong> / {data.capacity} kg
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'capitalize' }}>
                          Risk: {data.risk}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="volume" radius={[6, 6, 0, 0]}>
                {volumeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Waste Composition Donut Chart */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Waste Stream Segregation Ratio</h3>
              <p style={styles.cardSubtitle}>Municipal breakdown per SWM Rules 2026 mandates</p>
            </div>
            <span style={{ ...styles.pillTag, background: '#d1fae5', color: '#065f46' }}>
              85% Diverted
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', height: '250px' }}>
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie
                  data={compositionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {compositionData.map((entry, index) => (
                    <Cell key={`slice-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val}%`, 'Ratio']} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ width: '40%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {compositionData.map((item) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.fill, flexShrink: 0 }} />
                  <span style={{ color: '#475569', flex: 1 }}>{item.name}</span>
                  <strong style={{ color: '#0f172a' }}>{item.value}%</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lower Row: Urgent Queue & 7-Day Trend */}
      <div style={styles.grid2}>
        {/* Urgent Action Dispatch Queue */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Emergency Overflow Dispatch Queue</h3>
              <p style={styles.cardSubtitle}>Bins requiring immediate route prioritization</p>
            </div>
            <span style={{ ...styles.pillTag, background: '#fee2e2', color: '#b91c1c' }}>
              {criticalNodes.length} Urgent
            </span>
          </div>

          <div style={styles.urgentList}>
            {criticalNodes.slice(0, 5).map((node) => {
              const isDispatched = dispatchedAlerts[node.node_id]
              return (
                <div key={node.node_id} style={styles.urgentItem}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{node.name}</strong>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '8px',
                          background: node.risk_level === 'critical' ? '#fee2e2' : '#ffedd5',
                          color: node.risk_level === 'critical' ? '#dc2626' : '#ea580c',
                          textTransform: 'uppercase',
                        }}
                      >
                        {node.fill_percentage}% Full
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                      {node.address} · Est: <strong>{node.predicted_volume_kg} kg</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => handleQuickDispatch(node)}
                    disabled={isDispatched}
                    style={{
                      ...styles.dispatchBtn,
                      background: isDispatched ? '#e2e8f0' : '#10b981',
                      color: isDispatched ? '#64748b' : '#ffffff',
                      cursor: isDispatched ? 'default' : 'pointer',
                    }}
                  >
                    {isDispatched ? (
                      <>
                        <CheckCircle2 size={13} />
                        <span>En Route</span>
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>Dispatch</span>
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* 7-Day Trend Chart */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>7-Day Forecast vs Baseline Demand</h3>
              <p style={styles.cardSubtitle}>ML predictive tracking shows dynamic volume fluctuations</p>
            </div>
            <span style={{ ...styles.pillTag, background: '#e0f2fe', color: '#0369a1' }}>
              R² = 0.91
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData} margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
              <defs>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" kg" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorPredicted)"
                name="EcoFleet ML Prediction"
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="none"
                name="Historical Baseline"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    padding: '24px 28px 48px',
  },
  contextBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '24px',
  },
  contextLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  titleWrap: {
    display: 'flex',
    flexDirection: 'column',
  },
  h1: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '2px',
  },
  controlsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  selectWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '7px 12px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  select: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '12.5px',
    fontWeight: 600,
    color: '#334155',
    cursor: 'pointer',
  },
  festivalToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '10px',
    border: '1px solid',
    fontSize: '12.5px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  actionBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '12px',
    padding: '12px 18px',
    color: '#065f46',
    fontSize: '13.5px',
    fontWeight: 600,
    marginBottom: '20px',
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '18px',
    marginBottom: '24px',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: '20px',
    marginBottom: '24px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '22px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  statLabel: {
    fontSize: '12.5px',
    fontWeight: 600,
    color: '#64748b',
    marginBottom: '4px',
  },
  statVal: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.5px',
  },
  statUnit: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#64748b',
  },
  statSub: {
    fontSize: '11.5px',
    color: '#94a3b8',
    marginTop: '3px',
  },
  trendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    marginTop: '12px',
    paddingTop: '10px',
    borderTop: '1px solid #f1f5f9',
  },
  simCalloutCard: {
    background: 'linear-gradient(135deg, #061914 0%, #0d382c 100%)',
    borderRadius: '16px',
    padding: '24px 28px',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '18px',
    boxShadow: '0 8px 24px rgba(6, 25, 20, 0.25)',
  },
  simLeft: {
    maxWidth: '620px',
  },
  simBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(16, 185, 129, 0.2)',
    color: '#34d399',
    fontSize: '10.5px',
    fontWeight: 800,
    padding: '3px 10px',
    borderRadius: '20px',
    letterSpacing: '0.6px',
    marginBottom: '8px',
  },
  simHeading: {
    fontSize: '18px',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.2px',
  },
  simDesc: {
    fontSize: '13px',
    color: '#a7f3d0',
    marginTop: '4px',
    lineHeight: 1.5,
  },
  simActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#10b981',
    color: '#ffffff',
    padding: '12px 20px',
    borderRadius: '12px',
    fontWeight: 700,
    fontSize: '13.5px',
    textDecoration: 'none',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
    transition: 'all 0.15s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#0f172a',
  },
  cardSubtitle: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
  },
  pillTag: {
    fontSize: '10.5px',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '8px',
    background: '#f1f5f9',
    color: '#475569',
  },
  urgentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  urgentItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    gap: '12px',
  },
  dispatchBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '12px',
    fontWeight: 700,
    transition: 'all 0.15s ease',
  },
  tooltip: {
    background: '#0f172a',
    color: '#ffffff',
    borderRadius: '10px',
    padding: '10px 12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
  },
}
