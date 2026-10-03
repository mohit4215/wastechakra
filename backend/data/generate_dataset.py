"""
Script to generate synthetic 180-day historical municipal waste collection dataset
for Municipal Corporation of Delhi (MCD) South Zones 3 & 4.
Generates: backend/data/mcd_delhi_waste_history.csv
"""
import csv
import os
import random
from datetime import date, timedelta
from pathlib import Path

# Fix random seed for reproducible benchmark dataset
random.seed(42)

NODES = [
    {"node_id": "NODE-001", "name": "Lajpat Nagar Market Bin Cluster", "zone": "South Delhi Zone 3", "capacity_kg": 800, "pop_density": 38000},
    {"node_id": "NODE-002", "name": "Sarojini Nagar Community Bins", "zone": "South Delhi Zone 3", "capacity_kg": 600, "pop_density": 32000},
    {"node_id": "NODE-003", "name": "INA Colony Street Cluster", "zone": "South Delhi Zone 3", "capacity_kg": 400, "pop_density": 25000},
    {"node_id": "NODE-004", "name": "Nehru Place Commercial Hub", "zone": "South Delhi Zone 3", "capacity_kg": 1200, "pop_density": 45000},
    {"node_id": "NODE-005", "name": "Greater Kailash Block N", "zone": "South Delhi Zone 3", "capacity_kg": 500, "pop_density": 20000},
    {"node_id": "NODE-006", "name": "Defence Colony Main Road", "zone": "South Delhi Zone 3", "capacity_kg": 600, "pop_density": 22000},
    {"node_id": "NODE-007", "name": "CR Park Bengali Colony", "zone": "South Delhi Zone 3", "capacity_kg": 500, "pop_density": 28000},
    {"node_id": "NODE-008", "name": "Jangpura Extension Market", "zone": "South Delhi Zone 3", "capacity_kg": 450, "pop_density": 30000},
    {"node_id": "NODE-009", "name": "Bhogal Vegetable Market", "zone": "South Delhi Zone 3", "capacity_kg": 700, "pop_density": 40000},
    {"node_id": "NODE-010", "name": "Andrews Ganj Colony", "zone": "South Delhi Zone 3", "capacity_kg": 350, "pop_density": 18000},
    {"node_id": "NODE-011", "name": "Moolchand Market Cluster", "zone": "South Delhi Zone 3", "capacity_kg": 550, "pop_density": 26000},
    {"node_id": "NODE-012", "name": "Sidhartha Nagar Bins", "zone": "South Delhi Zone 3", "capacity_kg": 400, "pop_density": 35000},
    {"node_id": "NODE-013", "name": "Kotla Mubarakpur Street", "zone": "South Delhi Zone 3", "capacity_kg": 480, "pop_density": 33000},
    {"node_id": "NODE-014", "name": "Malviya Nagar Main Market", "zone": "South Delhi Zone 4", "capacity_kg": 700, "pop_density": 30000},
    {"node_id": "NODE-015", "name": "Okhla Phase 1 Industrial Area", "zone": "South Delhi Zone 4", "capacity_kg": 1500, "pop_density": 15000},
    {"node_id": "NODE-016", "name": "Hauz Khas Village Cluster", "zone": "South Delhi Zone 4", "capacity_kg": 450, "pop_density": 18000},
    {"node_id": "NODE-017", "name": "Saket Select Citywalk Area", "zone": "South Delhi Zone 4", "capacity_kg": 900, "pop_density": 25000},
    {"node_id": "NODE-018", "name": "Sheikh Sarai Phase 2", "zone": "South Delhi Zone 4", "capacity_kg": 400, "pop_density": 22000},
    {"node_id": "NODE-019", "name": "Kalkaji Main Road Bins", "zone": "South Delhi Zone 4", "capacity_kg": 600, "pop_density": 36000},
    {"node_id": "NODE-020", "name": "Govindpuri Market Cluster", "zone": "South Delhi Zone 4", "capacity_kg": 550, "pop_density": 42000},
    {"node_id": "NODE-021", "name": "Sangam Vihar Block A", "zone": "South Delhi Zone 4", "capacity_kg": 800, "pop_density": 48000},
    {"node_id": "NODE-022", "name": "Madanpur Khadar Bins", "zone": "South Delhi Zone 4", "capacity_kg": 650, "pop_density": 44000},
    {"node_id": "NODE-023", "name": "Jasola Apollo Hospital Area", "zone": "South Delhi Zone 4", "capacity_kg": 500, "pop_density": 20000},
    {"node_id": "NODE-024", "name": "Alaknanda Market Community Bins", "zone": "South Delhi Zone 4", "capacity_kg": 480, "pop_density": 27000},
    {"node_id": "NODE-025", "name": "Pul Prehladpur Cluster", "zone": "South Delhi Zone 4", "capacity_kg": 700, "pop_density": 39000},
]

# Festival calendar dates in Delhi (relative to recent months)
FESTIVALS = {
    date(2026, 8, 15): "Independence Day",
    date(2026, 8, 27): "Raksha Bandhan",
    date(2026, 9, 4): "Janmashtami",
    date(2026, 9, 17): "Anant Chaturdashi",
    date(2026, 10, 2): "Gandhi Jayanti",
    date(2026, 10, 20): "Dussehra",
    date(2026, 11, 8): "Diwali",
    date(2026, 11, 14): "Bhai Dooj",
    date(2026, 11, 17): "Chhath Puja",
}

def generate_csv(output_path: Path, days: int = 180):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    end_date = date.today()
    start_date = end_date - timedelta(days=days)

    fieldnames = [
        "date", "node_id", "node_name", "zone", "capacity_kg",
        "population_density", "day_of_week", "month", "is_weekend",
        "is_monday", "is_festival", "festival_name", "weather_code",
        "temperature_c", "humidity_pct", "rainfall_mm",
        "actual_waste_kg", "fill_percentage", "overflow_occurred"
    ]

    total_rows = 0
    with open(output_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        cur_date = start_date
        while cur_date <= end_date:
            dow = cur_date.weekday()
            month = cur_date.month
            is_weekend = 1 if dow in (5, 6) else 0
            is_monday = 1 if dow == 0 else 0
            fest_name = FESTIVALS.get(cur_date, "")
            is_festival = 1 if fest_name else 0

            # Simulate plausible Delhi weather based on month
            if month in (7, 8, 9):  # Monsoon season
                weather_code = random.choices([0, 61, 63, 65, 95], weights=[0.4, 0.25, 0.15, 0.1, 0.1])[0]
                temp_c = round(random.uniform(28.0, 36.0), 1)
                humidity = random.randint(65, 92)
                rain_mm = round(random.uniform(5.0, 45.0), 1) if weather_code != 0 else 0.0
            else:  # Dry/Autumn season
                weather_code = random.choices([0, 1, 3], weights=[0.7, 0.2, 0.1])[0]
                temp_c = round(random.uniform(22.0, 32.0), 1)
                humidity = random.randint(35, 65)
                rain_mm = 0.0

            for node in NODES:
                cap = node["capacity_kg"]
                pop_dense = node["pop_density"]
                base_ratio = 0.40 + (min(pop_dense, 45000) / 45000) * 0.35

                # Modifiers
                dow_mult = 1.25 if is_weekend else (1.10 if is_monday else 0.98)
                fest_mult = 1.35 if is_festival else 1.0
                rain_mult = 1.12 if rain_mm > 0 else 1.0
                noise = random.uniform(0.92, 1.08)

                fill_ratio = base_ratio * dow_mult * fest_mult * rain_mult * noise
                fill_ratio = min(max(fill_ratio, 0.10), 1.20)  # Can exceed 1.0 (overflow)

                actual_kg = round(cap * fill_ratio, 1)
                fill_pct = round(fill_ratio * 100, 1)
                overflow = 1 if fill_pct >= 98.0 else 0

                writer.writerow({
                    "date": cur_date.isoformat(),
                    "node_id": node["node_id"],
                    "node_name": node["name"],
                    "zone": node["zone"],
                    "capacity_kg": cap,
                    "population_density": pop_dense,
                    "day_of_week": dow,
                    "month": month,
                    "is_weekend": is_weekend,
                    "is_monday": is_monday,
                    "is_festival": is_festival,
                    "festival_name": fest_name,
                    "weather_code": weather_code,
                    "temperature_c": temp_c,
                    "humidity_pct": humidity,
                    "rainfall_mm": rain_mm,
                    "actual_waste_kg": actual_kg,
                    "fill_percentage": fill_pct,
                    "overflow_occurred": overflow,
                })
                total_rows += 1

            cur_date += timedelta(days=1)

    print(f"Generated {total_rows} historical records in {output_path}")

if __name__ == "__main__":
    out_file = Path(__file__).resolve().parent / "mcd_delhi_waste_history.csv"
    generate_csv(out_file, days=180)
