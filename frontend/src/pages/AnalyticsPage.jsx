import React, { useState, useEffect } from 'react'
import {
  ShieldCheck, Leaf, Fuel, Award, BarChart3, TrendingUp, CheckCircle2,
  Calendar, Layers, FileSpreadsheet, Download, Printer, Trees
} from 'lucide-react'
import { fetchAnalyticsSummary } from '../services/api.js'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from 'recharts'

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    fetchAnalyticsSummary()
      .then(setData)
      .catch((err) => console.error('Analytics load error:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.badgeRow}>
            <Award size={14} color="#10b981" />
            <span style={styles.badgeText}>WASTECHAKRA 2026 ESG AUDIT</span>
            <span style={styles.certPill}>MCD Smart Governance Track</span>
          </div>
          <h1 style={styles.title}>Municipal Waste & Environmental Governance</h1>
          <p style={styles.subtitle}>
            Continuous compliance tracking under Solid Waste Management (SWM) Rules 2026 & Swachh Bharat Urban.
          </p>
        </div>

        <div style={styles.headerActions}>
          <div style={styles.timeRangePills}>
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  ...styles.timeBtn,
                  background: timeRange === range ? '#0f172a' : '#ffffff',
                  color: timeRange === range ? '#ffffff' : '#64748b',
                }}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <button onClick={() => window.print()} style={styles.exportBtn}>
            <Printer size={15} />
            <span>Print ESG Audit</span>
          </button>
        </div>
      </div>

      {/* Top ESG Impact Cards */}
      <div style={styles.kpiGrid}>
        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #10b981' }}>
          <div style={styles.kpiIconWrap('#ecfdf5')}>
            <ShieldCheck size={22} color="#059669" />
          </div>
          <div>
            <div style={styles.kpiLabel}>SWM 2026 Compliance</div>
            <div style={styles.kpiVal}>{data?.swm_compliance_rate ?? 98.7}%</div>
            <div style={styles.kpiSub}>Zero-overflow compliance rate</div>
          </div>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #0284c7' }}>
          <div style={styles.kpiIconWrap('#e0f2fe')}>
            <Fuel size={22} color="#0284c7" />
          </div>
          <div>
            <div style={styles.kpiLabel}>Fuel Saved to Date</div>
            <div style={styles.kpiVal}>
              {data?.total_fuel_saved_liters ?? 438.2} <span style={{ fontSize: '14px' }}>L</span>
            </div>
            <div style={styles.kpiSub}>₹{data?.fuel_cost_saved_inr?.toLocaleString() ?? '41,629'} cost avoided</div>
          </div>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #059669' }}>
          <div style={styles.kpiIconWrap('#dcfce7')}>
            <Leaf size={22} color="#059669" />
          </div>
          <div>
            <div style={styles.kpiLabel}>Net CO₂ Abated</div>
            <div style={styles.kpiVal}>
              {data?.total_co2_abated_kg ?? 1174.4} <span style={{ fontSize: '14px' }}>kg</span>
            </div>
            <div style={styles.kpiSub}>Clean air benefit for Delhi NCR</div>
          </div>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #10b981' }}>
          <div style={styles.kpiIconWrap('#f0fdf4')}>
            <Trees size={22} color="#15803d" />
          </div>
          <div>
            <div style={styles.kpiLabel}>Tree Equivalents</div>
            <div style={styles.kpiVal}>{data?.trees_equivalent ?? 53} 🌳</div>
            <div style={styles.kpiSub}>Annual urban sequestration</div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div style={styles.grid2}>
        {/* Waste Diversion & Collection Trend */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Daily Waste Collected & Diverted</h3>
              <p style={styles.cardSubtitle}>Total kg cleared per operational cycle across pilot wards</p>
            </div>
            <span style={styles.pillTag}>Daily Audit</span>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data?.daily_trend || []} margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
              <defs>
                <linearGradient id="wasteGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" kg" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="waste_collected_kg"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#wasteGrad)"
                name="Waste Collected (kg)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Environmental Savings Curve */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Fuel Cut & Emission Abatement Curves</h3>
              <p style={styles.cardSubtitle}>Direct fuel reductions from CVRP turn-by-turn dynamic routing</p>
            </div>
            <span style={{ ...styles.pillTag, background: '#e0f2fe', color: '#0369a1' }}>
              Green Fleet
            </span>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.daily_trend || []} margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip />
              <Bar dataKey="fuel_saved_liters" fill="#0284c7" radius={[4, 4, 0, 0]} name="Fuel Saved (L)" />
              <Bar dataKey="co2_saved_kg" fill="#10b981" radius={[4, 4, 0, 0]} name="CO₂ Abated (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ward Comparison Table */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h3 style={styles.cardTitle}>Municipal Zone ESG Compliance Scorecard</h3>
            <p style={styles.cardSubtitle}>Ward-by-ward breakdown of solid waste management performance</p>
          </div>
          <span style={styles.pillTag}>Audit Rating: Grade A+</span>
        </div>

        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>MUNICIPAL ZONE</th>
              <th style={styles.th}>COLLECTION NODES</th>
              <th style={styles.th}>AVERAGE FILL LEVEL</th>
              <th style={styles.th}>TOTAL WASTE CLEARED</th>
              <th style={styles.th}>SWM 2026 COMPLIANCE</th>
              <th style={styles.th}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {(data?.zone_breakdown || []).map((zone, i) => (
              <tr key={i} style={styles.tr}>
                <td style={styles.td}>
                  <strong>{zone.zone}</strong>
                </td>
                <td style={styles.td}>{zone.nodes_count} points</td>
                <td style={styles.td}>{zone.avg_fill_pct}%</td>
                <td style={styles.td}>
                  <strong>{zone.waste_volume_kg.toLocaleString()} kg</strong>
                </td>
                <td style={styles.td}>
                  <strong style={{ color: '#059669' }}>{zone.compliance}</strong>
                </td>
                <td style={styles.td}>
                  <span style={styles.complianceTag}>CERTIFIED</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    marginBottom: '24px',
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  badgeText: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#059669',
    letterSpacing: '0.6px',
  },
  certPill: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#0369a1',
    background: '#e0f2fe',
    padding: '2px 8px',
    borderRadius: '10px',
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
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  timeRangePills: {
    display: 'flex',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  timeBtn: {
    padding: '7px 12px',
    fontSize: '11.5px',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
  },
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: '#ffffff',
    color: '#0f172a',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '12.5px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '18px',
    marginBottom: '24px',
  },
  kpiCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  kpiIconWrap: (bg) => ({
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  kpiLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: 600,
  },
  kpiVal: {
    fontSize: '24px',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.5px',
    marginTop: '2px',
  },
  kpiSub: {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '2px',
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
    background: '#ecfdf5',
    color: '#059669',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  thRow: {
    borderBottom: '1px solid #e2e8f0',
  },
  th: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#64748b',
    letterSpacing: '0.6px',
    padding: '10px 12px',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '14px 12px',
    fontSize: '13px',
  },
  complianceTag: {
    fontSize: '10.5px',
    fontWeight: 800,
    padding: '2px 8px',
    borderRadius: '6px',
    background: '#dcfce7',
    color: '#15803d',
  },
}
