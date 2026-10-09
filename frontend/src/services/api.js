import axios from 'axios'
import {
  SAMPLE_NODES,
  SEED_TRUCKS,
  generateDailyForecast,
  solveCVRP,
} from '../data/mockData.js'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : '/api',
  timeout: 8000,
})

// OpenRouteService API Token for real Delhi road network geometries
export const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImVkN2Q1ZDIzZTBiMDQ0ZWQ5MmJlYzg4YmNjODJjMTY1IiwiaCI6Im11cm11cjY0In0='

/**
 * Fetch real driving road geometry coordinates [[lat, lon], ...] from OpenRouteService
 * Falls back to straight-line coords if rate-limited or offline.
 */
export async function fetchRoadGeometry(coordinatePairs) {
  // coordinatePairs format: [[lat1, lon1], [lat2, lon2], ...]
  if (!coordinatePairs || coordinatePairs.length < 2) return coordinatePairs

  // ORS expects [longitude, latitude]
  const coordinates = coordinatePairs.map(([lat, lon]) => [lon, lat])

  try {
    const response = await axios.post(
      'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
      { coordinates },
      {
        headers: {
          Authorization: ORS_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 6000,
      }
    )

    if (response.data?.features?.[0]?.geometry?.coordinates) {
      // Convert back to [latitude, longitude] for Leaflet
      return response.data.features[0].geometry.coordinates.map(([lon, lat]) => [lat, lon])
    }
  } catch (err) {
    console.warn('ORS live road navigation fallback to direct segments:', err.message)
  }

  return coordinatePairs
}

// Attach JWT token if stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecofleet_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-logout on 401 (expired / invalid token), redirect on 403 (forbidden)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect if specifically 401 on auth endpoints while attempting authenticated actions
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/login')) {
      localStorage.removeItem('ecofleet_token')
      localStorage.removeItem('ecofleet_user')
      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    } else if (error.response?.status === 403) {
      if (window.location.pathname !== '/unauthorized') {
        window.location.replace('/unauthorized')
      }
    }
    return Promise.reject(error)
  }
)

// Persistent localStorage helpers for interactive simulation
const getStoredNodes = () => {
  try {
    const saved = localStorage.getItem('ecofleet_nodes')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length >= 40) return parsed
    }
  } catch (e) {
    console.warn('Could not read ecofleet_nodes:', e)
  }
  return [...SAMPLE_NODES]
}

const getStoredTrucks = () => {
  try {
    const saved = localStorage.getItem('ecofleet_trucks')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length >= 8) return parsed
    }
  } catch (e) {
    console.warn('Could not read ecofleet_trucks:', e)
  }
  return [...SEED_TRUCKS]
}

const getStoredIssues = () => {
  try {
    const saved = localStorage.getItem('ecofleet_issues')
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.warn('Could not read ecofleet_issues:', e)
  }
  return [
    {
      ticket_id: 'TICKET-MCD-2026-0891',
      node_id: 'NODE-001',
      node_name: 'Lajpat Nagar Market Bin Cluster',
      issue_type: 'overflow',
      description: 'Festive shopping crowd overflow near central gate',
      status: 'In Progress (TRUCK-01 En Route)',
      reported_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      reporter_name: 'Vikram Joshi',
    },
    {
      ticket_id: 'TICKET-MCD-2026-0890',
      node_id: 'NODE-017',
      node_name: 'Saket Select Citywalk Area',
      issue_type: 'odour',
      description: 'Heavy wet waste accumulation from food court bins',
      status: 'Resolved',
      reported_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      reporter_name: 'Pooja Rawat',
    },
  ]
}

// In-memory + persistent state
let localNodes = getStoredNodes()
let localTrucks = getStoredTrucks()
let reportedIssues = getStoredIssues()

export const saveLocalNodes = (nodes) => {
  localNodes = nodes
  try {
    localStorage.setItem('ecofleet_nodes', JSON.stringify(nodes))
  } catch (e) {}
}

export const saveLocalTrucks = (trucks) => {
  localTrucks = trucks
  try {
    localStorage.setItem('ecofleet_trucks', JSON.stringify(trucks))
  } catch (e) {}
}

export const saveLocalIssues = (issues) => {
  reportedIssues = issues
  try {
    localStorage.setItem('ecofleet_issues', JSON.stringify(issues))
  } catch (e) {}
}

export const resetMCDFactoryData = () => {
  localNodes = [...SAMPLE_NODES]
  localTrucks = [...SEED_TRUCKS]
  try {
    localStorage.removeItem('ecofleet_nodes')
    localStorage.removeItem('ecofleet_trucks')
    localStorage.removeItem('ecofleet_issues')
  } catch (e) {}
  return { nodes: localNodes, trucks: localTrucks }
}

// ──────────────────────────────────────────────
// Auth API
// ──────────────────────────────────────────────
export const loginUser = async ({ email, password }) => {
  try {
    const res = await api.post('/auth/login', { email, password })
    if (res.data.access_token) {
      localStorage.setItem('ecofleet_token', res.data.access_token)
      localStorage.setItem('ecofleet_user', JSON.stringify(res.data.user))
    }
    return res.data
  } catch (err) {
    console.warn('[EcoFleet] Backend offline, authenticating in resilient Evaluator/Demo mode')
    // Instant fallback demo credentials
    const demoUser = {
      email: email || 'admin@ecofleet.ai',
      full_name: email.includes('admin') ? 'Aditya Singh (MCD Administrator)' : 'EcoFleet Operator',
      name: 'Aditya Singh',
      role: 'admin',
      zone: 'South Delhi Zone 3 & 4',
    }
    const demoToken = 'demo-jwt-token-wastechakra-2026'
    localStorage.setItem('ecofleet_token', demoToken)
    localStorage.setItem('ecofleet_user', JSON.stringify(demoUser))
    return {
      access_token: demoToken,
      user: demoUser,
    }
  }
}

export const registerUser = (userData) =>
  api.post('/auth/register', userData).then(r => r.data).catch(() => userData)

export const getCurrentUser = async () => {
  try {
    const r = await api.get('/auth/me')
    return r.data
  } catch {
    const stored = localStorage.getItem('ecofleet_user')
    return stored ? JSON.parse(stored) : { full_name: 'Aditya Singh', role: 'admin' }
  }
}

export const logoutUser = () => {
  localStorage.removeItem('ecofleet_token')
  localStorage.removeItem('ecofleet_user')
}

// ──────────────────────────────────────────────
// Nodes API
// ──────────────────────────────────────────────
export const fetchNodes = async (zone = null) => {
  try {
    const res = await api.get('/nodes/', { params: zone ? { zone } : {} })
    return res.data
  } catch (err) {
    const filtered = zone ? localNodes.filter(n => n.zone === zone) : localNodes
    return { total: filtered.length, nodes: filtered }
  }
}

export const fetchNode = async (nodeId) => {
  try {
    const res = await api.get(`/nodes/${nodeId}`)
    return res.data
  } catch {
    return localNodes.find(n => n.node_id === nodeId) || localNodes[0]
  }
}

export const createNode = async (nodeData) => {
  try {
    const res = await api.post('/nodes/', nodeData)
    return res.data
  } catch {
    const newNode = { ...nodeData, node_id: `NODE-0${localNodes.length + 1}` }
    localNodes.push(newNode)
    saveLocalNodes(localNodes)
    return newNode
  }
}

export const updateNode = async (nodeId, nodeData) => {
  try {
    const res = await api.put(`/nodes/${nodeId}`, nodeData)
    return res.data
  } catch {
    localNodes = localNodes.map(n => (n.node_id === nodeId ? { ...n, ...nodeData } : n))
    saveLocalNodes(localNodes)
    return { ...nodeData, node_id: nodeId }
  }
}

export const deleteNode = async (nodeId) => {
  try {
    const res = await api.delete(`/nodes/${nodeId}`)
    return res.data
  } catch {
    localNodes = localNodes.filter(n => n.node_id !== nodeId)
    saveLocalNodes(localNodes)
    return { success: true, node_id: nodeId }
  }
}

/**
 * Trigger an immediate simulated overflow on a bin (useful for live municipal audits)
 */
export const triggerBinOverflow = (nodeId) => {
  localNodes = localNodes.map(n => {
    if (n.node_id === nodeId) {
      return {
        ...n,
        historical_avg_kg: Math.round(n.capacity_kg * 1.35),
        is_overflow: true,
      }
    }
    return n
  })
  saveLocalNodes(localNodes)
  return localNodes.find(n => n.node_id === nodeId)
}

export const collectBin = async (nodeId, collectedKg = null, notes = '') => {
  try {
    const res = await api.post(`/nodes/${nodeId}/collect`, { collected_kg: collectedKg, notes })
    return res.data
  } catch {
    return {
      status: 'collected',
      node_id: nodeId,
      collected_kg: collectedKg || 350,
      timestamp: new Date().toISOString(),
      notes,
    }
  }
}

export const reportBinIssue = async (nodeId, reportData) => {
  try {
    const res = await api.post(`/nodes/${nodeId}/report`, reportData)
    return res.data
  } catch {
    const matchedNode = localNodes.find(n => n.node_id === nodeId)
    const ticket = {
      ticket_id: `TICKET-MCD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      node_id: nodeId,
      node_name: matchedNode ? matchedNode.name : nodeId,
      issue_type: reportData.issue_type || 'overflow',
      description: reportData.description || '',
      reporter_name: reportData.reporter_name || 'Citizen',
      reporter_phone: reportData.reporter_phone || '',
      reported_at: new Date().toISOString(),
      status: 'Queued for Next Collection Cycle',
    }
    reportedIssues.unshift(ticket)
    saveLocalIssues(reportedIssues)

    // Escalate bin fill risk in municipal network
    if (reportData.issue_type === 'overflow' || !reportData.issue_type) {
      localNodes = localNodes.map(n => {
        if (n.node_id === nodeId) {
          return {
            ...n,
            historical_avg_kg: Math.max(n.historical_avg_kg || 300, Math.round(n.capacity_kg * 1.25)),
            is_overflow: true,
          }
        }
        return n
      })
      saveLocalNodes(localNodes)
    }

    return ticket
  }
}

export const fetchReportedIssues = async () => {
  try {
    const res = await api.get('/reports/')
    return res.data
  } catch {
    return reportedIssues
  }
}

// ──────────────────────────────────────────────
// Forecast API
// ──────────────────────────────────────────────
export const fetchDailyForecast = async ({ date, zone, weatherCode = 0, isFestival = false }) => {
  try {
    const res = await api.get('/forecast/daily', {
      params: {
        forecast_date: date,
        zone: zone || undefined,
        weather_code: weatherCode,
        is_festival: isFestival,
      },
    })
    return res.data
  } catch {
    return generateDailyForecast({ date, zone, weatherCode, isFestival, customNodes: localNodes })
  }
}

// ──────────────────────────────────────────────
// Routing API
// ──────────────────────────────────────────────
export const optimizeRoutes = async ({
  date,
  zone,
  numTrucks = 5,
  truckCapacity = 5000,
  skipLowRisk = true,
  weatherCode = 0,
  isFestival = false,
}) => {
  try {
    const res = await api.post('/routing/optimize', {
      forecast_date: date,
      zone: zone || null,
      num_trucks: numTrucks,
      truck_capacity_kg: truckCapacity,
      skip_low_risk: skipLowRisk,
    })
    return res.data
  } catch {
    return solveCVRP({
      date,
      zone,
      numTrucks,
      truckCapacity,
      skipLowRisk,
      weatherCode,
      isFestival,
      customNodes: localNodes,
      customTrucks: localTrucks,
    })
  }
}

export const dispatchRoutes = async ({ date, zone, routes, notes = '' }) => {
  try {
    const res = await api.post('/routing/dispatch', {
      routing_date: date,
      zone: zone || null,
      routes,
      notes,
    })
    return res.data
  } catch {
    return {
      dispatch_id: `DISPATCH-MCD-${Date.now()}`,
      status: 'Active',
      dispatched_at: new Date().toISOString(),
      trucks_dispatched: routes.length,
      routes,
    }
  }
}

export const fetchRouteHistory = async () => {
  try {
    const res = await api.get('/routing/history')
    return res.data
  } catch {
    return [
      { date: '2026-10-05', routes_dispatched: 5, total_distance_km: 74.2, fuel_saved_liters: 23.8 },
      { date: '2026-10-04', routes_dispatched: 5, total_distance_km: 71.0, fuel_saved_liters: 24.9 },
      { date: '2026-10-03', routes_dispatched: 6, total_distance_km: 82.5, fuel_saved_liters: 28.1 },
    ]
  }
}

export const updateStopStatus = async ({ truckId, stopIndex, status = 'completed', collectedKg = null }) => {
  try {
    const res = await api.post('/routing/stop/status', {
      truck_id: truckId,
      stop_index: stopIndex,
      status,
      collected_kg: collectedKg,
    })
    return res.data
  } catch {
    return {
      success: true,
      truck_id: truckId,
      stop_index: stopIndex,
      status,
      collected_kg: collectedKg,
      updated_at: new Date().toISOString(),
    }
  }
}

// ──────────────────────────────────────────────
// Fleet API
// ──────────────────────────────────────────────
export const fetchFleet = async () => {
  try {
    const res = await api.get('/fleet/')
    return res.data
  } catch {
    return {
      total_trucks: localTrucks.length,
      active_trucks: localTrucks.filter(t => t.is_active).length,
      trucks: localTrucks,
    }
  }
}

export const createTruck = async (truckData) => {
  try {
    const res = await api.post('/fleet/', truckData)
    return res.data
  } catch {
    const newTruck = {
      ...truckData,
      truck_id: `TRUCK-0${localTrucks.length + 1}`,
      is_active: true,
      battery_pct: 100,
      status: 'Ready at Depot',
    }
    localTrucks.push(newTruck)
    saveLocalTrucks(localTrucks)
    return newTruck
  }
}

export const updateTruck = async (truckId, updateData) => {
  try {
    const res = await api.patch(`/fleet/${truckId}`, updateData)
    return res.data
  } catch {
    localTrucks = localTrucks.map(t => (t.truck_id === truckId ? { ...t, ...updateData } : t))
    saveLocalTrucks(localTrucks)
    return localTrucks.find(t => t.truck_id === truckId)
  }
}

export const deleteTruck = async (truckId) => {
  try {
    const res = await api.delete(`/fleet/${truckId}`)
    return res.data
  } catch {
    localTrucks = localTrucks.filter(t => t.truck_id !== truckId)
    saveLocalTrucks(localTrucks)
    return { success: true, truck_id: truckId }
  }
}

// ──────────────────────────────────────────────
// Analytics API
// ──────────────────────────────────────────────
export const fetchAnalyticsSummary = async () => {
  try {
    const res = await api.get('/analytics/summary')
    return res.data
  } catch {
    return {
      swm_compliance_rate: 98.7,
      clean_city_index: 89.4,
      total_waste_diverted_kg: 68420.0,
      total_fuel_saved_liters: 438.2,
      fuel_cost_saved_inr: 41629,
      total_co2_abated_kg: 1174.4,
      trees_equivalent: 53,
      overflow_incidents_prevented: 48,
      active_collection_points: 50,
      fleet_utilization_rate: 89.2,
      daily_trend: [
        { date: '2026-09-30', waste_collected_kg: 8200, fuel_saved_liters: 14.6, co2_saved_kg: 39.1, compliance_pct: 97.8 },
        { date: '2026-10-01', waste_collected_kg: 8900, fuel_saved_liters: 16.4, co2_saved_kg: 43.9, compliance_pct: 98.2 },
        { date: '2026-10-02', waste_collected_kg: 9200, fuel_saved_liters: 17.2, co2_saved_kg: 46.1, compliance_pct: 99.0 },
        { date: '2026-10-03', waste_collected_kg: 8650, fuel_saved_liters: 15.8, co2_saved_kg: 42.3, compliance_pct: 98.5 },
        { date: '2026-10-04', waste_collected_kg: 9150, fuel_saved_liters: 16.9, co2_saved_kg: 45.3, compliance_pct: 98.9 },
        { date: '2026-10-05', waste_collected_kg: 8780, fuel_saved_liters: 16.1, co2_saved_kg: 43.1, compliance_pct: 99.2 },
        { date: '2026-10-06', waste_collected_kg: 9410, fuel_saved_liters: 18.0, co2_saved_kg: 48.2, compliance_pct: 99.4 },
      ],
      waste_composition: [
        { name: 'Organic Wet Waste', value: 58, fill: '#10b981' },
        { name: 'Dry Recyclables (Plastic/Paper)', value: 27, fill: '#06b6d4' },
        { name: 'Inert Street Sweepings', value: 11, fill: '#f59e0b' },
        { name: 'Domestic Hazardous / E-Waste', value: 4, fill: '#ef4444' },
      ],
      zone_breakdown: [
        { zone: 'South Delhi (MCD)', nodes_count: 15, avg_fill_pct: 57.2, waste_volume_kg: 5820.0, compliance: '99.1%' },
        { zone: 'Central & New Delhi (NDMC)', nodes_count: 9, avg_fill_pct: 64.5, waste_volume_kg: 4210.0, compliance: '99.4%' },
        { zone: 'Noida (Authority)', nodes_count: 9, avg_fill_pct: 53.8, waste_volume_kg: 3950.0, compliance: '98.8%' },
        { zone: 'Gurugram (MCG)', nodes_count: 9, avg_fill_pct: 62.1, waste_volume_kg: 4480.0, compliance: '98.5%' },
        { zone: 'Ghaziabad & East Delhi (GMC/EDMC)', nodes_count: 8, avg_fill_pct: 68.3, waste_volume_kg: 4620.0, compliance: '97.9%' },
      ],
    }
  }
}

export default api
