// filepath: frontend/src/services/api-client.js
import axios from 'axios';
import { API_URL, BACKEND_SECRET } from '../config/constants';
import { firebaseAuth } from '../config/firebase';

export const apiClient = axios.create({
  baseURL: API_URL || '',
  timeout: 120000
});

apiClient.interceptors.request.use(async (config) => {
  const next = { ...config };
  next.headers = next.headers || {};

  if (BACKEND_SECRET) {
    next.headers['x-backend-secret'] = BACKEND_SECRET;
  }

  const currentUser = firebaseAuth?.currentUser;
  if (currentUser) {
    const token = await currentUser.getIdToken();
    if (token) {
      next.headers.Authorization = `Bearer ${token}`;
    }
  }

  return next;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      'Request failed';

    const wrapped = new Error(message);
    wrapped.status = error?.response?.status || null;
    wrapped.data = error?.response?.data || null;
    return Promise.reject(wrapped);
  }
);

export async function apiRequest(path, options = {}) {
  const method = options.method || 'GET';
  const response = await apiClient.request({
    url: path,
    method,
    data: options.data,
    params: options.params,
    headers: options.headers
  });
  return response.data;
}
