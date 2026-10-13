import { HttpError } from '../lib/http-error.js';

// Validate the city query parameter.
export function parseCity(value) {
  if (typeof value !== 'string') {
    throw new HttpError(400, 'City is required', {
      city: 'Provide one city name.',
    });
  }

  const city = value.trim();

  if (city.length === 0) {
    throw new HttpError(400, 'City cannot be empty', {
      city: 'Provide a city name.',
    });
  }

  if (city.length > 100) {
    throw new HttpError(400, 'City name is too long', {
      city: 'City name must be 100 characters or fewer.',
    });
  }

  return city;
}

// Validate the cities query parameter for comparison.
export function parseCities(value) {
  if (typeof value !== 'string') {
    throw new HttpError(400, 'Cities are required', {
      cities: 'Provide a comma-separated list of cities.',
    });
  }

  const cities = value.split(',').map((city) => city.trim());

  // Require at least two cities to compare.
  if (cities.length < 2) {
    throw new HttpError(400, 'At least two cities are required', {
      cities: 'Provide at least two city names separated by commas.',
    });
  }

  // Limit the number of cities requested at once.
  if (cities.length > 5) {
    throw new HttpError(400, 'Too many cities', {
      cities: 'Provide no more than five cities.',
    });
  }

  // Check every city using the existing single-city validator.
  try {
    return cities.map((city) => parseCity(city));
  } catch (err) {
    if (err instanceof HttpError) {
      throw new HttpError(400, 'Invalid city list', {
        cities: err.details?.city ?? err.message,
      });
    }

    throw err;
  }
}