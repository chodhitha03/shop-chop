/**
 * API base URL — auto-detects environment.
 *
 * Local dev:  Vite proxy handles /api → localhost:4000 (no prefix needed)
 * Production: Uses the deployed backend URL from env variable
 */
export const API_BASE = import.meta.env.VITE_API_URL || "";

/**
 * Build a full API URL.
 * - In dev: api("/api/auth/login") → "/api/auth/login" (handled by Vite proxy)
 * - In prod: api("/api/auth/login") → "https://your-backend.onrender.com/api/auth/login"
 */
export function api(path: string): string {
  return `${API_BASE}${path}`;
}
