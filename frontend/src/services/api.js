import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// ──────────────────────────────────────────────
// Nodes
// ──────────────────────────────────────────────
export const fetchNodes = (zone = null) =>
  api.get('/nodes/', { params: zone ? { zone } : {} }).then(r => r.data)

// ──────────────────────────────────────────────
// Forecast
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
// Routing
// ──────────────────────────────────────────────
export const optimizeRoutes = ({ date, zone, numTrucks = 5, truckCapacity = 5000, skipLowRisk = true }) =>
  api.post('/routing/optimize', {
    forecast_date: date,
    zone: zone || null,
    num_trucks: numTrucks,
    truck_capacity_kg: truckCapacity,
    skip_low_risk: skipLowRisk,
  }).then(r => r.data)

// ──────────────────────────────────────────────
// Fleet
// ──────────────────────────────────────────────
export const fetchFleet = () =>
  api.get('/fleet/').then(r => r.data)
