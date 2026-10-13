
import { config } from '../config.js';
import { HttpError } from './http-error.js';

// Helper: fetch a URL and return its JSON response.
async function fetchJson(url) {
  let res;

  try {
    res = await fetch(url, {
      signal: AbortSignal.timeout(config.upstreamTimeoutMs),
    });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      throw new HttpError(504, 'Weather provider timed out');
    }

    throw new HttpError(502, 'Unable to reach weather provider');
  }

  // fetch does not throw automatically for HTTP 404 or 500.
  if (!res.ok) {
    throw new HttpError(
      502,
      `Weather provider returned HTTP ${res.status}`
    );
  }

  try {
    return await res.json();
  } catch {
    throw new HttpError(502, 'Weather provider returned invalid JSON');
  }
}

// Find a city using its name.
export async function geocodeCity(name) {
  const url = new URL(`${config.geocodingUrl}/search`);

  url.searchParams.set('name', name);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  const data = await fetchJson(url);

  if (!data.results || data.results.length === 0) {
    throw new HttpError(404, 'City not found');
  }

  const city = data.results[0];

  return {
    name: city.name,
    region: city.admin1 ?? null,
    country: city.country,
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: city.timezone,
  };
}

// Get the current weather and a three-day forecast.
export async function getForecast(latitude, longitude) {
  const url = new URL(`${config.forecastUrl}/forecast`);

  url.searchParams.set('latitude', latitude);
  url.searchParams.set('longitude', longitude);
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m'
  );
  url.searchParams.set(
    'daily',
    'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max'
  );
  url.searchParams.set('forecast_days', '3');
  url.searchParams.set('timezone', 'auto');

  return await fetchJson(url);
}