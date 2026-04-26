/**
 * API JSON routes (axios). Default `/api/` — same origin; Vite/nginx proxy to Node.
 * Must end with `/` so axios merges paths like `/auth/register` correctly (otherwise
 * `/api` + `auth/register` becomes `/apiauth/register`).
 * Override with VITE_API_URL e.g. http://YOUR_IP:5000/api/
 */
const raw = import.meta.env.VITE_API_URL;
const trimmed =
  raw != null && String(raw).trim() !== ""
    ? String(raw).trim()
    : "/api";
export const API_BASE = trimmed.endsWith("/") ? trimmed : `${trimmed}/`;

/** Base URL for /uploads/* (Express static). Empty = same origin as the SPA (proxied). */
export function getUploadsBase() {
  if (raw != null && String(raw).trim() !== "" && /^https?:\/\//i.test(String(raw).trim())) {
    try {
      const u = new URL(String(raw).trim().replace(/\/$/, "") + "/");
      return u.origin;
    } catch {
      return "";
    }
  }
  return "";
}
