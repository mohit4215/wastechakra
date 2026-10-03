# 🌿 EcoFleet AI — Dynamic Predictive Routing for Municipal Waste Management

<div align="center">

![EcoFleet AI Banner](https://img.shields.io/badge/WasteChakra-2026-green?style=for-the-badge&logo=leaf)
![Track](https://img.shields.io/badge/Track-AI%20for%20Smart%20Municipal%20Governance-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active%20Development-orange?style=for-the-badge)

**Team Name:** Love Nature &nbsp;|&nbsp; **Team Lead:** Mohit Agarwal  
**Institution:** Ajay Kumar Garg Engineering College, Ghaziabad  
**Competition:** WasteChakra 2026

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

## ⚖️ Alignment with SWM Rules 2026

EcoFleet AI directly supports the **Zero Waste to Landfill** initiative by:
- Ensuring **segregated waste** is collected before contamination occurs
- Optimizing multi-stream collection routes (wet / dry / hazardous)
- Providing audit-ready **digital collection logs** for compliance reporting

---

## 👥 Team

| Member | Role |
|---|---|
| **Mohit Agarwal** | Team Lead, ML & Backend |
| Love Nature Team | Frontend, Research & Analysis |

**Institution:** Ajay Kumar Garg Engineering College, Ghaziabad  
**Competition:** WasteChakra 2026 — AI for Smart Municipal Governance

---

<div align="center">
Made with 💚 for a cleaner Delhi
</div>
