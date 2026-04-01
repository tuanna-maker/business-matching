const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

interface ApiError {
  message: string;
  statusCode: number;
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
}

function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function refreshAccessToken(): Promise<string | null> {
  const rt = getRefreshToken();
  if (!rt) return null;

  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshQueue.push(resolve);
    });
  }

  isRefreshing = true;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: rt }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data = await res.json();
    const newAccessToken = data.access_token;
    const newRefreshToken = data.refresh_token || rt;
    setTokens(newAccessToken, newRefreshToken);

    refreshQueue.forEach((cb) => cb(newAccessToken));
    refreshQueue = [];

    return newAccessToken;
  } catch {
    clearTokens();
    return null;
  } finally {
    isRefreshing = false;
  }
}

async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((customHeaders as Record<string, string>) || {}),
  };

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

  let res = await fetch(url, { ...rest, headers });

  // Auto-refresh on 401
  if (res.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(url, { ...rest, headers });
    } else {
      clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw { message: "Session expired", statusCode: 401 } as ApiError;
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw {
      message: errorData.message || `Request failed (${res.status})`,
      statusCode: res.status,
    } as ApiError;
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

// Convenience methods
export const api = {
  get: <T = unknown>(endpoint: string, options?: ApiOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: ApiOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = unknown>(endpoint: string, body?: unknown, options?: ApiOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = unknown>(endpoint: string, options?: ApiOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
};

export { setTokens, clearTokens, getAccessToken, getRefreshToken };
export type { ApiError };
