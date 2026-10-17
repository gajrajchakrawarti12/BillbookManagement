import { apiRequest } from "./apiClient";
import API_URL from "./requests";

export interface HealthResponse {
  status: string;
  dbStatus?: string;
}

export interface Country {
  code: string;
  name: string;
}

export function getApiHealth() {
  return apiRequest<HealthResponse>(API_URL.replace(/\/api\/?$/, "/health"));
}

export function getSpringHealth() {
  return apiRequest<Record<string, unknown>>(API_URL.replace(/\/api\/?$/, "/actuator/health"));
}

export function getCountries() {
  return apiRequest<Country[]>("/countries");
}
