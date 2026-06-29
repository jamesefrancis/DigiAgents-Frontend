// filepath: frontend/src/utils/routes.js
import { ROUTES } from '../config/constants';

export const ROUTE_PATHS = ROUTES;

export function routeTo(key) {
  return ROUTES[key] || ROUTES.root;
}
