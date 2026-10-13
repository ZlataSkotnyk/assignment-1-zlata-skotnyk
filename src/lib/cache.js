import { config } from '../config.js';

// Store cached data in memory.
const cache = new Map();

// Track how many times the cache is used.
let hits = 0;
let misses = 0;

// Convert the cache lifetime from seconds to milliseconds.
const ttlMilliseconds = config.cacheTtlSeconds * 1000;

// Get data from the cache.
export function getCache(key) {
    const entry = cache.get(key);

    // If the key doesn't exist, this is a cache miss.
    if (!entry) {
        misses++;
        return undefined;
    }

    // Check whether the saved entry has expired.
    if (Date.now() >= entry.expiresAt) {
        cache.delete(key);
        misses++;
        return undefined;
    }

    // The saved entry is still valid.
    hits++;
    return entry.value;
}

// Save data in the cache.
export function setCache(key, value) {
    cache.set(key, {
        value,
        expiresAt: Date.now() + ttlMilliseconds,
    });
}

// Return cache statistics.
export function getCacheStats() {
    return {
        hits,
        misses,
        size: cache.size,
    };
}