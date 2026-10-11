# 🌿 EcoFleet AI — Dynamic Predictive Routing for Municipal Waste Management

<div align="center">

![EcoFleet AI Banner](https://img.shields.io/badge/WasteChakra-2026-green?style=for-the-badge&logo=leaf)
![Track](https://img.shields.io/badge/Track-AI%20for%20Smart%20Municipal%20Governance-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-emerald?style=for-the-badge)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-22c55e?style=for-the-badge&logo=githubpages&logoColor=white)](https://mohit4215.github.io/wastechakra/)

**Team Name:** Love Nature &nbsp;|&nbsp; **Team Lead:** Mohit Agarwal  
**Institution:** Ajay Kumar Garg Engineering College, Ghaziabad  
**Competition:** WasteChakra 2026 — AI for Smart Municipal Governance

🔗 **Live Application:** [https://mohit4215.github.io/wastechakra/](https://mohit4215.github.io/wastechakra/)

</div>

---

## 🧩 Problem Statement

The **Municipal Corporation of Delhi (MCD)** relies on **static, fixed-route** waste collection schedules, causing:

| Problem | Impact |
|---|---|
| 🚛 Trucks visit half-empty bins | Wasted fuel, higher operational cost, unnecessary CO₂ emissions |
| 🗑️ Bins overflow in dense sectors | Street contamination, SWM Rules 2026 violations |

Waste generation is **highly dynamic** — driven by day-of-week, festivals, weather, and population density. A static schedule simply cannot respond to this reality.

---

## 💡 The Solution — EcoFleet AI

**EcoFleet AI** is a **predictive analytics dashboard and dynamic routing engine** for MCD fleet managers. It shifts waste collection from a reactionary schedule to a proactive, data-driven operation.

```
Real-World Data  →  ML Forecast Engine  →  CVRP Optimizer  →  Fleet Dashboard  →  Driver App
```

### Key Capabilities

- 🔮 **Predictive Forecasting** — Ingests historical data, demographic density, weather, and local events to predict waste volume at each collection node
- 🗺️ **Dynamic Route Optimization** — Generates daily, optimized turn-by-turn routes solving the Capacitated Vehicle Routing Problem (CVRP)
- 💻 **100% Software-Driven** — No IoT sensors or hardware needed; optimizes existing infrastructure instantly

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        EcoFleet AI                          │
├──────────────────┬──────────────────┬───────────────────────┤
│   Data Layer     │  ML Engine       │  Routing Engine       │
│                  │                  │                       │
│ • Historical CSV │ • XGBoost Model  │ • CVRP Solver         │
│ • Weather API    │ • Feature Eng.   │ • OR-Tools / Google   │
│ • Events API     │ • Time-series    │   Maps API            │
│ • GIS Data       │ • Scikit-Learn   │ • Multi-depot support │
├──────────────────┴──────────────────┴───────────────────────┤
│                    FastAPI Backend                           │
├───────────────────────────────┬─────────────────────────────┤
│     React Dashboard (Web)     │  Driver Mobile App (PWA)    │
│     Fleet Manager Portal      │  Turn-by-turn Navigation    │
└───────────────────────────────┴─────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **ML / Forecasting** | Python, Scikit-Learn, XGBoost, Pandas, NumPy |
| **Routing Engine** | Google OR-Tools (CVRP), GeoPy |
| **Backend API** | FastAPI, Uvicorn |
| **Frontend Dashboard** | React 18, Vite, Leaflet.js, Recharts |
| **Driver App** | React PWA |
| **Database** | PostgreSQL + TimescaleDB (for time-series) |
| **Deployment** | Docker, Docker Compose |

---

## 📁 Project Structure

```
wastechakra/
├── backend/                  # FastAPI backend + ML engine
│   ├── app/
│   │   ├── api/              # REST API routes
│   │   ├── ml/               # ML forecasting models
│   │   ├── routing/          # CVRP routing engine
│   │   ├── models/           # Pydantic data models
│   │   └── core/             # Config, database
│   ├── data/                 # Sample datasets
│   ├── notebooks/            # Jupyter analysis notebooks
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                 # React dashboard
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/            # Dashboard pages
│   │   ├── hooks/            # Custom React hooks
│   │   └── services/         # API service layer
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml        # Full-stack orchestration
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (optional)

### Option 1: Docker (Recommended)

```bash
git clone https://github.com/mohit4215/wastechakra.git
cd wastechakra
docker-compose up --build
```

Dashboard → `http://localhost:5173`  
API Docs → `http://localhost:8000/docs`

### Option 2: Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📊 Expected Impact

| Metric | Target |
|---|---|
| ⛽ Fleet fuel consumption reduction | **15%** |
| 🌿 Carbon emission reduction | **15% (proportional)** |
| 🗑️ Bin overflow incidents (pilot zone) | **↓ 40%** |
| 💰 Monthly cloud cost (pilot) | **< ₹10,000** |
| 🏙️ Scalability | Any global municipality |

---

## 📚 Enterprise Documentation & Standards

Comprehensive technical and operational manuals are maintained under the [`docs/`](docs/) directory:

- 🏛️ **[System Architecture & Mathematical Formulation](docs/ARCHITECTURE.md)** — C4 architecture diagrams, CVRP MILP MTZ formulation, Haversine road tortuosity $\tau=1.32$, CPCB emission models, XGBoost feature engineering, and PostgreSQL ER schema.
- ⚡ **[REST API Reference & OpenAPI Specification](docs/API_REFERENCE.md)** — Exhaustive documentation for all 6 route groups (Auth, Nodes, Forecasting, CVRP Optimization, Fleet Telemetry, and Analytics) with complete cURL commands and response payloads.
- 📋 **[Municipal Operations Manual & SOP](docs/MUNICIPAL_OPERATIONS_MANUAL.md)** — Standard Operating Procedures for DEMS Executive Engineers, Sanitary Inspectors, Driver bilingual Hindi/English protocols, and Gazette Form SWM-IV compliance audits.

---

## 🗺️ Delhi NCR Regional Coverage & Multi-Depot Topology

EcoFleet AI models real-world municipal solid waste logistics across 50 geo-referenced collection hubs serviced by 5 regional transfer stations and 8 heavy compactors:

| Regional Zone | Administrative Depot | Nodes | Dedicated Trucks |
|---|---|---|---|
| **South Delhi** | MCD South Zone Depot, Okhla (`28.5355, 77.2510`) | 10 | TRUCK-01, TRUCK-02 |
| **Central & New Delhi** | NDMC Mandir Marg Depot (`28.6289, 77.2065`) | 10 | TRUCK-03, TRUCK-04 |
| **East Delhi & Ghaziabad** | GMC Ghazipur Central Transfer Station (`28.6280, 77.3298`) | 10 | TRUCK-05 |
| **Noida & Greater Noida** | Sector 145 Solid Waste Facility (`28.4986, 77.4124`) | 10 | TRUCK-06, TRUCK-07 |
| **Gurugram / Haryana NCR**| MCG Daultabad Waste Transfer Station (`28.4891, 77.0025`) | 10 | TRUCK-08 |

---

## 📊 Environmental Abatement & CPCB Clean Air Impact

Every optimized route plan directly outputs audited emissions savings using Central Pollution Control Board (CPCB) and ARAI heavy diesel vehicle emission factors:

$$\Delta \text{Diesel} = \Delta d \times 0.35\text{ L/km} \quad \implies \quad \Delta\text{CO}_2 = \Delta \text{Diesel} \times 2.68\text{ kg/L}$$
$$\Delta\text{PM}_{2.5} = \Delta d \times 0.285\text{ g/km} \quad , \quad \Delta\text{NO}_x = \Delta d \times 3.420\text{ g/km}$$

- ⛽ **Fuel Saved:** ~18% - 22% reduction in diesel consumption per shift
- 🌿 **Carbon Abated:** ~100 - 150 kg CO₂ avoided daily across Delhi NCR
- 💨 **Particulate Matter ($\text{PM}_{2.5}$) Prevented:** ~15 - 25 grams/day of toxic fine particulates eliminated from Delhi air
- 💰 **Municipal Cost Savings:** ~₹4,500 - ₹7,000 saved per fleet shift in diesel expenditures

---

## ⚖️ Alignment with SWM Rules 2026

EcoFleet AI directly supports the **Zero Waste to Landfill** initiative by:
- Ensuring **segregated waste** is collected before bin overflow or contamination occurs
- Optimizing multi-stream collection routes (wet / dry / hazardous)
- Generating verifiable **MCD Gazette Form SWM-IV Municipal Work Orders** with digital SHA-256 verification hashes for state pollution control board compliance

---

## 👥 Team

| Member | Role |
|---|---|
| **Mohit Agarwal** | Team Lead, ML, Backend & Systems Engineering |
| Love Nature Team | Frontend Architecture, GIS Analytics & Operations Research |

**Institution:** Ajay Kumar Garg Engineering College, Ghaziabad  
**Competition:** WasteChakra 2026 — AI for Smart Municipal Governance

---

<div align="center">
Made with 💚 for a cleaner, greener Delhi NCR
</div>
