/**
 * API JSON routes (axios). Default `/api` — same origin; Vite/nginx proxy to Node.
 * Override with VITE_API_URL e.g. http://YOUR_IP:5000/api when not using a proxy.
 */
const raw = import.meta.env.VITE_API_URL;
export const API_BASE = (raw != null && String(raw).trim() !== ""
  ? String(raw).trim()
  : "/api"
).replace(/\/$/, "");

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
