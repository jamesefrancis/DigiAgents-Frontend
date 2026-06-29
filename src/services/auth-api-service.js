// filepath: frontend/src/services/auth-api-service.js
import { apiRequest } from './api-client';

export function bootstrapProfile(activationCodes = []) {
  return apiRequest('/api/auth/bootstrap', {
    method: 'POST',
    data: { activationCodes }
  });
}

export function fetchProfile() {
  return apiRequest('/api/auth/profile');
}

export function applyActivationCode(code) {
  return apiRequest('/api/auth/activate', {
    method: 'POST',
    data: { code }
  });
}
