"""
Open-Meteo weather integration for Delhi.
Free API — no key required.
Docs: https://open-meteo.com/en/docs
"""
from __future__ import annotations

import logging
import time
from typing import Optional

import httpx

logger = logging.getLogger("ecofleet.weather")

# Delhi coordinates
_DELHI_LAT = 28.6139
_DELHI_LON = 77.2090

# Simple in-memory cache: { "YYYY-MM-DD": (timestamp, payload) }
_cache: dict[str, tuple[float, dict]] = {}
_CACHE_TTL_SECONDS = 3600  # 1 hour

# WMO weather code → human description mapping (abridged)
WMO_DESCRIPTIONS: dict[int, str] = {
    0:  "Clear sky",
    1:  "Mainly clear",
    2:  "Partly cloudy",
    3:  "Overcast",
    45: "Foggy",
    48: "Icy fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail",
}


def _get_description(code: int) -> str:
    return WMO_DESCRIPTIONS.get(code, f"Weather code {code}")


async def get_delhi_weather(date: str) -> dict:
    """
    Fetch Delhi weather for a given date (YYYY-MM-DD) from Open-Meteo.
    Returns a dict with keys: weather_code, description, precipitation_mm.
    Falls back to clear-sky defaults if the API is unreachable.
    """
    # Return cached result if fresh
    cached = _cache.get(date)
    if cached:
        ts, payload = cached
        if time.time() - ts < _CACHE_TTL_SECONDS:
            return payload

    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={_DELHI_LAT}&longitude={_DELHI_LON}"
        f"&daily=weathercode,precipitation_sum"
        f"&timezone=Asia%2FKolkata"
        f"&start_date={date}&end_date={date}"
    )

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()

        daily = data.get("daily", {})
        codes = daily.get("weathercode", [0])
        precip = daily.get("precipitation_sum", [0.0])

        weather_code = int(codes[0]) if codes else 0
        precipitation_mm = float(precip[0]) if precip else 0.0

        payload = {
            "weather_code": weather_code,
            "description": _get_description(weather_code),
            "precipitation_mm": round(precipitation_mm, 1),
            "source": "open-meteo",
        }
    except Exception as exc:
        logger.warning("Open-Meteo fetch failed for %s: %s — using clear sky default", date, exc)
        payload = {
            "weather_code": 0,
            "description": "Clear sky (API unavailable)",
            "precipitation_mm": 0.0,
            "source": "fallback",
        }

    _cache[date] = (time.time(), payload)
    return payload
