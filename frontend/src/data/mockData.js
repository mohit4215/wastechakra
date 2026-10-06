/**
 * EcoFleet AI — Municipal Corporation of Delhi (MCD) Benchmark Data & Client-Side CVRP Engine
 * Covers South Delhi Zone 3 & Zone 4 (25 nodes, 5 trucks, Depot at Okhla)
 */

export const DEPOT = {
  id: 'DEPOT-OKHLA',
  name: 'MCD Central Depot & Transfer Station',
  address: 'Okhla Industrial Area Phase 1, New Delhi',
  latitude: 28.5355,
  longitude: 77.2510,
  capacity_kg: 50000,
  is_depot: true,
}

export const SAMPLE_NODES = [
  // ── Zone 3 ──────────────────────────────────────────────────────────────
  {
    node_id: "NODE-001",
    name: "Lajpat Nagar Market Bin Cluster",
    zone: "South Delhi Zone 3",
    latitude: 28.5677,
    longitude: 77.2433,
    capacity_kg: 800,
    waste_types: ["wet", "dry"],
    population_density: 38000,
    address: "Central Market, Lajpat Nagar II",
    historical_avg_kg: 620,
  },
  {
    node_id: "NODE-002",
    name: "Sarojini Nagar Community Bins",
    zone: "South Delhi Zone 3",
    latitude: 28.5747,
    longitude: 77.1973,
    capacity_kg: 600,
    waste_types: ["wet", "dry"],
    population_density: 32000,
    address: "Babu Market, Sarojini Nagar",
    historical_avg_kg: 480,
  },
  {
    node_id: "NODE-003",
    name: "INA Colony Street Cluster",
    zone: "South Delhi Zone 3",
    latitude: 28.5769,
    longitude: 77.2090,
    capacity_kg: 400,
    waste_types: ["wet", "dry"],
    population_density: 25000,
    address: "INA Market Outer Ring Road",
    historical_avg_kg: 290,
  },
  {
    node_id: "NODE-004",
    name: "Nehru Place Commercial Hub",
    zone: "South Delhi Zone 3",
    latitude: 28.5491,
    longitude: 77.2520,
    capacity_kg: 1200,
    waste_types: ["wet", "dry", "hazardous"],
    population_density: 45000,
    address: "Electronics Market Complex, Nehru Place",
    historical_avg_kg: 1050,
  },
  {
    node_id: "NODE-005",
    name: "Greater Kailash Block N",
    zone: "South Delhi Zone 3",
    latitude: 28.5450,
    longitude: 77.2351,
    capacity_kg: 500,
    waste_types: ["wet", "dry"],
    population_density: 20000,
    address: "N-Block Market, GK-I",
    historical_avg_kg: 340,
  },
  {
    node_id: "NODE-006",
    name: "Defence Colony Main Road",
    zone: "South Delhi Zone 3",
    latitude: 28.5713,
    longitude: 77.2353,
    capacity_kg: 600,
    waste_types: ["wet", "dry"],
    population_density: 22000,
    address: "Flyover Market, Defence Colony",
    historical_avg_kg: 390,
  },
  {
    node_id: "NODE-007",
    name: "CR Park Bengali Colony",
    zone: "South Delhi Zone 3",
    latitude: 28.5368,
    longitude: 77.2417,
    capacity_kg: 500,
    waste_types: ["wet", "dry"],
    population_density: 28000,
    address: "Market No. 1, Chittaranjan Park",
    historical_avg_kg: 410,
  },
  {
    node_id: "NODE-008",
    name: "Jangpura Extension Market",
    zone: "South Delhi Zone 3",
    latitude: 28.5820,
    longitude: 77.2490,
    capacity_kg: 450,
    waste_types: ["wet", "dry"],
    population_density: 30000,
    address: "Eros Cinema Lane, Jangpura Ext.",
    historical_avg_kg: 360,
  },
  {
    node_id: "NODE-009",
    name: "Bhogal Vegetable Market",
    zone: "South Delhi Zone 3",
    latitude: 28.5766,
    longitude: 77.2518,
    capacity_kg: 700,
    waste_types: ["wet"],
    population_density: 40000,
    address: "Subzi Mandi Road, Bhogal",
    historical_avg_kg: 590,
  },
  {
    node_id: "NODE-010",
    name: "Andrews Ganj Colony",
    zone: "South Delhi Zone 3",
    latitude: 28.5605,
    longitude: 77.2300,
    capacity_kg: 350,
    waste_types: ["wet", "dry"],
    population_density: 18000,
    address: "HUDCO Place, Andrews Ganj",
    historical_avg_kg: 210,
  },
  {
    node_id: "NODE-011",
    name: "Moolchand Market Cluster",
    zone: "South Delhi Zone 3",
    latitude: 28.5680,
    longitude: 77.2370,
    capacity_kg: 550,
    waste_types: ["wet", "dry"],
    population_density: 26000,
    address: "Underpass Complex, Moolchand",
    historical_avg_kg: 380,
  },
  {
    node_id: "NODE-012",
    name: "Sidhartha Nagar Bins",
    zone: "South Delhi Zone 3",
    latitude: 28.5800,
    longitude: 77.2100,
    capacity_kg: 400,
    waste_types: ["wet", "dry"],
    population_density: 35000,
    address: "Ring Road Cluster, Sidhartha Nagar",
    historical_avg_kg: 310,
  },
  {
    node_id: "NODE-013",
    name: "Kotla Mubarakpur Street",
    zone: "South Delhi Zone 3",
    latitude: 28.5730,
    longitude: 77.2280,
    capacity_kg: 480,
    waste_types: ["wet", "dry"],
    population_density: 33000,
    address: "Gurudwara Road, Kotla Mubarakpur",
    historical_avg_kg: 370,
  },

  // ── Zone 4 ──────────────────────────────────────────────────────────────
  {
    node_id: "NODE-014",
    name: "Malviya Nagar Main Market",
    zone: "South Delhi Zone 4",
    latitude: 28.5267,
    longitude: 77.2073,
    capacity_kg: 700,
    waste_types: ["wet", "dry"],
    population_density: 30000,
    address: "Corner Market, Malviya Nagar",
    historical_avg_kg: 540,
  },
  {
    node_id: "NODE-015",
    name: "Okhla Phase 1 Industrial Area",
    zone: "South Delhi Zone 4",
    latitude: 28.5244,
    longitude: 77.2767,
    capacity_kg: 1500,
    waste_types: ["dry", "hazardous"],
    population_density: 15000,
    address: "C-Block Industrial Zone, Okhla",
    historical_avg_kg: 1250,
  },
  {
    node_id: "NODE-016",
    name: "Hauz Khas Village Cluster",
    zone: "South Delhi Zone 4",
    latitude: 28.5494,
    longitude: 77.2001,
    capacity_kg: 450,
    waste_types: ["wet", "dry"],
    population_density: 18000,
    address: "Deer Park Entrance, Hauz Khas Village",
    historical_avg_kg: 320,
  },
  {
    node_id: "NODE-017",
    name: "Saket Select Citywalk Area",
    zone: "South Delhi Zone 4",
    latitude: 28.5255,
    longitude: 77.2173,
    capacity_kg: 900,
    waste_types: ["wet", "dry"],
    population_density: 25000,
    address: "Press Enclave Marg, Saket District Centre",
    historical_avg_kg: 790,
  },
  {
    node_id: "NODE-018",
    name: "Sheikh Sarai Phase 2",
    zone: "South Delhi Zone 4",
    latitude: 28.5327,
    longitude: 77.2080,
    capacity_kg: 400,
    waste_types: ["wet", "dry"],
    population_density: 22000,
    address: "Pocket C, Sheikh Sarai II",
    historical_avg_kg: 270,
  },
  {
    node_id: "NODE-019",
    name: "Kalkaji Main Road Bins",
    zone: "South Delhi Zone 4",
    latitude: 28.5393,
    longitude: 77.2603,
    capacity_kg: 600,
    waste_types: ["wet", "dry"],
    population_density: 36000,
    address: "Krishna Market, Kalkaji",
    historical_avg_kg: 490,
  },
  {
    node_id: "NODE-020",
    name: "Govindpuri Market Cluster",
    zone: "South Delhi Zone 4",
    latitude: 28.5273,
    longitude: 77.2560,
    capacity_kg: 550,
    waste_types: ["wet", "dry"],
    population_density: 42000,
    address: "Gali No. 7, Govindpuri",
    historical_avg_kg: 480,
  },
  {
    node_id: "NODE-021",
    name: "Sangam Vihar Block A",
    zone: "South Delhi Zone 4",
    latitude: 28.5070,
    longitude: 77.2480,
    capacity_kg: 800,
    waste_types: ["wet", "dry"],
    population_density: 48000,
    address: "Devli Road, Sangam Vihar",
    historical_avg_kg: 710,
  },
  {
    node_id: "NODE-022",
    name: "Madanpur Khadar Bins",
    zone: "South Delhi Zone 4",
    latitude: 28.5100,
    longitude: 77.2710,
    capacity_kg: 650,
    waste_types: ["wet", "dry"],
    population_density: 44000,
    address: "JJ Colony Phase 1, Madanpur Khadar",
    historical_avg_kg: 560,
  },
  {
    node_id: "NODE-023",
    name: "Jasola Apollo Hospital Area",
    zone: "South Delhi Zone 4",
    latitude: 28.5384,
    longitude: 77.2860,
    capacity_kg: 500,
    waste_types: ["wet", "dry", "hazardous"],
    population_density: 20000,
    address: "Sarita Vihar Crossing, Jasola",
    historical_avg_kg: 390,
  },
  {
    node_id: "NODE-024",
    name: "Alaknanda Market Community Bins",
    zone: "South Delhi Zone 4",
    latitude: 28.5321,
    longitude: 77.2535,
    capacity_kg: 480,
    waste_types: ["wet", "dry"],
    population_density: 27000,
    address: "Tara Apartment Market, Alaknanda",
    historical_avg_kg: 350,
  },
  {
    node_id: "NODE-025",
    name: "Pul Prehladpur Cluster",
    zone: "South Delhi Zone 4",
    latitude: 28.5200,
    longitude: 77.2815,
    capacity_kg: 700,
    waste_types: ["wet", "dry"],
    population_density: 39000,
    address: "M.B. Road, Pul Prehladpur",
    historical_avg_kg: 580,
  },
]

export const SEED_TRUCKS = [
  {
    truck_id: "TRUCK-01",
    registration_number: "DL-1C-0001",
    driver_name: "Ramesh Kumar",
    driver_phone: "+91-9811001001",
    capacity_kg: 5000,
    zone: "South Delhi Zone 3",
    is_active: true,
    fuel_type: "EV",
    battery_pct: 88,
    status: "En Route",
  },
  {
    truck_id: "TRUCK-02",
    registration_number: "DL-1C-0002",
    driver_name: "Suresh Yadav",
    driver_phone: "+91-9811001002",
    capacity_kg: 5000,
    zone: "South Delhi Zone 3",
    is_active: true,
    fuel_type: "CNG Compactor",
    battery_pct: 95,
    status: "Collecting",
  },
  {
    truck_id: "TRUCK-03",
    registration_number: "DL-1C-0003",
    driver_name: "Mohan Singh",
    driver_phone: "+91-9811001003",
    capacity_kg: 4000,
    zone: "South Delhi Zone 4",
    is_active: true,
    fuel_type: "EV",
    battery_pct: 74,
    status: "En Route",
  },
  {
    truck_id: "TRUCK-04",
    registration_number: "DL-1C-0004",
    driver_name: "Vijay Sharma",
    driver_phone: "+91-9811001004",
    capacity_kg: 5000,
    zone: "South Delhi Zone 4",
    is_active: false,
    fuel_type: "CNG Heavy",
    battery_pct: 100,
    status: "Maintenance",
  },
  {
    truck_id: "TRUCK-05",
    registration_number: "DL-1C-0005",
    driver_name: "Arun Gupta",
    driver_phone: "+91-9811001005",
    capacity_kg: 3500,
    zone: "South Delhi Zone 3",
    is_active: true,
    fuel_type: "Electric Tipper",
    battery_pct: 92,
    status: "Dispatched",
  },
  {
    truck_id: "TRUCK-06",
    registration_number: "DL-1C-0006",
    driver_name: "Karan Verma",
    driver_phone: "+91-9811001006",
    capacity_kg: 4500,
    zone: "South Delhi Zone 4",
    is_active: true,
    fuel_type: "CNG Compactor",
    battery_pct: 82,
    status: "Ready at Depot",
  },
]

export const TRUCK_COLORS = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#14b8a6', // Teal
  '#f97316', // Orange
]

/** Haversine distance in km between two lat/lon pairs */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Generate dynamic fill level prediction for a node given contextual inputs
 */
export function computeNodeForecast(node, { date, weatherCode = 0, isFestival = false }) {
  const d = date ? new Date(date) : new Date()
  const dayOfWeek = d.getDay() // 0 = Sun, 6 = Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

  // Population density multiplier (0.8 - 1.3)
  const densityFactor = 0.8 + (node.population_density / 50000) * 0.5

  // Weather multiplier: rain increases commercial/packaging trash and dampens organics
  let weatherFactor = 1.0
  if (weatherCode >= 61 && weatherCode <= 65) weatherFactor = 1.25 // Rain
  if (weatherCode === 95) weatherFactor = 1.35 // Storm

  // Weekend surge (+18% for commercial & market areas)
  const weekendFactor = isWeekend ? 1.18 : 1.0

  // Festival surge (+40%)
  const festivalFactor = isFestival ? 1.40 : 1.0

  // Calculate volume
  const predictedVolumeKg = Math.round(
    node.historical_avg_kg * densityFactor * weatherFactor * weekendFactor * festivalFactor
  )
  const clampedVolume = Math.min(predictedVolumeKg, Math.round(node.capacity_kg * 1.3))
  const fillPercentage = Math.round((clampedVolume / node.capacity_kg) * 100)

  let riskLevel = 'low'
  if (fillPercentage >= 85) riskLevel = 'critical'
  else if (fillPercentage >= 70) riskLevel = 'high'
  else if (fillPercentage >= 45) riskLevel = 'medium'

  return {
    ...node,
    predicted_volume_kg: clampedVolume,
    fill_percentage: fillPercentage,
    risk_level: riskLevel,
    is_overflow: fillPercentage >= 100,
  }
}

/**
 * Full Forecast Generator for all nodes
 */
export function generateDailyForecast({ date, zone = null, weatherCode = 0, isFestival = false }) {
  let nodes = SAMPLE_NODES
  if (zone) {
    nodes = nodes.filter(n => n.zone.toLowerCase() === zone.toLowerCase())
  }

  const forecasts = nodes.map(n => computeNodeForecast(n, { date, weatherCode, isFestival }))
  const totalVolume = forecasts.reduce((acc, f) => acc + f.predicted_volume_kg, 0)
  const highRiskCount = forecasts.filter(f => f.risk_level === 'critical' || f.risk_level === 'high').length

  return {
    forecast_date: date || new Date().toISOString().split('T')[0],
    zone: zone || 'All South Delhi Zones',
    total_predicted_volume_kg: totalVolume,
    high_risk_count: highRiskCount,
    forecasts,
  }
}

/**
 * Client-Side Capacitated Vehicle Routing Problem (CVRP) Solver (Nearest Neighbor + Capacity Constraints)
 * Mirrors OR-Tools logic so UI is 100% interactive and dynamic!
 */
export function solveCVRP({
  date,
  zone = null,
  numTrucks = 5,
  truckCapacity = 5000,
  skipLowRisk = true,
  weatherCode = 0,
  isFestival = false,
}) {
  const forecastData = generateDailyForecast({ date, zone, weatherCode, isFestival })
  let candidateNodes = [...forecastData.forecasts]

  // Filter out low-risk if toggle enabled (<45% fill)
  let skippedNodes = []
  if (skipLowRisk) {
    skippedNodes = candidateNodes.filter(n => n.risk_level === 'low')
    candidateNodes = candidateNodes.filter(n => n.risk_level !== 'low')
  }

  // Active trucks pool
  const activeTruckList = SEED_TRUCKS.filter(t => t.is_active).slice(0, numTrucks)
  const routes = []
  const unassignedNodes = [...candidateNodes]

  let totalDistanceKm = 0
  let totalCollectedKg = 0

  // For each truck, build a route from Depot -> Nodes -> Depot
  activeTruckList.forEach((truck, truckIdx) => {
    let currentLat = DEPOT.latitude
    let currentLon = DEPOT.longitude
    let remainingCapacity = truck.capacity_kg || truckCapacity
    const stops = []
    let routeDistance = 0

    while (unassignedNodes.length > 0) {
      // Find nearest unassigned node that fits capacity
      let bestIdx = -1
      let bestDist = Infinity

      for (let i = 0; i < unassignedNodes.length; i++) {
        const node = unassignedNodes[i]
        if (node.predicted_volume_kg <= remainingCapacity) {
          const dist = calculateDistanceKm(currentLat, currentLon, node.latitude, node.longitude)
          if (dist < bestDist) {
            bestDist = dist
            bestIdx = i
          }
        }
      }

      if (bestIdx === -1) break // No more nodes fit in this truck

      const selectedNode = unassignedNodes.splice(bestIdx, 1)[0]
      routeDistance += bestDist
      remainingCapacity -= selectedNode.predicted_volume_kg
      currentLat = selectedNode.latitude
      currentLon = selectedNode.longitude

      stops.push({
        stop_index: stops.length + 1,
        node_id: selectedNode.node_id,
        node_name: selectedNode.name,
        address: selectedNode.address,
        zone: selectedNode.zone,
        latitude: selectedNode.latitude,
        longitude: selectedNode.longitude,
        predicted_volume_kg: selectedNode.predicted_volume_kg,
        fill_percentage: selectedNode.fill_percentage,
        risk_level: selectedNode.risk_level,
        status: 'pending',
      })
    }

    // Return to Depot
    if (stops.length > 0) {
      const returnDist = calculateDistanceKm(currentLat, currentLon, DEPOT.latitude, DEPOT.longitude)
      routeDistance += returnDist

      const routeWeight = (truck.capacity_kg || truckCapacity) - remainingCapacity
      totalDistanceKm += routeDistance
      totalCollectedKg += routeWeight

      routes.push({
        truck_id: truck.truck_id,
        registration_number: truck.registration_number,
        driver_name: truck.driver_name,
        driver_phone: truck.driver_phone,
        fuel_type: truck.fuel_type,
        capacity_kg: truck.capacity_kg || truckCapacity,
        total_weight_kg: routeWeight,
        utilization_pct: Math.round((routeWeight / (truck.capacity_kg || truckCapacity)) * 100),
        route_distance_km: Math.round(routeDistance * 10) / 10,
        stops: stops,
        color: TRUCK_COLORS[truckIdx % TRUCK_COLORS.length],
      })
    }
  })

  // Fixed route baseline distance for Delhi is ~142 km
  const baselineDistanceKm = 142.0
  const savedKm = Math.max(0, Math.round((baselineDistanceKm - totalDistanceKm) * 10) / 10)
  // Diesel consumption: ~0.35 L per km in urban Delhi traffic
  const estimatedFuelSavedLiters = Math.round(savedKm * 0.35 * 10) / 10
  // CO2: 2.68 kg CO2 per liter of diesel
  const co2SavedKg = Math.round(estimatedFuelSavedLiters * 2.68 * 10) / 10

  return {
    forecast_date: date || new Date().toISOString().split('T')[0],
    zone: zone || 'All South Delhi Zones',
    depot: DEPOT,
    total_routes: routes.length,
    total_nodes_serviced: candidateNodes.length - unassignedNodes.length,
    total_nodes_skipped: skippedNodes.length + unassignedNodes.length,
    total_distance_km: Math.round(totalDistanceKm * 10) / 10,
    total_weight_kg: totalCollectedKg,
    estimated_fuel_saved_liters: estimatedFuelSavedLiters,
    co2_saved_kg: co2SavedKg,
    routes,
  }
}
