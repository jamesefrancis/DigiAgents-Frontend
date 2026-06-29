// filepath: frontend/src/utils/env.js
export function readOptionalEnv(key, fallback = '') {
  const value = import.meta.env?.[key];
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return String(value);
}

export function readRequiredEnv(key) {
  const value = import.meta.env?.[key];
  if (value === undefined || value === null || value === '') {
    throw new Error(`Missing required env var: ${key}`);
  }
  return String(value);
}
