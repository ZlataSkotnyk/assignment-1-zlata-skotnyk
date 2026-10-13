import { Router } from 'express';
import { getCityWeather } from '../lib/weather.js';
import { parseCity, parseCities, } from '../validators/weather-query.js';

export const weatherRouter = Router();

// GET /api/weather?city=Toronto
weatherRouter.get('/weather', async (req, res, next) => {
  try {
    const city = parseCity(req.query.city);
    const data = await getCityWeather(city);

    res.json({
      data,
      attribution: 'Weather data provided by Open-Meteo',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/compare?cities=Toronto,Vancouver,Halifax
weatherRouter.get('/compare', async (req, res, next) => {
  try {
    // Validate the list of cities.
    const cities = parseCities(req.query.cities);

    // Get weather for all cities at the same time.
    const results = await Promise.allSettled(
      cities.map((city) => getCityWeather(city))
    );

    // Prepare the response for each city.
    const data = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return {
          city: cities[index],
          data: result.value,
        };
      }

      return {
        city: cities[index],
        error: {
          message:
            result.reason instanceof Error
              ? result.reason.message
              : 'Unable to retrieve weather',
          status: result.reason?.status ?? 500,
        },
      };
    });

    res.json({
      data,
      attribution: 'Weather data provided by Open-Meteo',
    });
  } catch (err) {
    next(err);
  }
});
