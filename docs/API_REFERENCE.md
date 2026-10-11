# 📚 EcoFleet AI — REST API Reference Specification

**Base URL (Local):** `http://localhost:8000/api`  
**API Version:** `1.0.0`  
**OpenAPI / Swagger Interactive UI:** `http://localhost:8000/docs`  
**ReDoc Interactive UI:** `http://localhost:8000/redoc`

---

## Table of Contents
1. [Authentication & Authorization](#1-authentication--authorization)
2. [Collection Nodes Management](#2-collection-nodes-management)
3. [Predictive Volume Forecasting](#3-predictive-volume-forecasting)
4. [CVRP Route Optimization & Dispatch](#4-cvrp-route-optimization--dispatch)
5. [Fleet Management & Maintenance](#5-fleet-management--maintenance)
6. [Municipal Analytics & ESG Metrics](#6-municipal-analytics--esg-metrics)
7. [Standard Error Codes](#7-standard-error-codes)

---

## 1. Authentication & Authorization

All authenticated endpoints require a Bearer token in the HTTP `Authorization` header:
```http
Authorization: Bearer <access_token>
```

### 1.1 `POST /auth/login`
Authenticate administrative, managerial, or driver credentials and obtain a JWT access token.

- **Access:** Public
- **Content-Type:** `application/json`

#### Request Body
```json
{
  "email": "admin@ecofleet.ai",
  "password": "EcoFleet@2026"
}
```

#### Response (`200 OK`)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "admin@ecofleet.ai",
    "full_name": "EcoFleet Administrator",
    "role": "admin",
    "is_active": true,
    "created_at": "2026-10-10T02:02:15.425000Z"
  }
}
```

#### Error Responses
- `401 Unauthorized`: Invalid email or password.
- `422 Unprocessable Entity`: Malformed JSON or missing fields.

---

### 1.2 `GET /auth/me`
Retrieve the profile of the currently authenticated user.

- **Access:** Authenticated (`driver`, `manager`, `admin`)
- **Headers:** `Authorization: Bearer <token>`

#### Response (`200 OK`)
```json
{
  "id": 1,
  "email": "admin@ecofleet.ai",
  "full_name": "EcoFleet Administrator",
  "role": "admin",
  "is_active": true,
  "created_at": "2026-10-10T02:02:15.425000Z"
}
```

---

## 2. Collection Nodes Management

### 2.1 `GET /nodes/`
Retrieve all collection points across Delhi NCR, with optional filtering by municipal zone and pagination.

- **Access:** Public or Authenticated
- **Query Parameters:**
  - `zone` *(optional, string)*: Filter by municipal authority (e.g. `South Delhi (MCD)`, `Noida (Authority)`).
  - `limit` *(optional, int, default: 100)*: Maximum nodes to return.
  - `offset` *(optional, int, default: 0)*: Number of nodes to skip.

#### Response (`200 OK`)
```json
[
  {
    "node_id": "NODE-001",
    "name": "Lajpat Nagar Central Market Cluster",
    "zone": "South Delhi (MCD)",
    "latitude": 28.5677,
    "longitude": 77.2433,
    "capacity_kg": 800.0,
    "waste_types": ["wet", "dry"],
    "population_density": 38000.0,
    "last_collected_at": "2026-10-11T08:30:00Z"
  },
  {
    "node_id": "NODE-016",
    "name": "Connaught Place Inner Circle Plaza",
    "zone": "Central & New Delhi (NDMC)",
    "latitude": 28.6315,
    "longitude": 77.2167,
    "capacity_kg": 1200.0,
    "waste_types": ["wet", "dry", "hazardous"],
    "population_density": 52000.0,
    "last_collected_at": "2026-10-11T09:15:00Z"
  }
]
```

---

### 2.2 `POST /nodes/`
Register a new municipal collection bin cluster.

- **Access:** Authenticated (`manager`, `admin`)
- **Headers:** `Authorization: Bearer <token>`

#### Request Body
```json
{
  "node_id": "NODE-051",
  "name": "Saket District Centre Courtyard",
  "zone": "South Delhi (MCD)",
  "latitude": 28.5284,
  "longitude": 77.2185,
  "capacity_kg": 900.0,
  "waste_types": ["wet", "dry"],
  "population_density": 34000.0
}
```

#### Response (`201 Created`)
Returns the registered node object.

---

### 2.3 `POST /nodes/{node_id}/collect`
Log an actual vehicle collection event, resetting node fill percentage and recording an immutable waste collection log.

- **Access:** Authenticated (`driver`, `manager`, `admin`)
- **Path Parameters:** `node_id` (string)

#### Request Body
```json
{
  "collected_kg": 720.5
}
```

#### Response (`200 OK`)
```json
{
  "status": "success",
  "node_id": "NODE-001",
  "collected_at": "2026-10-12T07:45:00Z",
  "collected_kg": 720.5,
  "message": "Bin NODE-001 successfully cleared and logged."
}
```

---

### 2.4 `POST /nodes/{node_id}/report`
Citizen Grievance & Field Worker Incident Ingestion. Flags overflowing bins or illegal dumping for prioritized dynamic re-routing under SWM Rules 2026.

- **Access:** Public (No authorization required)
- **Path Parameters:** `node_id` (string)

#### Request Body
```json
{
  "issue_type": "overflow",
  "description": "Commercial crowd packaging overflow near metro exit gate",
  "estimated_overflow_kg": 250.0
}
```

#### Response (`200 OK`)
```json
{
  "status": "received",
  "node_id": "NODE-001",
  "issue_type": "overflow",
  "reported_at": "2026-10-12T08:12:45Z",
  "ticket_id": "TICK-83921",
  "message": "Report logged. Routing engine notified for priority pickup."
}
```

---

## 3. Predictive Volume Forecasting

### 3.1 `GET /forecast/daily`
Generate ML waste volume predictions for all collection points on a target date, incorporating demographic density, weather parameters, and festival factors.

- **Access:** Authenticated (`manager`, `admin`)
- **Query Parameters:**
  - `forecast_date` *(required, ISO date `YYYY-MM-DD`)*: Prediction horizon.
  - `zone` *(optional, string)*: Filter by municipal zone.
  - `weather_code` *(optional, int, default: 0)*: WMO weather code (e.g. 0=Clear, 61=Rain, 95=Storm).
  - `is_festival` *(optional, bool, default: false)*: Festival surge toggle (+40% commercial trash).

#### Response (`200 OK`)
```json
{
  "forecast_date": "2026-10-12",
  "generated_at": "2026-10-12T00:30:00Z",
  "total_predicted_volume_kg": 41250.0,
  "high_risk_count": 14,
  "forecasts": [
    {
      "node_id": "NODE-001",
      "name": "Lajpat Nagar Central Market Cluster",
      "zone": "South Delhi (MCD)",
      "predicted_volume_kg": 745.0,
      "fill_percentage": 93.1,
      "risk_level": "critical",
      "is_overflow": false
    },
    {
      "node_id": "NODE-002",
      "name": "Sarojini Nagar Babu Market Bins",
      "zone": "South Delhi (MCD)",
      "predicted_volume_kg": 460.0,
      "fill_percentage": 76.7,
      "risk_level": "high",
      "is_overflow": false
    }
  ]
}
```

---

## 4. CVRP Route Optimization & Dispatch

### 4.1 `POST /routing/optimize`
Execute the Google OR-Tools / Clarke-Wright Capacitated Vehicle Routing Problem solver across target nodes.

- **Access:** Authenticated (`manager`, `admin`)
- **Headers:** `Authorization: Bearer <token>`

#### Request Body
```json
{
  "forecast_date": "2026-10-12",
  "zone": "South Delhi (MCD)",
  "num_trucks": 5,
  "truck_capacity_kg": 5000,
  "skip_low_risk": true
}
```

#### Response (`200 OK`)
```json
{
  "forecast_date": "2026-10-12",
  "zone": "South Delhi (MCD)",
  "total_routes": 4,
  "total_nodes_serviced": 14,
  "total_nodes_skipped": 1,
  "total_distance_km": 68.4,
  "estimated_fuel_saved_liters": 25.8,
  "co2_saved_kg": 69.1,
  "routes": [
    {
      "truck_id": "TRUCK-01",
      "registration_number": "DL-1C-0001",
      "driver_name": "Ramesh Kumar",
      "driver_phone": "+91-9811001001",
      "fuel_type": "EV",
      "capacity_kg": 5000,
      "total_weight_kg": 4250.0,
      "utilization_pct": 85,
      "route_distance_km": 18.2,
      "color": "#10b981",
      "stops": [
        {
          "stop_index": 1,
          "node_id": "NODE-001",
          "node_name": "Lajpat Nagar Central Market Cluster",
          "address": "Central Market, Lajpat Nagar II, New Delhi",
          "latitude": 28.5677,
          "longitude": 77.2433,
          "predicted_volume_kg": 745.0,
          "fill_percentage": 93.1,
          "risk_level": "critical",
          "status": "pending"
        }
      ]
    }
  ]
}
```

---

## 5. Fleet Management & Maintenance

### 5.1 `GET /fleet/`
List all municipal vehicles registered in the regional fleet registry.

- **Access:** Authenticated (`manager`, `admin`)

#### Response (`200 OK`)
```json
{
  "total_trucks": 8,
  "active_trucks": 7,
  "trucks": [
    {
      "truck_id": "TRUCK-01",
      "registration_number": "DL-1C-0001",
      "driver_name": "Ramesh Kumar",
      "driver_phone": "+91-9811001001",
      "capacity_kg": 5000,
      "zone": "South Delhi (MCD)",
      "fuel_type": "EV",
      "battery_pct": 88,
      "status": "En Route",
      "is_active": true
    }
  ]
}
```

---

## 6. Municipal Analytics & ESG Metrics

### 6.1 `GET /analytics/summary`
Retrieve high-level KPIs, SWM Rules 2026 compliance rates, and clean air impact metrics.

- **Access:** Authenticated (`manager`, `admin`)

#### Response (`200 OK`)
```json
{
  "swm_compliance_rate": 98.7,
  "clean_city_index": 89.4,
  "total_waste_diverted_kg": 68420.0,
  "total_fuel_saved_liters": 438.2,
  "fuel_cost_saved_inr": 41629,
  "total_co2_abated_kg": 1174.4,
  "trees_equivalent": 53,
  "overflow_incidents_prevented": 48,
  "active_collection_points": 50,
  "fleet_utilization_rate": 89.2,
  "zone_breakdown": [
    {
      "zone": "South Delhi (MCD)",
      "nodes_count": 15,
      "avg_fill_pct": 57.2,
      "waste_volume_kg": 5820.0,
      "compliance": "99.1%"
    },
    {
      "zone": "Central & New Delhi (NDMC)",
      "nodes_count": 9,
      "avg_fill_pct": 64.5,
      "waste_volume_kg": 4210.0,
      "compliance": "99.4%"
    },
    {
      "zone": "Noida (Authority)",
      "nodes_count": 9,
      "avg_fill_pct": 53.8,
      "waste_volume_kg": 3950.0,
      "compliance": "98.8%"
    },
    {
      "zone": "Gurugram (MCG)",
      "nodes_count": 9,
      "avg_fill_pct": 62.1,
      "waste_volume_kg": 4480.0,
      "compliance": "98.5%"
    },
    {
      "zone": "Ghaziabad & East Delhi (GMC/EDMC)",
      "nodes_count": 8,
      "avg_fill_pct": 68.3,
      "waste_volume_kg": 4620.0,
      "compliance": "97.9%"
    }
  ]
}
```

---

## 7. Standard Error Codes

| Status Code | Meaning | Example Rationale |
| :---: | :--- | :--- |
| `200 OK` | Success | Request succeeded and entity payload returned. |
| `201 Created` | Created | New node, user, or dispatch session successfully committed. |
| `400 Bad Request` | Validation Error | Duplicate node identifier or incompatible capacity parameter. |
| `401 Unauthorized` | Authentication Missing | Missing or expired JWT bearer token. |
| `403 Forbidden` | Access Denied | Insufficient role permissions (e.g. driver attempting to delete node). |
| `404 Not Found` | Entity Missing | Collection node or truck identifier does not exist. |
| `422 Unprocessable` | Schema Mismatch | Date parameter not formatted in ISO 8601 (`YYYY-MM-DD`). |
| `429 Too Many Req` | Rate Limit Exceeded | Exceeded 200 requests/minute threshold. |
| `500 Server Error` | Internal Failure | Unhandled database or solver exception. |
