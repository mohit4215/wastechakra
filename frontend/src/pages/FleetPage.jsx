import React, { useState, useEffect } from 'react'
import { fetchFleet, updateTruck, createTruck, deleteTruck, resetMCDFactoryData } from '../services/api.js'
import {
  Truck, CheckCircle, XCircle, BatteryCharging, Fuel, Plus,
  Phone, User, ShieldCheck, MapPin, Search, AlertCircle, Wrench,
  Trash2, RotateCcw, TrendingDown, IndianRupee, Zap, Sliders
} from 'lucide-react'

export default function FleetPage() {
  const [fleet, setFleet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [fuelPrice, setFuelPrice] = useState(89.6)
  const [newTruckForm, setNewTruckForm] = useState({
    registration_number: 'DL-1C-0007',
    driver_name: '',
    driver_phone: '+91-9811001007',
    capacity_kg: 5000,
    zone: 'South Delhi (MCD)',
    fuel_type: 'EV',
  })

  const loadFleet = () => {
    fetchFleet()
      .then(setFleet)
      .catch((err) => console.error('Fleet load error:', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadFleet()
  }, [])

  const handleToggleMaintenance = async (truck) => {
    const updated = await updateTruck(truck.truck_id, {
      is_active: !truck.is_active,
      status: !truck.is_active ? 'Ready at Depot' : 'Maintenance',
    })
    setFleet((prev) => ({
      ...prev,
      trucks: prev.trucks.map((t) => (t.truck_id === truck.truck_id ? { ...t, ...updated } : t)),
      active_trucks: prev.trucks.map((t) =>
        t.truck_id === truck.truck_id ? { ...t, is_active: !truck.is_active } : t
      ).filter((t) => t.is_active).length,
    }))
  }

  const handleDeleteTruck = async (truckId) => {
    if (window.confirm(`Are you sure you want to decommission ${truckId} from active municipal service?`)) {
      await deleteTruck(truckId)
      loadFleet()
    }
  }

  const handleResetDefaults = () => {
    if (window.confirm('Reset all vehicle fleet records to MCD factory defaults?')) {
      resetMCDFactoryData()
      loadFleet()
    }
  }

  const handleCreateTruck = async (e) => {
    e.preventDefault()
    if (!newTruckForm.driver_name) return
    const created = await createTruck(newTruckForm)
    setFleet((prev) => ({
      ...prev,
      total_trucks: prev.total_trucks + 1,
      active_trucks: prev.active_trucks + 1,
      trucks: [...prev.trucks, created],
    }))
    setShowAddModal(false)
    setNewTruckForm({
      registration_number: `DL-1C-000${(fleet?.trucks.length || 6) + 2}`,
      driver_name: '',
      driver_phone: '+91-9811001008',
      capacity_kg: 5000,
      zone: 'South Delhi (MCD)',
      fuel_type: 'EV',
    })
  }

  const filteredTrucks = (fleet?.trucks || []).filter((truck) => {
    const matchesSearch =
      truck.truck_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && truck.is_active) ||
      (filterStatus === 'maintenance' && !truck.is_active)
    return matchesSearch && matchesStatus
  })

  const totalCapacity = (fleet?.trucks || []).reduce((acc, t) => acc + (t.capacity_kg || 5000), 0)
  const evCount = (fleet?.trucks || []).filter((t) => t.fuel_type?.includes('EV') || t.fuel_type?.includes('Electric')).length
  const activeTrucksCount = fleet?.active_trucks ?? 5
  const dailyLitersSaved = Math.round(22.4 * (activeTrucksCount / 5) * 10) / 10
  const dailyRupeesSaved = Math.round(dailyLitersSaved * fuelPrice)
  const monthlySavingsInLakhs = Math.round(((dailyRupeesSaved * 26) / 100000) * 100) / 100
  const monthlyCo2AbatedTonnes = Math.round(((dailyLitersSaved * 2.68 * 26) / 1000) * 10) / 10

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.badgeRow}>
            <Truck size={14} color="#10b981" />
            <span style={styles.badgeText}>MCD MUNICIPAL FLEET TELEMETRY</span>
          </div>
          <h1 style={styles.title}>Fleet Operations & Vehicle Registry</h1>
          <p style={styles.subtitle}>
            Monitor compactor trucks, battery/fuel status, active driver assignments, and maintenance scheduling.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={handleResetDefaults} style={styles.resetBtn} title="Reset fleet to initial MCD state">
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>
          <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>
            <Plus size={16} />
            <span>Register Vehicle</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconWrap, background: '#e0f2fe' }}>
            <Truck size={22} color="#0284c7" />
          </div>
          <div>
            <div style={styles.kpiVal}>{fleet?.total_trucks ?? 6}</div>
            <div style={styles.kpiLabel}>Total Registered Fleet</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconWrap, background: '#dcfce7' }}>
            <CheckCircle size={22} color="#16a34a" />
          </div>
          <div>
            <div style={styles.kpiVal}>{fleet?.active_trucks ?? 5}</div>
            <div style={styles.kpiLabel}>Active on Route</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconWrap, background: '#fee2e2' }}>
            <Wrench size={22} color="#dc2626" />
          </div>
          <div>
            <div style={styles.kpiVal}>{(fleet?.total_trucks || 6) - (fleet?.active_trucks || 5)}</div>
            <div style={styles.kpiLabel}>In Depot / Maintenance</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconWrap, background: '#ecfdf5' }}>
            <BatteryCharging size={22} color="#059669" />
          </div>
          <div>
            <div style={styles.kpiVal}>{evCount} EVs</div>
            <div style={styles.kpiLabel}>Zero-Emission Fleet</div>
          </div>
        </div>
      </div>

      {/* Municipal OPEX & Fuel Savings Simulator */}
      <div style={styles.simulatorCard}>
        <div style={styles.simHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="#10b981" />
            <strong style={{ fontSize: '14px', color: '#0f172a' }}>
              Municipal OPEX & Fuel Cost Savings Simulator
            </strong>
          </div>
          <span style={styles.simBadge}>Dynamic CVRP Optimization Yield</span>
        </div>

        <div style={styles.simBody}>
          <div style={styles.simControl}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Delhi Diesel Baseline (₹/Liter):</span>
              <strong style={{ fontSize: '13px', color: '#0f172a' }}>₹{fuelPrice.toFixed(1)}/L</strong>
            </div>
            <input
              type="range"
              min="80"
              max="110"
              step="0.5"
              value={fuelPrice}
              onChange={(e) => setFuelPrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
            />
          </div>

          <div style={styles.simMetrics}>
            <div style={styles.simStat}>
              <div style={styles.simStatVal}>₹{dailyRupeesSaved.toLocaleString('en-IN')}</div>
              <div style={styles.simStatLabel}>Daily Fuel Saved</div>
            </div>
            <div style={styles.simStat}>
              <div style={{ ...styles.simStatVal, color: '#059669' }}>₹{monthlySavingsInLakhs} Lakhs</div>
              <div style={styles.simStatLabel}>Est. Monthly Budget Saved</div>
            </div>
            <div style={styles.simStat}>
              <div style={{ ...styles.simStatVal, color: '#0284c7' }}>{monthlyCo2AbatedTonnes} MT</div>
              <div style={styles.simStatLabel}>Monthly CO₂ Abated</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={15} color="#64748b" />
          <input
            type="text"
            placeholder="Search driver, vehicle ID, or registration..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterGroup}>
          <button
            onClick={() => setFilterStatus('all')}
            style={{
              ...styles.filterBtn,
              background: filterStatus === 'all' ? '#0f172a' : '#ffffff',
              color: filterStatus === 'all' ? '#ffffff' : '#475569',
            }}
          >
            All Trucks
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            style={{
              ...styles.filterBtn,
              background: filterStatus === 'active' ? '#10b981' : '#ffffff',
              color: filterStatus === 'active' ? '#ffffff' : '#475569',
            }}
          >
            Active Only
          </button>
          <button
            onClick={() => setFilterStatus('maintenance')}
            style={{
              ...styles.filterBtn,
              background: filterStatus === 'maintenance' ? '#ef4444' : '#ffffff',
              color: filterStatus === 'maintenance' ? '#ffffff' : '#475569',
            }}
          >
            In Maintenance
          </button>
        </div>
      </div>

      {/* Trucks Grid */}
      <div style={styles.truckGrid}>
        {filteredTrucks.map((truck) => (
          <div key={truck.truck_id} style={styles.truckCard} className="hover-lift">
            <div style={styles.cardHeader}>
              <div>
                <div style={styles.truckIdRow}>
                  <strong style={styles.truckId}>{truck.truck_id}</strong>
                  <span
                    style={{
                      ...styles.fuelPill,
                      background: truck.fuel_type?.includes('EV') ? '#dcfce7' : '#e0f2fe',
                      color: truck.fuel_type?.includes('EV') ? '#15803d' : '#0369a1',
                    }}
                  >
                    {truck.fuel_type || 'CNG Compactor'}
                  </span>
                </div>
                <div style={styles.regNo}>{truck.registration_number}</div>
              </div>

              <span
                style={{
                  ...styles.statusBadge,
                  background: truck.is_active ? '#ecfdf5' : '#fee2e2',
                  color: truck.is_active ? '#065f46' : '#b91c1c',
                }}
              >
                {truck.is_active ? 'Active' : 'Maintenance'}
              </span>
            </div>

            {/* Fuel & Capacity Indicators */}
            <div style={styles.metricsBox}>
              <div style={styles.metricRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {truck.fuel_type?.includes('EV') ? (
                    <BatteryCharging size={14} color="#10b981" />
                  ) : (
                    <Fuel size={14} color="#0284c7" />
                  )}
                  <span style={styles.subtext}>Energy / Battery Level</span>
                </div>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>
                  {truck.battery_pct || 85}%
                </strong>
              </div>

              {/* Visual gauge bar */}
              <div style={styles.batteryTrack}>
                <div
                  style={{
                    ...styles.batteryFill,
                    width: `${truck.battery_pct || 85}%`,
                    background:
                      (truck.battery_pct || 85) > 50
                        ? '#10b981'
                        : (truck.battery_pct || 85) > 20
                        ? '#f59e0b'
                        : '#ef4444',
                  }}
                />
              </div>

              <div style={styles.metricRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#64748b" />
                  <span style={styles.subtext}>Assigned Zone</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                  {truck.zone}
                </span>
              </div>

              <div style={styles.metricRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={14} color="#64748b" />
                  <span style={styles.subtext}>Payload Capacity</span>
                </div>
                <strong style={{ fontSize: '12px', color: '#0f172a' }}>
                  {truck.capacity_kg.toLocaleString()} kg
                </strong>
              </div>
            </div>

            {/* Driver Contact Section */}
            <div style={styles.driverSection}>
              <div style={styles.driverInfo}>
                <div style={styles.driverAvatar}>
                  <User size={14} color="#ffffff" />
                </div>
                <div>
                  <div style={styles.driverName}>{truck.driver_name}</div>
                  <div style={styles.driverPhone}>{truck.driver_phone}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <a href={`tel:${truck.driver_phone}`} style={styles.callBtn} title="Call Driver">
                  <Phone size={13} />
                </a>
                <button
                  onClick={() => handleDeleteTruck(truck.truck_id)}
                  style={styles.deleteTruckBtn}
                  title="Decommission vehicle"
                >
                  <Trash2 size={13} color="#ef4444" />
                </button>
              </div>
            </div>

            {/* Maintenance Toggle Action */}
            <button
              onClick={() => handleToggleMaintenance(truck)}
              style={{
                ...styles.toggleActionBtn,
                background: truck.is_active ? '#fff1f2' : '#ecfdf5',
                color: truck.is_active ? '#e11d48' : '#047857',
                borderColor: truck.is_active ? '#fecdd3' : '#a7f3d0',
              }}
            >
              {truck.is_active ? 'Send to Maintenance' : 'Activate for Route'}
            </button>
          </div>
        ))}
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h2 style={styles.modalTitle}>Register Municipal Vehicle</h2>
            <p style={styles.modalSub}>Add a new garbage compactor truck to the active MCD fleet.</p>

            <form onSubmit={handleCreateTruck} style={styles.modalForm}>
              <div>
                <label style={styles.modalLabel}>Driver Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={newTruckForm.driver_name}
                  onChange={(e) => setNewTruckForm({ ...newTruckForm, driver_name: e.target.value })}
                  style={styles.modalInput}
                />
              </div>

              <div>
                <label style={styles.modalLabel}>Registration Number</label>
                <input
                  type="text"
                  required
                  value={newTruckForm.registration_number}
                  onChange={(e) => setNewTruckForm({ ...newTruckForm, registration_number: e.target.value })}
                  style={styles.modalInput}
                />
              </div>

              <div>
                <label style={styles.modalLabel}>Driver Phone</label>
                <input
                  type="text"
                  required
                  value={newTruckForm.driver_phone}
                  onChange={(e) => setNewTruckForm({ ...newTruckForm, driver_phone: e.target.value })}
                  style={styles.modalInput}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={styles.modalLabel}>Fuel Type</label>
                  <select
                    value={newTruckForm.fuel_type}
                    onChange={(e) => setNewTruckForm({ ...newTruckForm, fuel_type: e.target.value })}
                    style={styles.modalInput}
                  >
                    <option value="EV">Electric Tipper (EV)</option>
                    <option value="CNG Compactor">CNG Compactor</option>
                    <option value="CNG Heavy">CNG Heavy Truck</option>
                  </select>
                </div>

                <div>
                  <label style={styles.modalLabel}>Capacity (kg)</label>
                  <input
                    type="number"
                    value={newTruckForm.capacity_kg}
                    onChange={(e) => setNewTruckForm({ ...newTruckForm, capacity_kg: Number(e.target.value) })}
                    style={styles.modalInput}
                  />
                </div>
              </div>

              <div>
                <label style={styles.modalLabel}>Assigned Zone</label>
                <select
                  value={newTruckForm.zone}
                  onChange={(e) => setNewTruckForm({ ...newTruckForm, zone: e.target.value })}
                  style={styles.modalInput}
                >
                  <option value="South Delhi (MCD)">South Delhi (MCD)</option>
                  <option value="Central & New Delhi (NDMC)">Central & New Delhi (NDMC)</option>
                  <option value="Noida (Authority)">Noida Authority (UP)</option>
                  <option value="Gurugram (MCG)">Gurugram (MCG, Haryana)</option>
                  <option value="Ghaziabad & East Delhi (GMC/EDMC)">Ghaziabad & East Delhi (GMC/EDMC)</option>
                </select>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={styles.modalCancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.modalSubmitBtn}>
                  Confirm & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
    gap: '6px',
    marginBottom: '6px',
  },
  badgeText: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#059669',
    letterSpacing: '0.6px',
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
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    background: '#10b981',
    color: '#ffffff',
    borderRadius: '10px',
    border: 'none',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(16,185,129,0.35)',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '18px',
    marginBottom: '24px',
  },
  kpiCard: {
    background: '#ffffff',
    borderRadius: '14px',
    padding: '18px 20px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  kpiIconWrap: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiVal: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#0f172a',
  },
  kpiLabel: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '20px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '8px 14px',
    width: '320px',
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
  },
  filterGroup: {
    display: 'flex',
    gap: '8px',
  },
  filterBtn: {
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  truckGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  truckCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  truckIdRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  truckId: {
    fontSize: '16px',
    fontWeight: 800,
    color: '#0f172a',
  },
  fuelPill: {
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: '8px',
  },
  regNo: {
    fontSize: '11px',
    fontFamily: 'monospace',
    color: '#94a3b8',
    marginTop: '2px',
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: '12px',
  },
  metricsBox: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
  },
  subtext: {
    color: '#64748b',
  },
  driverSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '6px',
    borderTop: '1px solid #f1f5f9',
  },
  driverInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  driverAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverName: {
    fontSize: '12.5px',
    fontWeight: 700,
    color: '#0f172a',
  },
  driverPhone: {
    fontSize: '11px',
    color: '#64748b',
  },
  callBtn: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    background: '#ecfdf5',
    color: '#047857',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
  },
  toggleActionBtn: {
    width: '100%',
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalCard: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '28px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: 800,
    color: '#0f172a',
  },
  modalSub: {
    fontSize: '12.5px',
    color: '#64748b',
    marginTop: '2px',
    marginBottom: '20px',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  modalLabel: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#334155',
    marginBottom: '4px',
    display: 'block',
  },
  modalInput: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '13px',
    outline: 'none',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '10px',
  },
  modalCancelBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    color: '#64748b',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
  },
  modalSubmitBtn: {
    padding: '8px 18px',
    borderRadius: '8px',
    border: 'none',
    background: '#10b981',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer',
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 14px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#475569',
    fontSize: '12.5px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  simulatorCard: {
    background: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    padding: '18px 22px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  simHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '14px',
  },
  simBadge: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#059669',
    background: '#d1fae5',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  simBody: {
    display: 'grid',
    gridTemplateColumns: 'minmax(240px, 1fr) 2fr',
    gap: '24px',
    alignItems: 'center',
  },
  simControl: {
    background: '#f8fafc',
    borderRadius: '10px',
    padding: '12px 14px',
    border: '1px solid #f1f5f9',
  },
  simMetrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
  },
  simStat: {
    background: '#f8fafc',
    borderRadius: '10px',
    padding: '10px 14px',
    border: '1px solid #f1f5f9',
  },
  simStatVal: {
    fontSize: '18px',
    fontWeight: 800,
    color: '#0f172a',
  },
  simStatLabel: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '2px',
  },
  batteryTrack: {
    width: '100%',
    height: '6px',
    background: '#e2e8f0',
    borderRadius: '3px',
    overflow: 'hidden',
    marginTop: '2px',
  },
  batteryFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  deleteTruckBtn: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    background: '#fef2f2',
    border: '1px solid #fee2e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
}
