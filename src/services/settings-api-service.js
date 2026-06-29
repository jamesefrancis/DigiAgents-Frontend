// filepath: frontend/src/services/settings-api-service.js
import { apiRequest } from './api-client';

export function getKeys() {
  return apiRequest('/api/settings/keys');
}

export function saveKeys(payload) {
  return apiRequest('/api/settings/keys', {
    method: 'POST',
    data: payload
  });
}

export function getSettingsProfile() {
  return apiRequest('/api/settings/profile');
}
