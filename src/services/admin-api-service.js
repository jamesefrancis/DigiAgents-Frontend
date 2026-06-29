// src/services/admin-api-service.js
import { apiRequest } from './api-client';

export function listAdminUsers() {
  return apiRequest('/api/admin/users');
}

export function updateAdminUserTier(uid, tier, enabled) {
  return apiRequest(`/api/admin/users/${encodeURIComponent(uid)}/activate`, {
    method: 'POST',
    data: { tier, enabled }
  });
}
