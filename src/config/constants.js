// filepath: frontend/src/config/constants.js
import { readOptionalEnv } from '../utils/env';

export const APP_NAME = 'DigiAgents';
export const API_URL = readOptionalEnv('VITE_BACKEND_URL', readOptionalEnv('VITE_API_URL', ''));
export const BACKEND_SECRET = readOptionalEnv('VITE_BACKEND_SECRET', '');

export const ROUTES = {
  root: '/',
  dashboard: '/dashboard',
  agents: '/agents',
  chains: '/chains',
  runs: '/runs',
  settings: '/settings',
  login: '/login',
  signup: '/signup',
  secretSignup: '/secretsignup',
  adminzoo: '/adminzoo'
};
