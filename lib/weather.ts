// Client-safe helpers for the weather widget, backed by the keyless Open-Meteo API.

export type WeatherLocation = {
  name: string;
  latitude: number;
  longitude: number;
};

export type CurrentWeather = {
  temperature: number;
  weatherCode: number;
};

export type WeatherDescription = {
  label: string;
  icon: string;
};

// Fallback used when the browser denies geolocation or it's unavailable.
export const DEFAULT_LOCATION: WeatherLocation = {
  name: "New York",
  latitude: 40.71,
  longitude: -74.01,
};

/** Fetch the current temperature + WMO weather code for a coordinate. */
export async function fetchCurrentWeather(
  latitude: number,
  longitude: number
): Promise<CurrentWeather> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
    `&longitude=${longitude}&current=temperature_2m,weather_code` +
    `&temperature_unit=fahrenheit`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo request failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    current?: { temperature_2m?: number; weather_code?: number };
  };

  const temperature = data.current?.temperature_2m;
  const weatherCode = data.current?.weather_code;
  if (typeof temperature !== "number" || typeof weatherCode !== "number") {
    throw new Error("Open-Meteo response missing current weather");
  }

  return { temperature, weatherCode };
}

// WMO weather interpretation codes, bucketed into a label + emoji.
// https://open-meteo.com/en/docs#weathervariables
const WEATHER_CODES: Record<number, WeatherDescription> = {
  0: { label: "Clear", icon: "☀️" },
  1: { label: "Mainly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Fog", icon: "🌫️" },
  48: { label: "Rime fog", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Heavy drizzle", icon: "🌦️" },
  56: { label: "Freezing drizzle", icon: "🌧️" },
  57: { label: "Freezing drizzle", icon: "🌧️" },
  61: { label: "Light rain", icon: "🌧️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  66: { label: "Freezing rain", icon: "🌧️" },
  67: { label: "Freezing rain", icon: "🌧️" },
  71: { label: "Light snow", icon: "🌨️" },
  73: { label: "Snow", icon: "🌨️" },
  75: { label: "Heavy snow", icon: "❄️" },
  77: { label: "Snow grains", icon: "🌨️" },
  80: { label: "Rain showers", icon: "🌦️" },
  81: { label: "Rain showers", icon: "🌧️" },
  82: { label: "Heavy showers", icon: "⛈️" },
  85: { label: "Snow showers", icon: "🌨️" },
  86: { label: "Snow showers", icon: "❄️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
  96: { label: "Thunderstorm", icon: "⛈️" },
  99: { label: "Thunderstorm", icon: "⛈️" },
};

/** Map a WMO weather code to a display label + emoji, with a safe default. */
export function describeWeatherCode(code: number): WeatherDescription {
  return WEATHER_CODES[code] ?? { label: "Weather", icon: "🌡️" };
}
