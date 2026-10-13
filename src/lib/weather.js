import { geocodeCity, getForecast } from './open-meteo.js';
import { describeWeatherCode } from './weather-codes.js';
import {
  getCache,
  setCache,
  getCacheStats as readCacheStats,
} from './cache.js';

// Get the weather summary for one city.
export async function getCityWeather(city) {
  // Use a consistent key, even if the city has different capitalization.
  const cacheKey = city.trim().toLowerCase();

  // Check whether we already have valid weather data.
  const cachedWeather = getCache(cacheKey);

  if (cachedWeather !== undefined) {
    return {
      ...cachedWeather,
      cached: true,
    };
  }

  // Find the city and its coordinates.
  const location = await geocodeCity(city);

  // Get the current weather and forecast.
  const forecast = await getForecast(
    location.latitude,
    location.longitude
  );

  // Build the weather summary.
  const summary = {
    location,
    current: {
      temperature: forecast.current.temperature_2m,
      apparentTemperature: forecast.current.apparent_temperature,
      humidity: forecast.current.relative_humidity_2m,
      windSpeed: forecast.current.wind_speed_10m,
      description: describeWeatherCode(
        forecast.current.weather_code
      ),
    },
    daily: forecast.daily.time.map((date, index) => ({
      date,
      description: describeWeatherCode(
        forecast.daily.weather_code[index]
      ),
      temperatureMax: forecast.daily.temperature_2m_max[index],
      temperatureMin: forecast.daily.temperature_2m_min[index],
      precipitationProbability:
        forecast.daily.precipitation_probability_max[index],
    })),
  };

  // Save the summary for future requests.
  setCache(cacheKey, summary);

  // This request fetched fresh weather data.
  return {
    ...summary,
    cached: false,
  };
}

// Return cache statistics for the stats endpoint.
export function getCacheStats() {
  return readCacheStats();
}