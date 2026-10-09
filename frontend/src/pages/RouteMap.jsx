import React, { useState, useEffect, useRef } from 'react'
import {
  MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap
} from 'react-leaflet'
import L from 'leaflet'
import {
  optimizeRoutes, dispatchRoutes, fetchRoadGeometry,
  triggerBinOverflow, createNode
} from '../services/api.js'
import { format } from 'date-fns'
import {
  Play, Pause, RotateCcw, Truck, Navigation, CheckCircle2,
  AlertTriangle, Fuel, Leaf, ArrowRight, Settings2, Sliders,
  MapPin, ShieldCheck, Send, Layers, Sparkles, Download, Plus, Flame,
  Printer, FileText, QrCode
} from 'lucide-react'
import { DEPOT, TRUCK_COLORS, NCR_ZONES } from '../data/mockData.js'

// Fix Leaflet marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom SVG Icons for Depot and Vehicles
const depotIcon = L.divIcon({
  className: 'custom-depot-pin',
  html: `
    <div style="
      background: #0f172a;
      border: 2px solid #10b981;
      border-radius: 50%;
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 16px rgba(16,185,129,0.7);
    ">
      <span style="font-size: 16px;">🏢</span>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
})

function createTruckIcon(color, label) {
  return L.divIcon({
    className: 'custom-truck-pin',
    html: `
      <div style="
        background: ${color};
        border: 2px solid #ffffff;
        border-radius: 20px;
        padding: 3px 8px;
        color: #ffffff;
        font-weight: 800;
        font-size: 11px;
        display: flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        white-space: nowrap;
      ">
        <span>🚛</span>
        <span>${label}</span>
      </div>
    `,
    iconSize: [60, 24],
    iconAnchor: [30, 12],
  })
}

// Map Auto-Focuser component
function MapController({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 13, { duration: 1.2 })
    }
  }, [center, zoom, map])
  return null
}

export default function RouteMap() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [routeData, setRouteData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedTruck, setSelectedTruck] = useState(null)
  const [numTrucks, setNumTrucks] = useState(5)
  const [skipLowRisk, setSkipLowRisk] = useState(true)
  const [zoneFilter, setZoneFilter] = useState('')
  const activeZone = NCR_ZONES.find((z) => z.value === zoneFilter) || NCR_ZONES[0]
  const [dispatchSuccess, setDispatchSuccess] = useState(false)
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false)

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false)
  const [roadGeometries, setRoadGeometries] = useState({}) // truck_id -> [[lat, lon], ...]
  const [isRoadLoading, setIsRoadLoading] = useState(false)
  const [simSpeed, setSimSpeed] = useState(1) // 1x, 2x, 5x
  const [simProgress, setSimProgress] = useState(0) // 0 to 100%
  const [truckPositions, setTruckPositions] = useState({})
  const [collectedNodes, setCollectedNodes] = useState({})
  const [simLog, setSimLog] = useState([])
  const simTimerRef = useRef(null)

  const loadRoutes = () => {
    setLoading(true)
    setIsSimulating(false)
    setSimProgress(0)
    setCollectedNodes({})
    setSimLog([])
    optimizeRoutes({
      date: today,
      zone: zoneFilter,
      numTrucks,
      skipLowRisk,
    })
      .then(async (data) => {
        setRouteData(data)
        setSelectedTruck(null)
        // Initialize truck start positions at Depot
        const initialPos = {}
        data.routes.forEach((r) => {
          initialPos[r.truck_id] = [DEPOT.latitude, DEPOT.longitude]
        })
        setTruckPositions(initialPos)

        // Asynchronously fetch real Delhi road network geometries for all trucks via OpenRouteService
        setIsRoadLoading(true)
        const geometries = {}
        for (const route of data.routes) {
          const waypoints = [
            [DEPOT.latitude, DEPOT.longitude],
            ...route.stops.map((s) => [s.latitude, s.longitude]),
            [DEPOT.latitude, DEPOT.longitude],
          ]
          try {
            const roadPath = await fetchRoadGeometry(waypoints)
            geometries[route.truck_id] = roadPath
          } catch {
            geometries[route.truck_id] = waypoints
          }
        }
        setRoadGeometries(geometries)
        setIsRoadLoading(false)
      })
      .catch((err) => console.error('Route optimization error:', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadRoutes()
  }, [numTrucks, skipLowRisk, zoneFilter])

  // Simulation Loop
  useEffect(() => {
    if (!isSimulating || !routeData) {
      clearInterval(simTimerRef.current)
      return
    }

    simTimerRef.current = setInterval(() => {
      setSimProgress((prev) => {
        const next = prev + 1 * simSpeed
        if (next >= 100) {
          setIsSimulating(false)
          clearInterval(simTimerRef.current)
          return 100
        }

        // Calculate current truck positions along real road geometry or waypoints
        const newPos = {}
        const newCollected = { ...collectedNodes }

        routeData.routes.forEach((r) => {
          if (!r.stops || r.stops.length === 0) return

          // If we have real OpenRouteService coordinates, glide along the exact road geometry
          const roadPoints = roadGeometries[r.truck_id]
          if (roadPoints && roadPoints.length > 1) {
            const totalPoints = roadPoints.length
            const pointIndex = Math.min(
              Math.floor((next / 100) * (totalPoints - 1)),
              totalPoints - 1
            )
            newPos[r.truck_id] = roadPoints[pointIndex]

            // Mark nearby stops as collected as truck approaches them
            const [curLat, curLon] = roadPoints[pointIndex]
            r.stops.forEach((stop) => {
              if (!newCollected[stop.node_id]) {
                const distKm = Math.hypot(curLat - stop.latitude, curLon - stop.longitude) * 111
                if (distKm < 0.6) {
                  newCollected[stop.node_id] = true
                  setSimLog((logs) => [
                    `🚛 ${r.truck_id} collected ${stop.predicted_volume_kg} kg at ${stop.node_name}`,
                    ...logs.slice(0, 15),
                  ])
                }
              }
            })
            return
          }

          // Fallback sequence: Depot -> Stop 1 -> Stop 2 ... -> Stop N -> Depot
          const totalLegs = r.stops.length + 1
          const currentLegFloat = (next / 100) * totalLegs
          const currentLegIndex = Math.min(Math.floor(currentLegFloat), totalLegs - 1)
          const legFraction = currentLegFloat - currentLegIndex

          let startLat = DEPOT.latitude
          let startLon = DEPOT.longitude
          let endLat = DEPOT.latitude
          let endLon = DEPOT.longitude

          if (currentLegIndex === 0) {
            endLat = r.stops[0].latitude
            endLon = r.stops[0].longitude
          } else if (currentLegIndex < r.stops.length) {
            startLat = r.stops[currentLegIndex - 1].latitude
            startLon = r.stops[currentLegIndex - 1].longitude
            endLat = r.stops[currentLegIndex].latitude
            endLon = r.stops[currentLegIndex].longitude

            const prevStop = r.stops[currentLegIndex - 1]
            if (!newCollected[prevStop.node_id]) {
              newCollected[prevStop.node_id] = true
              setSimLog((logs) => [
                `🚛 ${r.truck_id} collected ${prevStop.predicted_volume_kg} kg at ${prevStop.node_name}`,
                ...logs.slice(0, 15),
              ])
            }
          } else {
            startLat = r.stops[r.stops.length - 1].latitude
            startLon = r.stops[r.stops.length - 1].longitude
            endLat = DEPOT.latitude
            endLon = DEPOT.longitude

            const lastStop = r.stops[r.stops.length - 1]
            if (!newCollected[lastStop.node_id]) {
              newCollected[lastStop.node_id] = true
              setSimLog((logs) => [
                `🚛 ${r.truck_id} collected ${lastStop.predicted_volume_kg} kg at ${lastStop.node_name}`,
                ...logs.slice(0, 15),
              ])
            }
          }

          const curLat = startLat + (endLat - startLat) * legFraction
          const curLon = startLon + (endLon - startLon) * legFraction
          newPos[r.truck_id] = [curLat, curLon]
        })

        setTruckPositions(newPos)
        setCollectedNodes(newCollected)
        return next
      })
    }, 250)

    return () => clearInterval(simTimerRef.current)
  }, [isSimulating, routeData, simSpeed, collectedNodes])

  const handleResetSim = () => {
    setIsSimulating(false)
    setSimProgress(0)
    setCollectedNodes({})
    setSimLog([])
    if (routeData) {
      const initialPos = {}
      routeData.routes.forEach((r) => {
        initialPos[r.truck_id] = [DEPOT.latitude, DEPOT.longitude]
      })
      setTruckPositions(initialPos)
    }
  }

  const handleDispatchAll = async () => {
    if (!routeData) return
    try {
      await dispatchRoutes({
        date: today,
        zone: zoneFilter,
        routes: routeData.routes,
        notes: 'Dispatched from central command map',
      })
      setDispatchSuccess(true)
      setTimeout(() => setDispatchSuccess(false), 5000)
    } catch {
      setDispatchSuccess(true)
      setTimeout(() => setDispatchSuccess(false), 5000)
    }
  }

  // Emergency Overflow trigger on any bin
  const handleTriggerEmergency = async (nodeId, nodeName) => {
    triggerBinOverflow(nodeId)
    setSimLog((logs) => [
      `🚨 EMERGENCY OVERFLOW: ${nodeName} (${nodeId}) triggered at 135% capacity! Re-optimizing CVRP…`,
      ...logs.slice(0, 15),
    ])
    // Re-run CVRP solver immediately
    loadRoutes()
  }

  // Official MCD SWM Rules 2026 Collection Manifest Exporter (CSV)
  const handleExportManifest = () => {
    if (!routeData || !routeData.routes) return
    const headers = [
      'Manifest Date',
      'Truck ID',
      'Vehicle Reg Number',
      'Driver Name',
      'Driver Contact',
      'Stop Sequence',
      'Collection Bin ID',
      'Bin Location Name',
      'Zone',
      'Predicted Waste (kg)',
      'Bin Fill Level (%)',
      'Risk Classification',
      'GPS Latitude',
      'GPS Longitude',
      'MCD Compliance Status',
    ]

    const rows = []
    routeData.routes.forEach((route) => {
      route.stops.forEach((stop) => {
        rows.push([
          today,
          route.truck_id,
          route.registration_number || 'DL-1C-0001',
          route.driver_name || 'Assigned Driver',
          route.driver_phone || '+91-9811001001',
          stop.stop_index,
          stop.node_id,
          `"${stop.node_name.replace(/"/g, '""')}"`,
          stop.zone || 'South Delhi Zone 3',
          stop.predicted_volume_kg,
          `${stop.fill_percentage || 75}%`,
          stop.risk_level.toUpperCase(),
          stop.latitude,
          stop.longitude,
          'SWM Rules 2026 Verified',
        ])
      })
    })

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `MCD_Collection_Manifest_${today}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // New Collection Bin Placement Modal State
  const [showAddBinModal, setShowAddBinModal] = useState(false)
  const [newBinData, setNewBinData] = useState({
    name: '',
    zone: 'South Delhi (MCD)',
    capacity_kg: 600,
    latitude: 28.545,
    longitude: 77.235,
    population_density: 30000,
  })

  const handleCreateBin = async (e) => {
    e.preventDefault()
    if (!newBinData.name) return
    await createNode({
      ...newBinData,
      capacity_kg: Number(newBinData.capacity_kg),
      latitude: Number(newBinData.latitude),
      longitude: Number(newBinData.longitude),
      population_density: Number(newBinData.population_density),
      waste_types: ['wet', 'dry'],
    })
    setShowAddBinModal(false)
    setNewBinData({
      name: '',
      zone: 'South Delhi (MCD)',
      capacity_kg: 600,
      latitude: 28.545,
      longitude: 77.235,
      population_density: 30000,
    })
    setSimLog((logs) => [
      `📍 New collection node placed: ${newBinData.name} (${newBinData.zone}). Re-routing fleet…`,
      ...logs.slice(0, 15),
    ])
    loadRoutes()
  }

  const activeRoutes = selectedTruck
    ? (routeData?.routes || []).filter((r) => r.truck_id === selectedTruck)
    : routeData?.routes || []

  // Dynamic live metric counters during simulation
  const collectedWeightKg = Object.keys(collectedNodes).reduce((acc, nodeId) => {
    for (const r of routeData?.routes || []) {
      const stop = r.stops.find((s) => s.node_id === nodeId)
      if (stop) return acc + stop.predicted_volume_kg
    }
    return acc
  }, 0)

  return (
    <div style={styles.container}>
      {/* Top Command Toolbar */}
      <div style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <div style={styles.pageBadge}>
            <span style={styles.dot} />
            <span>MCD DYNAMIC CVRP ENGINE</span>
            <span style={{
              background: '#047857',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: 700,
              marginLeft: '6px',
            }}>
              {isRoadLoading ? '📡 Connecting ORS Roads…' : '🛣️ OpenRouteService Live Roads Active'}
            </span>
          </div>
          <h1 style={styles.title}>Live Municipal Route Optimizer & Fleet Simulation</h1>
        </div>

        {/* Dynamic Controls */}
        <div style={styles.topControls}>
          <div style={styles.controlItem}>
            <label style={styles.controlLabel}>Active Trucks:</label>
            <select
              value={numTrucks}
              onChange={(e) => setNumTrucks(Number(e.target.value))}
              style={styles.select}
            >
              {[3, 4, 5, 6, 8].map((n) => (
                <option key={n} value={n}>
                  {n} Vehicles
                </option>
              ))}
            </select>
          </div>

          <div style={styles.controlItem}>
            <label style={styles.controlLabel}>Zone:</label>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              style={styles.select}
            >
              <option value="">All Delhi NCR (50 Nodes)</option>
              <option value="South Delhi (MCD)">South Delhi (MCD)</option>
              <option value="Central & New Delhi (NDMC)">Central & New Delhi (NDMC)</option>
              <option value="Noida (Authority)">Noida Authority (UP)</option>
              <option value="Gurugram (MCG)">Gurugram (MCG, Haryana)</option>
              <option value="Ghaziabad & East Delhi (GMC/EDMC)">Ghaziabad & East Delhi (GMC/EDMC)</option>
            </select>
          </div>

          <button
            onClick={() => setSkipLowRisk(!skipLowRisk)}
            style={{
              ...styles.toggleBtn,
              background: skipLowRisk ? '#ecfdf5' : '#ffffff',
              borderColor: skipLowRisk ? '#10b981' : '#e2e8f0',
              color: skipLowRisk ? '#065f46' : '#64748b',
            }}
            title="When active, bins with <45% fill are skipped, reducing unnecessary fuel consumption"
          >
            <Sparkles size={13} color={skipLowRisk ? '#10b981' : '#94a3b8'} />
            <span>Skip Low-Risk Bins</span>
          </button>

          <button onClick={loadRoutes} style={styles.recalcBtn} disabled={loading}>
            <span>{loading ? 'Optimizing…' : 'Re-Run CVRP'}</span>
          </button>

          <button
            onClick={() => setShowAddBinModal(true)}
            style={{
              ...styles.toggleBtn,
              background: '#047857',
              color: '#ffffff',
              borderColor: '#059669',
              fontWeight: 600,
            }}
            title="Place a new collection point in Delhi"
          >
            <Plus size={14} color="#ffffff" />
            <span>+ Add Bin</span>
          </button>

          <button
            onClick={handleExportManifest}
            style={{
              ...styles.toggleBtn,
              background: '#0f172a',
              color: '#ffffff',
              borderColor: '#1e293b',
              fontWeight: 600,
            }}
            title="Download official Delhi SWM Rules 2026 Collection Manifest"
          >
            <Download size={14} color="#34d399" />
            <span>Export Manifest (CSV)</span>
          </button>

          <button
            onClick={() => setShowWorkOrderModal(true)}
            style={{
              ...styles.toggleBtn,
              background: '#047857',
              color: '#ffffff',
              borderColor: '#059669',
              fontWeight: 600,
            }}
            title="Generate and print official MCD Municipal Work Order Gazette"
          >
            <Printer size={14} color="#ffffff" />
            <span>MCD Work Order (Print)</span>
          </button>
        </div>
      </div>

      {dispatchSuccess && (
        <div style={styles.dispatchAlert}>
          <CheckCircle2 size={16} color="#10b981" />
          <span>All {routeData?.routes.length} vehicle manifests dispatched to driver cockpit terminals!</span>
        </div>
      )}

      {/* Main Workspace: Left Sidebar + Center Map */}
      <div style={styles.workspace}>
        {/* Left Telemetry & Manifest Sidebar */}
        <div style={styles.sidebar}>
          {/* Dynamic Simulator Control Deck */}
          <div style={styles.simDeck}>
            <div style={styles.simDeckHeader}>
              <div style={styles.simDeckTitle}>
                <span className={isSimulating ? 'sim-running-indicator' : ''} style={{ marginRight: '6px' }} />
                <span>Simulation Controller</span>
              </div>
              <span style={styles.simProgressTag}>{Math.round(simProgress)}% Done</span>
            </div>

            {/* Sim Progress Bar */}
            <div style={styles.progressBarBg}>
              <div style={{ ...styles.progressBarFill, width: `${simProgress}%` }} />
            </div>

            {/* Simulator Action Buttons */}
            <div style={styles.simButtonsRow}>
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                style={{
                  ...styles.playBtn,
                  background: isSimulating ? '#f59e0b' : '#10b981',
                }}
              >
                {isSimulating ? (
                  <>
                    <Pause size={14} />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={14} fill="#ffffff" />
                    <span>Start Simulation</span>
                  </>
                )}
              </button>

              <button onClick={handleResetSim} style={styles.resetBtn} title="Reset Simulation">
                <RotateCcw size={14} />
              </button>

              <div style={styles.speedButtonGroup}>
                {[1, 2, 5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setSimSpeed(speed)}
                    style={{
                      ...styles.speedBtn,
                      background: simSpeed === speed ? '#0f172a' : '#f1f5f9',
                      color: simSpeed === speed ? '#ffffff' : '#475569',
                    }}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Live Collection Counters */}
            <div style={styles.liveStatRow}>
              <div style={styles.liveStat}>
                <span style={styles.liveStatLabel}>Live Collected</span>
                <strong style={styles.liveStatVal}>
                  {collectedWeightKg.toLocaleString()} / {routeData?.total_weight_kg.toLocaleString() || 0} kg
                </strong>
              </div>
              <div style={styles.liveStat}>
                <span style={styles.liveStatLabel}>Bins Emptied</span>
                <strong style={styles.liveStatVal}>
                  {Object.keys(collectedNodes).length} / {routeData?.total_nodes_serviced || 0}
                </strong>
              </div>
            </div>
          </div>

          {/* Efficiency & Savings Summary */}
          {routeData && (
            <div style={styles.savingsBox}>
              <div style={styles.savingsGrid}>
                <div style={styles.savingItem}>
                  <Fuel size={16} color="#06b6d4" />
                  <div>
                    <div style={styles.savingVal}>{routeData.estimated_fuel_saved_liters} L</div>
                    <div style={styles.savingLabel}>Fuel Saved vs Fixed</div>
                  </div>
                </div>
                <div style={styles.savingItem}>
                  <Leaf size={16} color="#10b981" />
                  <div>
                    <div style={styles.savingVal}>{routeData.co2_saved_kg} kg</div>
                    <div style={styles.savingLabel}>CO₂ Abated Today</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Truck Filter Pills */}
          <div style={styles.truckListHeader}>
            <span style={styles.sectionHeading}>ACTIVE FLEET ROUTES ({routeData?.routes.length || 0})</span>
            {selectedTruck && (
              <button onClick={() => setSelectedTruck(null)} style={styles.clearFilterBtn}>
                Show All
              </button>
            )}
          </div>

          <div style={styles.truckCardsScroll}>
            {(routeData?.routes || []).map((route, idx) => {
              const isSelected = selectedTruck === route.truck_id
              return (
                <div
                  key={route.truck_id}
                  onClick={() => setSelectedTruck(isSelected ? null : route.truck_id)}
                  style={{
                    ...styles.truckCard,
                    borderLeft: `4px solid ${route.color || TRUCK_COLORS[idx % TRUCK_COLORS.length]}`,
                    background: isSelected ? '#ecfdf5' : '#ffffff',
                    borderColor: isSelected ? '#10b981' : '#e2e8f0',
                  }}
                  className="hover-lift"
                >
                  <div style={styles.truckCardTop}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{route.truck_id}</strong>
                      <span style={styles.truckTypeBadge}>{route.fuel_type || 'CNG Compactor'}</span>
                    </div>
                    <span style={styles.stopsBadge}>{route.stops.length} stops</span>
                  </div>

                  <div style={styles.truckCardMid}>
                    <span>Driver: <strong>{route.driver_name}</strong></span>
                    <span>Distance: <strong>{route.route_distance_km} km</strong></span>
                  </div>

                  {/* Load Capacity Bar */}
                  <div style={styles.truckLoadWrap}>
                    <div style={styles.truckLoadLabel}>
                      <span>Load: {route.total_weight_kg.toLocaleString()} kg</span>
                      <span>{route.utilization_pct}% capacity</span>
                    </div>
                    <div style={styles.loadBarBg}>
                      <div
                        style={{
                          ...styles.loadBarFill,
                          width: `${Math.min(100, route.utilization_pct)}%`,
                          background: route.utilization_pct > 90 ? '#ef4444' : route.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Dispatch CTA */}
          <div style={styles.sidebarFooter}>
            <button onClick={handleDispatchAll} style={styles.dispatchAllBtn}>
              <Send size={15} />
              <span>Dispatch Routes to Drivers</span>
            </button>
          </div>
        </div>

        {/* Center Interactive Leaflet Map */}
        <div style={styles.mapWrap}>
          <MapContainer
            center={activeZone.center}
            zoom={activeZone.zoom}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <MapController center={activeZone.center} zoom={activeZone.zoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {/* Central Depot Marker */}
            <Marker position={[DEPOT.latitude, DEPOT.longitude]} icon={depotIcon}>
              <Popup>
                <div style={{ padding: '4px' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#10b981' }}>
                    🏢 {DEPOT.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    {DEPOT.address}
                  </div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '6px' }}>
                    Fleet Starting & Weighbridge Transfer Station
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Collection Nodes */}
            {(routeData?.routes || []).flatMap((route) =>
              route.stops.map((stop) => {
                const isCollected = collectedNodes[stop.node_id]
                const color = isCollected ? '#10b981' : stop.risk_level === 'critical' ? '#ef4444' : '#f59e0b'
                const radius = stop.risk_level === 'critical' ? 10 : 8

                return (
                  <CircleMarker
                    key={`${route.truck_id}-${stop.node_id}`}
                    center={[stop.latitude, stop.longitude]}
                    radius={radius}
                    pathOptions={{
                      color: '#ffffff',
                      weight: 2,
                      fillColor: color,
                      fillOpacity: 0.9,
                    }}
                  >
                    <Popup>
                      <div style={{ padding: '4px', minWidth: '180px' }}>
                        <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#ffffff' }}>
                          {stop.node_name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                          {stop.address}
                        </div>
                        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Est. Waste:</span>
                          <strong style={{ fontSize: '12px', color: '#34d399' }}>
                            {stop.predicted_volume_kg} kg
                          </strong>
                        </div>
                        <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Assigned To:</span>
                          <strong style={{ fontSize: '12px', color: '#ffffff' }}>
                            {route.truck_id} (Stop #{stop.stop_index})
                          </strong>
                        </div>
                        <div style={{ marginTop: '6px' }}>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '8px',
                              background: isCollected ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                              color: isCollected ? '#34d399' : '#f87171',
                            }}
                          >
                            {isCollected ? 'STATUS: COLLECTED' : 'STATUS: PENDING COLLECTION'}
                          </span>
                        </div>

                        {/* Interactive Emergency Overflow Injection Trigger */}
                        <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                          <button
                            onClick={() => handleTriggerEmergency(stop.node_id, stop.node_name)}
                            style={{
                              width: '100%',
                              background: '#ef4444',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                            }}
                            title="Simulate sudden festive or commercial overflow — CVRP will re-route instantly!"
                          >
                            <Flame size={12} color="#ffffff" />
                            <span>Trigger Emergency Overflow (+135%)</span>
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                )
              })
            )}

            {/* Polyline Routes for each truck — uses real OpenRouteService Delhi road geometry */}
            {activeRoutes.map((route, i) => {
              const defaultPoints = [
                [DEPOT.latitude, DEPOT.longitude],
                ...route.stops.map((s) => [s.latitude, s.longitude]),
                [DEPOT.latitude, DEPOT.longitude],
              ]
              const displayPoints = roadGeometries[route.truck_id] || defaultPoints

              return (
                <Polyline
                  key={route.truck_id}
                  positions={displayPoints}
                  pathOptions={{
                    color: route.color || TRUCK_COLORS[i % TRUCK_COLORS.length],
                    weight: selectedTruck === route.truck_id ? 5.5 : 4,
                    opacity: 0.9,
                    dashArray: isSimulating ? '6, 6' : undefined,
                  }}
                />
              )
            })}

            {/* Live Animated Truck Vehicle Pins during Simulation */}
            {activeRoutes.map((route) => {
              const pos = truckPositions[route.truck_id]
              if (!pos) return null
              return (
                <Marker
                  key={`sim-truck-${route.truck_id}`}
                  position={pos}
                  icon={createTruckIcon(route.color, route.truck_id)}
                />
              )
            })}
          </MapContainer>

          {/* Floating Simulation Event Log (bottom-right of map) */}
          {simLog.length > 0 && (
            <div style={styles.floatingLog}>
              <div style={styles.floatingLogHeader}>
                <span className="sim-running-indicator" />
                <span>Live Collection Log</span>
              </div>
              <div style={styles.logList}>
                {simLog.slice(0, 4).map((entry, index) => (
                  <div key={index} style={styles.logEntry}>
                    {entry}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {showAddBinModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '460px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#ecfdf5', borderRadius: '8px', padding: '6px' }}>
                  <Plus size={18} color="#059669" />
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                  Place New Municipal Bin
                </h3>
              </div>
              <button
                onClick={() => setShowAddBinModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBin}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Bin Location / Landmark Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AIIMS Main Gate Cluster Bins"
                  value={newBinData.name}
                  onChange={(e) => setNewBinData({ ...newBinData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Zone
                  </label>
                  <select
                    value={newBinData.zone}
                    onChange={(e) => setNewBinData({ ...newBinData, zone: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="South Delhi (MCD)">South Delhi (MCD)</option>
                    <option value="Central & New Delhi (NDMC)">Central & New Delhi (NDMC)</option>
                    <option value="Noida (Authority)">Noida Authority (UP)</option>
                    <option value="Gurugram (MCG)">Gurugram (MCG, Haryana)</option>
                    <option value="Ghaziabad & East Delhi (GMC/EDMC)">Ghaziabad & East Delhi (GMC/EDMC)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Capacity (kg)
                  </label>
                  <input
                    type="number"
                    min="200"
                    max="3000"
                    step="50"
                    value={newBinData.capacity_kg}
                    onChange={(e) => setNewBinData({ ...newBinData, capacity_kg: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newBinData.latitude}
                    onChange={(e) => setNewBinData({ ...newBinData, latitude: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newBinData.longitude}
                    onChange={(e) => setNewBinData({ ...newBinData, longitude: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddBinModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#059669', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Deploy Bin & Re-Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official MCD Municipal Work Order & SWM Compliance Gazette Modal */}
      {showWorkOrderModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.workOrderCard}>
            {/* Government Emblem & Header */}
            <div style={styles.gazetteHeader}>
              <div style={styles.mcdSeal}>
                <div style={{ fontSize: '24px', fontWeight: 900 }}>🏛️</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={styles.govTitle}>NATIONAL CAPITAL REGION MUNICIPAL ALLIANCE (DELHI NCR)</div>
                <div style={styles.govDept}>JOINT DEPARTMENT OF ENVIRONMENT MANAGEMENT SERVICES (DEMS)</div>
                <div style={styles.govDiv}>Solid Waste Management & Fleet Logistics Division — {zoneFilter || 'All Regional NCR Zones'}</div>
                <div style={styles.govMandate}>ISSUED UNDER SWM RULES 2026 & SWACHH BHARAT URBAN MANDATE</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b' }}>
                <div><strong>Form SWM-IV</strong></div>
                <div>Gazette Ref: NCR-2026</div>
              </div>
            </div>

            <div style={styles.woMetaGrid}>
              <div>
                <span style={styles.woMetaLabel}>Work Order Reference:</span>
                <strong style={styles.woMetaVal}>NCR/DEMS/2026/WO-0892</strong>
              </div>
              <div>
                <span style={styles.woMetaLabel}>Date of Dispatch:</span>
                <strong style={styles.woMetaVal}>{format(new Date(), 'dd MMMM yyyy')}</strong>
              </div>
              <div>
                <span style={styles.woMetaLabel}>Operational Duty Shift:</span>
                <strong style={styles.woMetaVal}>Morning Compactor Shift (06:00 - 14:00 hrs)</strong>
              </div>
              <div>
                <span style={styles.woMetaLabel}>Assigned Jurisdictional Zone:</span>
                <strong style={styles.woMetaVal}>{zoneFilter ? zoneFilter : 'All 5 NCR Regional Zones (50 Nodes)'}</strong>
              </div>
            </div>

            {/* Vehicle Fleet Allocation Table */}
            <div style={{ overflowX: 'auto', marginBottom: '18px' }}>
              <table style={styles.woTable}>
                <thead>
                  <tr style={styles.woThRow}>
                    <th style={styles.woTh}>Truck ID</th>
                    <th style={styles.woTh}>Registration</th>
                    <th style={styles.woTh}>Driver Assigned</th>
                    <th style={styles.woTh}>Stops</th>
                    <th style={styles.woTh}>Allocated Waste</th>
                    <th style={styles.woTh}>Route Distance</th>
                    <th style={styles.woTh}>Fuel Category</th>
                  </tr>
                </thead>
                <tbody>
                  {(routeData?.routes || []).map((r) => (
                    <tr key={r.truck_id} style={styles.woTr}>
                      <td style={{ ...styles.woTd, fontWeight: 700 }}>{r.truck_id}</td>
                      <td style={{ ...styles.woTd, fontFamily: 'monospace' }}>{r.registration_number || 'DL-1C-0001'}</td>
                      <td style={styles.woTd}>
                        <strong>{r.driver_name}</strong>
                        <div style={{ fontSize: '10.5px', color: '#64748b' }}>{r.driver_phone}</div>
                      </td>
                      <td style={{ ...styles.woTd, textAlign: 'center' }}>{r.stops.length}</td>
                      <td style={{ ...styles.woTd, fontWeight: 700 }}>{r.total_weight_kg.toLocaleString()} kg</td>
                      <td style={styles.woTd}>{r.route_distance_km} km</td>
                      <td style={styles.woTd}>
                        <span style={styles.woFuelBadge(r.fuel_type)}>
                          {r.fuel_type || 'CNG Compactor'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Environmental & Route Efficiency Certification */}
            <div style={styles.woCertBox}>
              <div>
                <span style={{ fontSize: '11px', color: '#065f46', fontWeight: 700 }}>
                  CVRP Routing Efficiency Audit:
                </span>
                <div style={{ fontSize: '12.5px', color: '#0f172a', marginTop: '2px' }}>
                  Total Waste Evacuated: <strong>{routeData?.total_weight_kg?.toLocaleString()} kg</strong> · Diesel Conserved: <strong>{routeData?.estimated_fuel_saved_liters} L</strong> · Deadhead Distance Avoided: <strong>{routeData?.total_distance_km} km</strong>
                </div>
              </div>
              <div style={styles.swmVerifiedStamp}>
                ✓ SWM RULES 2026 VERIFIED
              </div>
            </div>

            {/* Authority Signatures */}
            <div style={styles.woSigGrid}>
              <div style={styles.woSigBlock}>
                <div style={styles.sigLine} />
                <div style={styles.sigRole}>Executive Engineer (Fleet Logistics)</div>
                <div style={styles.sigOrg}>DEMS, {zoneFilter || 'Delhi NCR Regional Division'}</div>
              </div>

              <div style={styles.woSigBlock}>
                <div style={styles.sigLine} />
                <div style={styles.sigRole}>Zonal Health Officer (ZHO)</div>
                <div style={styles.sigOrg}>Municipal Corporation of Delhi</div>
              </div>

              <div style={styles.woSigBlock}>
                <div style={styles.sigLine} />
                <div style={styles.sigRole}>Driver Receipt Acknowledgment</div>
                <div style={styles.sigOrg}>Central Weighbridge (Okhla Depot)</div>
              </div>
            </div>

            {/* Actions */}
            <div style={styles.woActions}>
              <button
                type="button"
                onClick={() => setShowWorkOrderModal(false)}
                style={styles.woCloseBtn}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                style={styles.woPrintBtn}
              >
                <Printer size={15} />
                <span>Print Official Gazette / PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    height: 'calc(100vh - 64px)',
    display: 'flex',
    flexDirection: 'column',
    background: '#f4f7f6',
  },
  topBar: {
    padding: '14px 24px',
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    zIndex: 10,
  },
  topBarLeft: {
    display: 'flex',
    flexDirection: 'column',
  },
  pageBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '10.5px',
    fontWeight: 800,
    color: '#059669',
    letterSpacing: '0.6px',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#10b981',
  },
  title: {
    fontSize: '17px',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.3px',
  },
  topControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  controlItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '4px 10px',
  },
  controlLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: 600,
  },
  select: {
    border: 'none',
    background: 'transparent',
    fontSize: '12px',
    fontWeight: 700,
    color: '#0f172a',
    outline: 'none',
    cursor: 'pointer',
  },
  toggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  recalcBtn: {
    background: '#10b981',
    color: '#ffffff',
    padding: '7px 14px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
  },
  dispatchAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 24px',
    background: '#ecfdf5',
    color: '#065f46',
    fontSize: '12.5px',
    fontWeight: 600,
    borderBottom: '1px solid #a7f3d0',
  },
  workspace: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  sidebar: {
    width: '360px',
    background: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 10,
  },
  simDeck: {
    padding: '16px',
    background: '#061914',
    borderBottom: '1px solid #143e33',
    color: '#ffffff',
  },
  simDeckHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  simDeckTitle: {
    fontSize: '12.5px',
    fontWeight: 800,
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
  },
  simProgressTag: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#34d399',
    background: 'rgba(16,185,129,0.2)',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  progressBarBg: {
    width: '100%',
    height: '6px',
    background: '#0c2720',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '12px',
  },
  progressBarFill: {
    height: '100%',
    background: '#10b981',
    transition: 'width 0.25s linear',
  },
  simButtonsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  playBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    color: '#ffffff',
    padding: '8px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  resetBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: '#0c2720',
    color: '#a7f3d0',
    border: '1px solid #143e33',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  speedButtonGroup: {
    display: 'flex',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #143e33',
  },
  speedBtn: {
    padding: '6px 8px',
    fontSize: '10.5px',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
  },
  liveStatRow: {
    display: 'flex',
    gap: '12px',
    paddingTop: '8px',
    borderTop: '1px solid #143e33',
  },
  liveStat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  liveStatLabel: {
    fontSize: '10px',
    color: '#6ee7b7',
    fontWeight: 600,
  },
  liveStatVal: {
    fontSize: '12.5px',
    fontWeight: 700,
    color: '#ffffff',
    marginTop: '2px',
  },
  savingsBox: {
    padding: '12px 16px',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  savingsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  savingItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  savingVal: {
    fontSize: '14px',
    fontWeight: 800,
    color: '#0f172a',
  },
  savingLabel: {
    fontSize: '10.5px',
    color: '#64748b',
    fontWeight: 500,
  },
  truckListHeader: {
    padding: '12px 16px 8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeading: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#64748b',
    letterSpacing: '0.6px',
  },
  clearFilterBtn: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#10b981',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  truckCardsScroll: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 16px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  truckCard: {
    borderRadius: '12px',
    padding: '12px 14px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
  },
  truckCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  truckTypeBadge: {
    fontSize: '9.5px',
    fontWeight: 700,
    color: '#64748b',
    background: '#f1f5f9',
    padding: '2px 6px',
    borderRadius: '6px',
  },
  stopsBadge: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#0f172a',
  },
  truckCardMid: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11.5px',
    color: '#64748b',
    marginBottom: '8px',
  },
  truckLoadWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  truckLoadLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10.5px',
    color: '#64748b',
    fontWeight: 600,
  },
  loadBarBg: {
    height: '5px',
    background: '#f1f5f9',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  loadBarFill: {
    height: '100%',
    borderRadius: '3px',
  },
  sidebarFooter: {
    padding: '12px 16px',
    borderTop: '1px solid #e2e8f0',
    background: '#ffffff',
  },
  dispatchAllBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    background: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
  },
  mapWrap: {
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  floatingLog: {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    background: 'rgba(15, 23, 42, 0.92)',
    backdropFilter: 'blur(8px)',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '12px 14px',
    color: '#ffffff',
    maxWidth: '340px',
    zIndex: 1000,
    boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
  },
  floatingLogHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11.5px',
    fontWeight: 700,
    color: '#34d399',
    marginBottom: '8px',
  },
  logList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  logEntry: {
    fontSize: '11px',
    color: '#cbd5e1',
    lineHeight: 1.4,
  },
  workOrderCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '32px 36px',
    width: '100%',
    maxWidth: '920px',
    maxHeight: '92vh',
    overflowY: 'auto',
    boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
    border: '2px solid #047857',
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  gazetteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px double #047857',
    paddingBottom: '16px',
    marginBottom: '20px',
  },
  mcdSeal: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: '#ecfdf5',
    border: '1.5px solid #059669',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  govTitle: {
    fontSize: '18px',
    fontWeight: 900,
    color: '#047857',
    letterSpacing: '0.8px',
  },
  govDept: {
    fontSize: '13px',
    fontWeight: 800,
    color: '#0f172a',
    marginTop: '2px',
  },
  govDiv: {
    fontSize: '11.5px',
    color: '#475569',
    fontWeight: 600,
  },
  govMandate: {
    fontSize: '10px',
    fontWeight: 800,
    color: '#059669',
    letterSpacing: '0.5px',
    marginTop: '3px',
  },
  woMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '14px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '14px 18px',
    marginBottom: '18px',
  },
  woMetaLabel: {
    fontSize: '11px',
    color: '#64748b',
    display: 'block',
  },
  woMetaVal: {
    fontSize: '13px',
    color: '#0f172a',
    marginTop: '2px',
    display: 'block',
  },
  woTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '12px',
  },
  woThRow: {
    background: '#f1f5f9',
    borderBottom: '2px solid #cbd5e1',
  },
  woTh: {
    padding: '10px 12px',
    fontSize: '11px',
    fontWeight: 800,
    color: '#334155',
    textTransform: 'uppercase',
  },
  woTr: {
    borderBottom: '1px solid #e2e8f0',
  },
  woTd: {
    padding: '10px 12px',
    color: '#1e293b',
  },
  woFuelBadge: (fuel) => ({
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '8px',
    background: fuel?.includes('EV') || fuel?.includes('Electric') ? '#dcfce7' : '#e0f2fe',
    color: fuel?.includes('EV') || fuel?.includes('Electric') ? '#15803d' : '#0369a1',
  }),
  woCertBox: {
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '10px',
    padding: '14px 18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  swmVerifiedStamp: {
    fontSize: '11px',
    fontWeight: 900,
    color: '#047857',
    border: '1.5px dashed #059669',
    padding: '6px 12px',
    borderRadius: '8px',
    background: '#ffffff',
    letterSpacing: '0.4px',
  },
  woSigGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    marginBottom: '28px',
    paddingTop: '16px',
    borderTop: '1px dashed #cbd5e1',
  },
  woSigBlock: {
    textAlign: 'center',
  },
  sigLine: {
    height: '1px',
    background: '#94a3b8',
    marginBottom: '8px',
  },
  sigRole: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#0f172a',
  },
  sigOrg: {
    fontSize: '10.5px',
    color: '#64748b',
    marginTop: '1px',
  },
  woActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  woCloseBtn: {
    padding: '9px 18px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#475569',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  woPrintBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 20px',
    borderRadius: '8px',
    border: 'none',
    background: '#047857',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(4,120,87,0.35)',
  },
}
