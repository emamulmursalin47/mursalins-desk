/**
 * Client-side admin API helpers.
 * All requests go through /api/proxy/... which attaches the
 * HttpOnly accessToken cookie as a Bearer header to the backend.
 */

const PROXY_BASE = "/api/proxy";

interface FetchOptions {
  signal?: AbortSignal;
}

// Deduplicate concurrent token refresh requests
let refreshPromise: Promise<boolean> | null = null;

async function refreshToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch("/api/auth/refresh", { method: "POST" })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  opts?: FetchOptions,
): Promise<T> {
  const headers: HeadersInit = {};
  let bodyStr: string | undefined;

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    bodyStr = JSON.stringify(body);
  }

  const res = await fetch(`${PROXY_BASE}${path}`, {
    method,
    headers,
    body: bodyStr,
    signal: opts?.signal,
  });

  // If 401, try refreshing the token once
  if (res.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      // Retry the original request
      const retry = await fetch(`${PROXY_BASE}${path}`, {
        method,
        headers,
        body: bodyStr,
        signal: opts?.signal,
      });
      if (!retry.ok) {
        const err = await retry.json().catch(() => ({}));
        throw new Error(
          err.message || err.error || `Request failed (${retry.status})`,
        );
      }
      const json = await retry.json();
      return (json.data ?? json) as T;
    }
    // Refresh failed — redirect to login
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.message || err.error || `Request failed (${res.status})`,
    );
  }

  const json = await res.json();
  return (json.data ?? json) as T;
}

/* ─── Generic CRUD helpers ─── */

export function adminGet<T>(path: string, opts?: FetchOptions) {
  return request<T>("GET", path, undefined, opts);
}

export function adminPost<T>(path: string, body?: unknown, opts?: FetchOptions) {
  return request<T>("POST", path, body, opts);
}

export function adminPatch<T>(
  path: string,
  body?: unknown,
  opts?: FetchOptions,
) {
  return request<T>("PATCH", path, body, opts);
}

export function adminPut<T>(path: string, body?: unknown, opts?: FetchOptions) {
  return request<T>("PUT", path, body, opts);
}

export function adminDelete<T>(path: string, opts?: FetchOptions) {
  return request<T>("DELETE", path, undefined, opts);
}

/* ─── Cache revalidation helper ─── */

export function revalidateCache(tag: string) {
  return fetch("/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tag }),
  }).catch(() => {});
}

/* ─── File upload helper ─── */

export async function adminUpload<T>(
  file: File,
  folder: string,
  opts?: FetchOptions,
): Promise<T> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch(`${PROXY_BASE}/upload`, {
    method: "POST",
    body: formData,
    signal: opts?.signal,
  });

  if (res.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      const retry = await fetch(`${PROXY_BASE}/upload`, {
        method: "POST",
        body: formData,
        signal: opts?.signal,
      });
      if (!retry.ok) {
        const err = await retry.json().catch(() => ({}));
        throw new Error(err.message || err.error || `Upload failed (${retry.status})`);
      }
      const json = await retry.json();
      return (json.data ?? json) as T;
    }
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || `Upload failed (${res.status})`);
  }

  const json = await res.json();
  return (json.data ?? json) as T;
}
