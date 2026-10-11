pub struct CarbonCalculator;

impl CarbonCalculator {
    const DIESEL_L_PER_KM: f64 = 0.35;
    const CO2_KG_PER_LITER: f64 = 2.68;

    pub fn compute_savings(baseline_km: f64, optimized_km: f64) -> (f64, f64) {
        let saved_km = (baseline_km - optimized_km).max(0.0);
        let fuel_saved = saved_km * Self::DIESEL_L_PER_KM;
        let co2_saved = fuel_saved * Self::CO2_KG_PER_LITER;
        (fuel_saved, co2_saved)
    }
}
