import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : '/api',
  timeout: 20000,
})

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
    if (error.response?.status === 401) {
      // Clear stored session and redirect to login
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

// ──────────────────────────────────────────────
// Auth API
// ──────────────────────────────────────────────
export const loginUser = ({ email, password }) =>
  api.post('/auth/login', { email, password }).then(r => {
    if (r.data.access_token) {
      localStorage.setItem('ecofleet_token', r.data.access_token)
      localStorage.setItem('ecofleet_user', JSON.stringify(r.data.user))
    }
    return r.data
  })

export const registerUser = (userData) =>
  api.post('/auth/register', userData).then(r => r.data)

export const getCurrentUser = () =>
  api.get('/auth/me').then(r => r.data)

export const logoutUser = () => {
  localStorage.removeItem('ecofleet_token')
  localStorage.removeItem('ecofleet_user')
}

// ──────────────────────────────────────────────
// Nodes API
// ──────────────────────────────────────────────
export const fetchNodes = (zone = null) =>
  api.get('/nodes/', { params: zone ? { zone } : {} }).then(r => r.data)

export const fetchNode = (nodeId) =>
  api.get(`/nodes/${nodeId}`).then(r => r.data)

export const createNode = (nodeData) =>
  api.post('/nodes/', nodeData).then(r => r.data)

export const updateNode = (nodeId, nodeData) =>
  api.put(`/nodes/${nodeId}`, nodeData).then(r => r.data)

export const deleteNode = (nodeId) =>
  api.delete(`/nodes/${nodeId}`).then(r => r.data)

export const collectBin = (nodeId, collectedKg = null, notes = '') =>
  api.post(`/nodes/${nodeId}/collect`, { collected_kg: collectedKg, notes }).then(r => r.data)

export const reportBinIssue = (nodeId, reportData) =>
  api.post(`/nodes/${nodeId}/report`, reportData).then(r => r.data)

// ──────────────────────────────────────────────
// Forecast API
// ──────────────────────────────────────────────
export const fetchDailyForecast = ({ date, zone, weatherCode = 0, isFestival = false }) =>
  api.get('/forecast/daily', {
    params: {
      forecast_date: date,
      zone: zone || undefined,
      weather_code: weatherCode,
      is_festival: isFestival,
    },
  }).then(r => r.data)

// ──────────────────────────────────────────────
// Routing API
// ──────────────────────────────────────────────
export const optimizeRoutes = ({ date, zone, numTrucks = 5, truckCapacity = 5000, skipLowRisk = true }) =>
  api.post('/routing/optimize', {
    forecast_date: date,
    zone: zone || null,
    num_trucks: numTrucks,
    truck_capacity_kg: truckCapacity,
    skip_low_risk: skipLowRisk,
  }).then(r => r.data)

export const dispatchRoutes = ({ date, zone, routes, notes = '' }) =>
  api.post('/routing/dispatch', {
    routing_date: date,
    zone: zone || null,
    routes,
    notes,
  }).then(r => r.data)

export const fetchRouteHistory = () =>
  api.get('/routing/history').then(r => r.data)

export const updateStopStatus = ({ truckId, stopIndex, status = 'completed', collectedKg = null }) =>
  api.post('/routing/stop/status', {
    truck_id: truckId,
    stop_index: stopIndex,
    status,
    collected_kg: collectedKg,
  }).then(r => r.data)

// ──────────────────────────────────────────────
// Fleet API
// ──────────────────────────────────────────────
export const fetchFleet = () =>
  api.get('/fleet/').then(r => r.data)

export const createTruck = (truckData) =>
  api.post('/fleet/', truckData).then(r => r.data)

export const updateTruck = (truckId, updateData) =>
  api.patch(`/fleet/${truckId}`, updateData).then(r => r.data)

export const deleteTruck = (truckId) =>
  api.delete(`/fleet/${truckId}`).then(r => r.data)

// ──────────────────────────────────────────────
// Analytics API
// ──────────────────────────────────────────────
export const fetchAnalyticsSummary = () =>
  api.get('/analytics/summary').then(r => r.data)

export default api
