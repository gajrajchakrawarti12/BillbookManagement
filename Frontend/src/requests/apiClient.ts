import API_URL from "./requests";

interface ApiErrorBody {
  error?: string;
  message?: string;
}

let refreshPromise: Promise<boolean> | null = null;

function canRefreshFor(path: string) {
  const pathname = path.startsWith("http") ? new URL(path).pathname : path;
  return ![
    "/auth/login",
    "/auth/register",
    "/auth/refresh",
    "/auth/logout",
  ].some((endpoint) => pathname.endsWith(endpoint));
}

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  canRetry = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && canRetry && canRefreshFor(path)) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return apiRequest<T>(path, options, false);
    }
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as ApiErrorBody;
      message = body.error || body.message || message;
    } catch {
      // Keep the HTTP status when the server does not return JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
