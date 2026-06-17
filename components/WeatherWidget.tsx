"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_LOCATION,
  describeWeatherCode,
  fetchCurrentWeather,
  type CurrentWeather,
} from "@/lib/weather";

type WeatherState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "loaded"; weather: CurrentWeather; locationName: string };

/**
 * Fixed top-right weather pill shown on every page. Tries the browser's
 * geolocation; on denial/unavailability falls back to a default city.
 */
export function WeatherWidget() {
  const [state, setState] = useState<WeatherState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load(latitude: number, longitude: number, name: string) {
      try {
        const weather = await fetchCurrentWeather(latitude, longitude);
        if (!cancelled) {
          setState({ status: "loaded", weather, locationName: name });
        }
      } catch (err) {
        console.error("Failed to load weather", err);
        if (!cancelled) setState({ status: "error" });
      }
    }

    function loadDefault() {
      void load(
        DEFAULT_LOCATION.latitude,
        DEFAULT_LOCATION.longitude,
        DEFAULT_LOCATION.name
      );
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      loadDefault();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void load(pos.coords.latitude, pos.coords.longitude, "My location");
      },
      () => {
        // Denied or unavailable — fall back to the default city.
        loadDefault();
      }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  const base =
    "fixed top-3 right-3 z-[60] flex items-center gap-2 rounded-full border " +
    "border-white/10 bg-zinc-950/70 px-3 py-1.5 text-sm text-zinc-200 " +
    "shadow-lg backdrop-blur";

  if (state.status === "loading") {
    return (
      <div className={base} aria-busy="true" aria-label="Loading weather">
        <span className="animate-pulse text-zinc-400">Loading weather…</span>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className={base} aria-label="Weather unavailable">
        <span aria-hidden="true">🌡️</span>
        <span className="text-zinc-400">—</span>
      </div>
    );
  }

  const { weather, locationName } = state;
  const { label, icon } = describeWeatherCode(weather.weatherCode);
  const temp = Math.round(weather.temperature);

  return (
    <div className={base} title={`${label} in ${locationName}`}>
      <span aria-hidden="true" className="text-base leading-none">
        {icon}
      </span>
      <span className="font-semibold tabular-nums">{temp}°F</span>
      <span className="hidden text-zinc-400 sm:inline">{locationName}</span>
    </div>
  );
}
