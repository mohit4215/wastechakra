/**
 * EcoFleet AI — National Capital Region (Delhi NCR) Benchmark Data & Client-Side CVRP Engine
 * Covers 50 Municipal Collection Points across 5 NCR Regional Zones:
 * 1. South Delhi (MCD Zone 3 & 4)
 * 2. Central & New Delhi (NDMC)
 * 3. Noida Authority (Gautam Buddha Nagar, UP)
 * 4. Gurugram (MCG, Haryana)
 * 5. Ghaziabad & East Delhi (GMC & EDMC, UP/DL)
 */

export const DEPOT = {
  id: 'DEPOT-OKHLA',
  name: 'MCD Central Integrated Solid Waste & Transfer Depot',
  address: 'Okhla Industrial Area Phase 1, New Delhi',
  latitude: 28.5355,
  longitude: 77.2510,
  capacity_kg: 100000,
  is_depot: true,
}

export const NCR_ZONES = [
  { id: 'all', label: 'All Delhi NCR (50 Nodes)', value: '', center: [28.58, 77.24], zoom: 11 },
  { id: 'south', label: 'South Delhi (MCD)', value: 'South Delhi (MCD)', center: [28.545, 77.22], zoom: 12 },
  { id: 'central', label: 'Central & New Delhi (NDMC)', value: 'Central & New Delhi (NDMC)', center: [28.64, 77.22], zoom: 13 },
  { id: 'noida', label: 'Noida Authority (UP)', value: 'Noida (Authority)', center: [28.57, 77.35], zoom: 12 },
  { id: 'gurugram', label: 'Gurugram (MCG, Haryana)', value: 'Gurugram (MCG)', center: [28.46, 77.06], zoom: 12 },
  { id: 'ghaziabad', label: 'Ghaziabad & East Delhi (GMC/EDMC)', value: 'Ghaziabad & East Delhi (GMC/EDMC)', center: [28.65, 77.35], zoom: 12 },
]

export const SAMPLE_NODES = [
  // ── Zone 1: South Delhi (MCD) — 15 Nodes ─────────────────────────────────────
  {
    node_id: "NODE-001",
    name: "Lajpat Nagar Central Market Cluster",
    zone: "South Delhi (MCD)",
    latitude: 28.5677,
    longitude: 77.2433,
    capacity_kg: 800,
    waste_types: ["wet", "dry"],
    population_density: 38000,
    address: "Central Market, Lajpat Nagar II, New Delhi",
    historical_avg_kg: 620,
  },
  {
    node_id: "NODE-002",
    name: "Sarojini Nagar Babu Market Bins",
    zone: "South Delhi (MCD)",
    latitude: 28.5747,
    longitude: 77.1973,
    capacity_kg: 600,
    waste_types: ["wet", "dry"],
    population_density: 32000,
    address: "Babu Market, Sarojini Nagar, New Delhi",
    historical_avg_kg: 480,
  },
  {
    node_id: "NODE-003",
    name: "INA Market & Dilli Haat Street Cluster",
    zone: "South Delhi (MCD)",
    latitude: 28.5769,
    longitude: 77.2090,
    capacity_kg: 400,
    waste_types: ["wet", "dry"],
    population_density: 25000,
    address: "INA Market Outer Ring Road, New Delhi",
    historical_avg_kg: 290,
  },
  {
    node_id: "NODE-004",
    name: "Nehru Place Commercial Hub",
    zone: "South Delhi (MCD)",
    latitude: 28.5491,
    longitude: 77.2520,
    capacity_kg: 1200,
    waste_types: ["wet", "dry", "hazardous"],
    population_density: 45000,
    address: "Electronics Market Complex, Nehru Place, New Delhi",
    historical_avg_kg: 1050,
  },
  {
    node_id: "NODE-005",
    name: "Greater Kailash N-Block Market",
    zone: "South Delhi (MCD)",
    latitude: 28.5450,
    longitude: 77.2351,
    capacity_kg: 500,
    waste_types: ["wet", "dry"],
    population_density: 20000,
    address: "N-Block Market, GK-I, New Delhi",
    historical_avg_kg: 340,
  },
  {
    node_id: "NODE-006",
    name: "Defence Colony Flyover Market",
    zone: "South Delhi (MCD)",
    latitude: 28.5713,
    longitude: 77.2353,
    capacity_kg: 600,
    waste_types: ["wet", "dry"],
    population_density: 22000,
    address: "Flyover Market, Defence Colony, New Delhi",
    historical_avg_kg: 390,
  },
  {
    node_id: "NODE-007",
    name: "CR Park Market No. 1 Bins",
    zone: "South Delhi (MCD)",
    latitude: 28.5368,
    longitude: 77.2417,
    capacity_kg: 500,
    waste_types: ["wet", "dry"],
    population_density: 28000,
    address: "Market No. 1, Chittaranjan Park, New Delhi",
    historical_avg_kg: 410,
  },
  {
    node_id: "NODE-008",
    name: "Kalkaji Main Commercial Road",
    zone: "South Delhi (MCD)",
    latitude: 28.5392,
    longitude: 77.2588,
    capacity_kg: 700,
    waste_types: ["wet", "dry"],
    population_density: 35000,
    address: "Main Road Rampuri, Kalkaji, New Delhi",
    historical_avg_kg: 540,
  },
  {
    node_id: "NODE-009",
    name: "Hauz Khas Village Entry Cluster",
    zone: "South Delhi (MCD)",
    latitude: 28.5535,
    longitude: 77.1945,
    capacity_kg: 550,
    waste_types: ["wet", "dry"],
    population_density: 29000,
    address: "Deer Park Gate, Hauz Khas Village, New Delhi",
    historical_avg_kg: 420,
  },
  {
    node_id: "NODE-010",
    name: "Green Park Extension Market",
    zone: "South Delhi (MCD)",
    latitude: 28.5589,
    longitude: 77.2038,
    capacity_kg: 450,
    waste_types: ["wet", "dry"],
    population_density: 24000,
    address: "Main Market, Green Park, New Delhi",
    historical_avg_kg: 320,
  },
  {
    node_id: "NODE-011",
    name: "Saket Community Centre Bins",
    zone: "South Delhi (MCD)",
    latitude: 28.5245,
    longitude: 77.2140,
    capacity_kg: 1000,
    waste_types: ["wet", "dry", "hazardous"],
    population_density: 40000,
    address: "PVR Anupam Complex, Saket, New Delhi",
    historical_avg_kg: 850,
  },
  {
    node_id: "NODE-012",
    name: "Malviya Nagar Shivalik Road",
    zone: "South Delhi (MCD)",
    latitude: 28.5350,
    longitude: 77.2085,
    capacity_kg: 600,
    waste_types: ["wet", "dry"],
    population_density: 33000,
    address: "Corner Market, Malviya Nagar, New Delhi",
    historical_avg_kg: 470,
  },
  {
    node_id: "NODE-013",
    name: "Vasant Kunj Nelson Mandela Marg",
    zone: "South Delhi (MCD)",
    latitude: 28.5298,
    longitude: 77.1511,
    capacity_kg: 850,
    waste_types: ["wet", "dry"],
    population_density: 26000,
    address: "Ambience Mall Perimeter, Vasant Kunj, New Delhi",
    historical_avg_kg: 680,
  },
  {
    node_id: "NODE-014",
    name: "Okhla Phase III Tehkhand Bins",
    zone: "South Delhi (MCD)",
    latitude: 28.5355,
    longitude: 77.2690,
    capacity_kg: 1100,
    waste_types: ["dry", "hazardous"],
    population_density: 46000,
    address: "Modi Mill Compound, Okhla Phase III, New Delhi",
    historical_avg_kg: 920,
  },
  {
    node_id: "NODE-015",
    name: "Govindpuri Gali No. 7 Bins",
    zone: "South Delhi (MCD)",
    latitude: 28.5273,
    longitude: 77.2560,
    capacity_kg: 550,
    waste_types: ["wet", "dry"],
    population_density: 42000,
    address: "Gali No. 7, Govindpuri, New Delhi",
    historical_avg_kg: 480,
  },

  // ── Zone 2: Central & New Delhi (NDMC) — 9 Nodes ─────────────────────────────
  {
    node_id: "NODE-016",
    name: "Connaught Place Inner Circle Plaza",
    zone: "Central & New Delhi (NDMC)",
    latitude: 28.6315,
    longitude: 77.2167,
    capacity_kg: 1200,
    waste_types: ["wet", "dry", "hazardous"],
    population_density: 52000,
    address: "Block B Inner Circle, Connaught Place, New Delhi",
    historical_avg_kg: 1100,
  },
  {
    node_id: "NODE-017",
    name: "Chandni Chowk Town Hall Cluster",
    zone: "Central & New Delhi (NDMC)",
    latitude: 28.6562,
    longitude: 77.2300,
    capacity_kg: 1400,
    waste_types: ["wet", "dry"],
    population_density: 65000,
    address: "Town Hall Promenade, Old Delhi",
    historical_avg_kg: 1280,
  },
  {
    node_id: "NODE-018",
    name: "Karol Bagh Ajmal Khan Road",
    zone: "Central & New Delhi (NDMC)",
    latitude: 28.6517,
    longitude: 77.1906,
    capacity_kg: 950,
    waste_types: ["wet", "dry"],
    population_density: 48000,
    address: "Ajmal Khan Road Market, Karol Bagh, New Delhi",
    historical_avg_kg: 820,
  },
  {
    node_id: "NODE-019",
    name: "Khan Market Middle Lane Cluster",
    zone: "Central & New Delhi (NDMC)",
    latitude: 28.6003,
    longitude: 77.2270,
    capacity_kg: 500,
    waste_types: ["wet", "dry"],
    population_density: 22000,
    address: "Middle Lane, Khan Market, New Delhi",
    historical_avg_kg: 410,
  },
  {
    node_id: "NODE-020",
    name: "India Gate C-Hexagon Kiosks",
    zone: "Central & New Delhi (NDMC)",
    latitude: 28.6129,
    longitude: 77.2295,
    capacity_kg: 750,
    waste_types: ["wet", "dry"],
    population_density: 35000,
    address: "Kartavya Path C-Hexagon, New Delhi",
    historical_avg_kg: 640,
  },
  {
    node_id: "NODE-021",
    name: "Kashmere Gate Maharana Pratap ISBT",
    zone: "Central & New Delhi (NDMC)",
    latitude: 28.6675,
    longitude: 77.2330,
    capacity_kg: 1300,
    waste_types: ["wet", "dry"],
    population_density: 58000,
    address: "ISBT Terminal Gate 1, Kashmere Gate, Delhi",
    historical_avg_kg: 1190,
  },
  {
    node_id: "NODE-022",
    name: "Civil Lines Rajpur Road Cluster",
    zone: "Central & New Delhi (NDMC)",
    latitude: 28.6814,
    longitude: 77.2228,
    capacity_kg: 480,
    waste_types: ["wet", "dry"],
    population_density: 20000,
    address: "Rajpur Road, Civil Lines, Delhi",
    historical_avg_kg: 330,
  },
  {
    node_id: "NODE-023",
    name: "Daryaganj Golcha Cinema Road",
    zone: "Central & New Delhi (NDMC)",
    latitude: 28.6469,
    longitude: 77.2410,
    capacity_kg: 850,
    waste_types: ["wet", "dry"],
    population_density: 46000,
    address: "Netaji Subhash Marg, Daryaganj, Delhi",
    historical_avg_kg: 730,
  },
  {
    node_id: "NODE-024",
    name: "DU North Campus Chhatra Marg",
    zone: "Central & New Delhi (NDMC)",
    latitude: 28.6892,
    longitude: 77.2110,
    capacity_kg: 650,
    waste_types: ["wet", "dry"],
    population_density: 38000,
    address: "Chhatra Marg, Delhi University North Campus",
    historical_avg_kg: 520,
  },

  // ── Zone 3: Noida Authority (UP) — 9 Nodes ─────────────────────────────────
  {
    node_id: "NODE-025",
    name: "Noida Sector 18 Atta Market",
    zone: "Noida (Authority)",
    latitude: 28.5708,
    longitude: 77.3218,
    capacity_kg: 1350,
    waste_types: ["wet", "dry"],
    population_density: 55000,
    address: "Sector 18 Commercial Hub & Atta Market, Noida",
    historical_avg_kg: 1210,
  },
  {
    node_id: "NODE-026",
    name: "Noida Sector 62 Electronic City IT Hub",
    zone: "Noida (Authority)",
    latitude: 28.6280,
    longitude: 77.3649,
    capacity_kg: 1100,
    waste_types: ["wet", "dry", "hazardous"],
    population_density: 44000,
    address: "Logix Cyber Park, Sector 62, Noida",
    historical_avg_kg: 960,
  },
  {
    node_id: "NODE-027",
    name: "Botanical Garden Metro Interchange",
    zone: "Noida (Authority)",
    latitude: 28.5644,
    longitude: 77.3343,
    capacity_kg: 900,
    waste_types: ["wet", "dry"],
    population_density: 48000,
    address: "Captain Shashi Kant Marg, Sector 38, Noida",
    historical_avg_kg: 780,
  },
  {
    node_id: "NODE-028",
    name: "Noida Sector 50 Central Market",
    zone: "Noida (Authority)",
    latitude: 28.5790,
    longitude: 77.3620,
    capacity_kg: 650,
    waste_types: ["wet", "dry"],
    population_density: 28000,
    address: "Central Market, Sector 50, Noida",
    historical_avg_kg: 490,
  },
  {
    node_id: "NODE-029",
    name: "Noida Sector 137 Expressway Hub",
    zone: "Noida (Authority)",
    latitude: 28.5085,
    longitude: 77.4080,
    capacity_kg: 850,
    waste_types: ["wet", "dry"],
    population_density: 36000,
    address: "Paras Tierea Circle, Sector 137, Noida",
    historical_avg_kg: 690,
  },
  {
    node_id: "NODE-030",
    name: "Noida Sector 76 Amrapali Cluster",
    zone: "Noida (Authority)",
    latitude: 28.5740,
    longitude: 77.3820,
    capacity_kg: 750,
    waste_types: ["wet", "dry"],
    population_density: 39000,
    address: "Sector 76 High-Rise Cluster, Noida",
    historical_avg_kg: 610,
  },
  {
    node_id: "NODE-031",
    name: "Noida Sector 15 Naya Bans Bins",
    zone: "Noida (Authority)",
    latitude: 28.5830,
    longitude: 77.3110,
    capacity_kg: 580,
    waste_types: ["wet", "dry"],
    population_density: 34000,
    address: "Naya Bans, Sector 15 Metro Road, Noida",
    historical_avg_kg: 440,
  },
  {
    node_id: "NODE-032",
    name: "Noida Sector 22 Spice World Road",
    zone: "Noida (Authority)",
    latitude: 28.5940,
    longitude: 77.3450,
    capacity_kg: 700,
    waste_types: ["wet", "dry"],
    population_density: 35000,
    address: "Main Road Sector 22, Noida",
    historical_avg_kg: 530,
  },
  {
    node_id: "NODE-033",
    name: "Greater Noida Knowledge Park III",
    zone: "Noida (Authority)",
    latitude: 28.4610,
    longitude: 77.4980,
    capacity_kg: 950,
    waste_types: ["wet", "dry"],
    population_density: 31000,
    address: "Institutional Area, Knowledge Park III, Greater Noida",
    historical_avg_kg: 740,
  },

  // ── Zone 4: Gurugram (MCG, Haryana) — 9 Nodes ──────────────────────────────
  {
    node_id: "NODE-034",
    name: "DLF Cyber City Building 10 Cluster",
    zone: "Gurugram (MCG)",
    latitude: 28.4952,
    longitude: 77.0890,
    capacity_kg: 1400,
    waste_types: ["wet", "dry", "hazardous"],
    population_density: 52000,
    address: "Cyber Hub Outer Promenade, Phase 2, Gurugram",
    historical_avg_kg: 1250,
  },
  {
    node_id: "NODE-035",
    name: "Galleria Market DLF Phase 4",
    zone: "Gurugram (MCG)",
    latitude: 28.4682,
    longitude: 77.0818,
    capacity_kg: 850,
    waste_types: ["wet", "dry"],
    population_density: 34000,
    address: "Galleria Market Complex, DLF Phase 4, Gurugram",
    historical_avg_kg: 720,
  },
  {
    node_id: "NODE-036",
    name: "Sector 29 Leisure Valley Food Plaza",
    zone: "Gurugram (MCG)",
    latitude: 28.4690,
    longitude: 77.0620,
    capacity_kg: 1100,
    waste_types: ["wet", "dry"],
    population_density: 46000,
    address: "Leisure Valley Restaurant Hub, Sector 29, Gurugram",
    historical_avg_kg: 980,
  },
  {
    node_id: "NODE-037",
    name: "Sector 44 Institutional Tech Area",
    zone: "Gurugram (MCG)",
    latitude: 28.4550,
    longitude: 77.0710,
    capacity_kg: 750,
    waste_types: ["wet", "dry"],
    population_density: 30000,
    address: "Plot 32 Institutional Area, Sector 44, Gurugram",
    historical_avg_kg: 580,
  },
  {
    node_id: "NODE-038",
    name: "Sohna Road Subhash Chowk",
    zone: "Gurugram (MCG)",
    latitude: 28.4230,
    longitude: 77.0390,
    capacity_kg: 900,
    waste_types: ["wet", "dry"],
    population_density: 41000,
    address: "Subhash Chowk, Sohna Road, Gurugram",
    historical_avg_kg: 790,
  },
  {
    node_id: "NODE-039",
    name: "Old Gurugram Sadar Bazar",
    zone: "Gurugram (MCG)",
    latitude: 28.4615,
    longitude: 77.0305,
    capacity_kg: 1050,
    waste_types: ["wet", "dry"],
    population_density: 58000,
    address: "Main Sadar Bazar, Old Gurugram",
    historical_avg_kg: 940,
  },
  {
    node_id: "NODE-040",
    name: "Golf Course Road Sector 54 Metro",
    zone: "Gurugram (MCG)",
    latitude: 28.4385,
    longitude: 77.1060,
    capacity_kg: 700,
    waste_types: ["wet", "dry"],
    population_density: 27000,
    address: "Sector 54 Chowk Rapid Metro Station, Gurugram",
    historical_avg_kg: 510,
  },
  {
    node_id: "NODE-041",
    name: "Udyog Vihar Phase 4 Industrial Estate",
    zone: "Gurugram (MCG)",
    latitude: 28.5050,
    longitude: 77.0770,
    capacity_kg: 1200,
    waste_types: ["dry", "hazardous"],
    population_density: 45000,
    address: "Phase 4 Industrial Area, Udyog Vihar, Gurugram",
    historical_avg_kg: 1040,
  },
  {
    node_id: "NODE-042",
    name: "Manesar IMT Commercial Chowk",
    zone: "Gurugram (MCG)",
    latitude: 28.3610,
    longitude: 76.9380,
    capacity_kg: 800,
    waste_types: ["wet", "dry", "hazardous"],
    population_density: 32000,
    address: "IMT Manesar Sector 1 Chowk, Gurugram",
    historical_avg_kg: 620,
  },

  // ── Zone 5: Ghaziabad & East Delhi (GMC/EDMC) — 8 Nodes ─────────────────────
  {
    node_id: "NODE-043",
    name: "Indirapuram Habitat Centre Ahinsa Khand",
    zone: "Ghaziabad & East Delhi (GMC/EDMC)",
    latitude: 28.6430,
    longitude: 77.3710,
    capacity_kg: 1250,
    waste_types: ["wet", "dry"],
    population_density: 50000,
    address: "Ahinsa Khand 1, Indirapuram, Ghaziabad",
    historical_avg_kg: 1120,
  },
  {
    node_id: "NODE-044",
    name: "Raj Nagar District Centre (RDC)",
    zone: "Ghaziabad & East Delhi (GMC/EDMC)",
    latitude: 28.6830,
    longitude: 77.4390,
    capacity_kg: 1150,
    waste_types: ["wet", "dry"],
    population_density: 47000,
    address: "RDC Commercial Complex, Raj Nagar, Ghaziabad",
    historical_avg_kg: 990,
  },
  {
    node_id: "NODE-045",
    name: "Vaishali Sector 4 Mahagun Mall Area",
    zone: "Ghaziabad & East Delhi (GMC/EDMC)",
    latitude: 28.6490,
    longitude: 77.3410,
    capacity_kg: 900,
    waste_types: ["wet", "dry"],
    population_density: 42000,
    address: "Sector 4 Main Road, Vaishali, Ghaziabad",
    historical_avg_kg: 780,
  },
  {
    node_id: "NODE-046",
    name: "Vasundhara Sector 13 Community Bins",
    zone: "Ghaziabad & East Delhi (GMC/EDMC)",
    latitude: 28.6610,
    longitude: 77.3620,
    capacity_kg: 650,
    waste_types: ["wet", "dry"],
    population_density: 31000,
    address: "Sector 13 Market, Vasundhara, Ghaziabad",
    historical_avg_kg: 510,
  },
  {
    node_id: "NODE-047",
    name: "Anand Vihar Swami Vivekananda ISBT",
    zone: "Ghaziabad & East Delhi (GMC/EDMC)",
    latitude: 28.6502,
    longitude: 77.3160,
    capacity_kg: 1350,
    waste_types: ["wet", "dry"],
    population_density: 60000,
    address: "ISBT Anand Vihar Outer Road, East Delhi",
    historical_avg_kg: 1240,
  },
  {
    node_id: "NODE-048",
    name: "Laxmi Nagar Vikas Marg Market",
    zone: "Ghaziabad & East Delhi (GMC/EDMC)",
    latitude: 28.6310,
    longitude: 77.2770,
    capacity_kg: 1000,
    waste_types: ["wet", "dry"],
    population_density: 56000,
    address: "Vikas Marg, Laxmi Nagar Metro Station, East Delhi",
    historical_avg_kg: 890,
  },
  {
    node_id: "NODE-049",
    name: "Mayur Vihar Phase 1 Pocket 1 Bins",
    zone: "Ghaziabad & East Delhi (GMC/EDMC)",
    latitude: 28.6080,
    longitude: 77.2940,
    capacity_kg: 750,
    waste_types: ["wet", "dry"],
    population_density: 36000,
    address: "Pocket 1 Market, Mayur Vihar Phase 1, East Delhi",
    historical_avg_kg: 590,
  },
  {
    node_id: "NODE-050",
    name: "Mohan Nagar GT Road Junction",
    zone: "Ghaziabad & East Delhi (GMC/EDMC)",
    latitude: 28.6860,
    longitude: 77.3910,
    capacity_kg: 850,
    waste_types: ["wet", "dry"],
    population_density: 39000,
    address: "GT Road Mohan Nagar Metro Crossing, Ghaziabad",
    historical_avg_kg: 710,
  },
]

export const SEED_TRUCKS = [
  {
    truck_id: "TRUCK-01",
    registration_number: "DL-1C-0001",
    driver_name: "Ramesh Kumar",
    driver_phone: "+91-9811001001",
    capacity_kg: 5000,
    zone: "South Delhi (MCD)",
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
    zone: "South Delhi (MCD)",
    is_active: true,
    fuel_type: "CNG Compactor",
    battery_pct: 95,
    status: "Collecting",
  },
  {
    truck_id: "TRUCK-03",
    registration_number: "DL-2C-1044",
    driver_name: "Rajesh Sharma",
    driver_phone: "+91-9811001003",
    capacity_kg: 5500,
    zone: "Central & New Delhi (NDMC)",
    is_active: true,
    fuel_type: "Electric Compactor",
    battery_pct: 79,
    status: "En Route",
  },
  {
    truck_id: "TRUCK-04",
    registration_number: "UP-16-BT-2026",
    driver_name: "Vikram Pratap Singh",
    driver_phone: "+91-9811001004",
    capacity_kg: 5000,
    zone: "Noida (Authority)",
    is_active: true,
    fuel_type: "CNG Heavy Compactor",
    battery_pct: 91,
    status: "Collecting",
  },
  {
    truck_id: "TRUCK-05",
    registration_number: "UP-14-ET-4819",
    driver_name: "Arun Tyagi",
    driver_phone: "+91-9811001005",
    capacity_kg: 4500,
    zone: "Ghaziabad & East Delhi (GMC/EDMC)",
    is_active: true,
    fuel_type: "Electric Tipper",
    battery_pct: 92,
    status: "Dispatched",
  },
  {
    truck_id: "TRUCK-06",
    registration_number: "HR-26-DK-9012",
    driver_name: "Manjeet Singh",
    driver_phone: "+91-9811001006",
    capacity_kg: 5500,
    zone: "Gurugram (MCG)",
    is_active: true,
    fuel_type: "CNG Compactor",
    battery_pct: 84,
    status: "Ready at Depot",
  },
  {
    truck_id: "TRUCK-07",
    registration_number: "HR-55-AU-3180",
    driver_name: "Virender Hooda",
    driver_phone: "+91-9811001007",
    capacity_kg: 5000,
    zone: "Gurugram (MCG)",
    is_active: true,
    fuel_type: "EV Heavy Compactor",
    battery_pct: 76,
    status: "Collecting",
  },
  {
    truck_id: "TRUCK-08",
    registration_number: "DL-1C-0008",
    driver_name: "Karan Verma",
    driver_phone: "+91-9811001008",
    capacity_kg: 4000,
    zone: "Central & New Delhi (NDMC)",
    is_active: true,
    fuel_type: "Electric Tipper",
    battery_pct: 88,
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
export function generateDailyForecast({ date, zone = null, weatherCode = 0, isFestival = false, customNodes = null }) {
  let nodes = customNodes && customNodes.length > 0 ? customNodes : SAMPLE_NODES
  if (zone) {
    nodes = nodes.filter(n => n.zone.toLowerCase() === zone.toLowerCase())
  }

  const forecasts = nodes.map(n => computeNodeForecast(n, { date, weatherCode, isFestival }))
  const totalVolume = forecasts.reduce((acc, f) => acc + f.predicted_volume_kg, 0)
  const highRiskCount = forecasts.filter(f => f.risk_level === 'critical' || f.risk_level === 'high').length

  return {
    forecast_date: date || new Date().toISOString().split('T')[0],
    zone: zone || 'All Delhi NCR Zones',
    total_predicted_volume_kg: totalVolume,
    high_risk_count: highRiskCount,
    forecasts,
  }
}

/**
 * Client-Side Capacitated Vehicle Routing Problem (CVRP) Solver (Nearest Neighbor + Capacity Constraints)
 * Mirrors OR-Tools logic across the Delhi NCR metropolitan network.
 */
export function solveCVRP({
  date,
  zone = null,
  numTrucks = 6,
  truckCapacity = 5000,
  skipLowRisk = true,
  weatherCode = 0,
  isFestival = false,
  customNodes = null,
  customTrucks = null,
}) {
  const forecastData = generateDailyForecast({ date, zone, weatherCode, isFestival, customNodes })
  let candidateNodes = [...forecastData.forecasts]

  // Filter out low-risk if toggle enabled (<45% fill)
  let skippedNodes = []
  if (skipLowRisk) {
    skippedNodes = candidateNodes.filter(n => n.risk_level === 'low')
    candidateNodes = candidateNodes.filter(n => n.risk_level !== 'low')
  }

  // Active trucks pool
  const truckPool = customTrucks && customTrucks.length > 0 ? customTrucks : SEED_TRUCKS
  const activeTruckList = truckPool.filter(t => t.is_active).slice(0, numTrucks)
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

  // Dynamic baseline distance based on route count across NCR
  const baselineDistanceKm = Math.max(145.0, Math.round(routes.length * 38.5 * 10) / 10)
  const savedKm = Math.max(0, Math.round((baselineDistanceKm - totalDistanceKm) * 10) / 10)
  // Diesel consumption: ~0.35 L per km in urban NCR traffic
  const estimatedFuelSavedLiters = Math.round(savedKm * 0.35 * 10) / 10
  // CO2: 2.68 kg CO2 per liter of diesel
  const co2SavedKg = Math.round(estimatedFuelSavedLiters * 2.68 * 10) / 10

  return {
    forecast_date: date || new Date().toISOString().split('T')[0],
    zone: zone || 'All Delhi NCR Zones',
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
