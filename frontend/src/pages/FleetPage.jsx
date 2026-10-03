import React, { useState, useEffect } from 'react'
import { fetchFleet } from '../services/api.js'
import { Truck, CheckCircle, XCircle } from 'lucide-react'

export default function FleetPage() {
  const [fleet, setFleet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchFleet()
      .then(setFleet)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '40px', color: '#64748b' }}>Loading fleet data…</div>
  if (error)   return <div style={{ padding: '40px', color: '#ef4444' }}>Error: {error}</div>

  return (
    <div style={{ padding: '28px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Fleet Management</h2>
      <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>MCD registered garbage truck fleet status</p>

      {/* Summary */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <StatBox icon={Truck}        label="Total Trucks"  value={fleet.total_trucks}  color="#3b82f6" />
        <StatBox icon={CheckCircle}  label="Active Trucks" value={fleet.active_trucks}  color="#22c55e" />
        <StatBox icon={XCircle}      label="In Maintenance" value={fleet.total_trucks - fleet.active_trucks} color="#ef4444" />
      </div>

      {/* Truck cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {fleet.trucks.map(truck => (
          <div key={truck.truck_id} style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            borderLeft: `4px solid ${truck.is_active ? '#22c55e' : '#e2e8f0'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{truck.truck_id}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                  {truck.registration_number}
                </div>
              </div>
              <span style={{
                background: truck.is_active ? '#f0fdf4' : '#fef2f2',
                color: truck.is_active ? '#15803d' : '#dc2626',
                borderRadius: '20px',
                padding: '3px 12px',
                fontSize: '12px',
                fontWeight: 600,
              }}>
                {truck.is_active ? 'Active' : 'Maintenance'}
              </span>
            </div>

            <div style={styles.row}>
              <span style={styles.label}>Driver</span>
              <span style={styles.value}>{truck.driver_name}</span>
            </div>
            <div style={styles.row}>
              <span style={styles.label}>Phone</span>
              <span style={styles.value}>{truck.driver_phone}</span>
            </div>
            <div style={styles.row}>
              <span style={styles.label}>Zone</span>
              <span style={styles.value}>{truck.zone}</span>
            </div>
            <div style={styles.row}>
              <span style={styles.label}>Capacity</span>
              <span style={styles.value}>{truck.capacity_kg.toLocaleString()} kg</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatBox({ icon: Icon, label, value, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '12px', padding: '18px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex',
      alignItems: 'center', gap: '14px', minWidth: '180px',
    }}>
      <div style={{ background: color + '20', borderRadius: '10px', padding: '10px' }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '26px', fontWeight: 700, color: '#0f172a' }}>{value}</div>
        <div style={{ fontSize: '12px', color: '#64748b' }}>{label}</div>
      </div>
    </div>
  )
}

const styles = {
  row: { display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f8fafc' },
  label: { fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' },
  value: { fontSize: '13px', color: '#334155', fontWeight: 500 },
}
