import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_GATEWAY_URL,
  timeout: 10000,
  withCredentials: true, // Send cookies (refresh_token + access_token) automatically
});

/* ── helpers ── */

function getAccessTokenFromCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('access_token='));
  if (!match) return undefined;
  try {
    return decodeURIComponent(match.substring('access_token='.length));
  } catch {
    return match.substring('access_token='.length);
  }
}

/* ── Refresh-token lock ──
 *
 * When multiple requests receive a 401 simultaneously we must only call
 * /auth/refresh ONCE; the rest queue behind the same promise.
 */
let refreshPromise: Promise<boolean> | null = null;

function getRefreshTokenFromCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('refresh_token='));
  if (!match) return undefined;
  try {
    return decodeURIComponent(match.substring('refresh_token='.length));
  } catch {
    return match.substring('refresh_token='.length);
  }
}

async function tryRefreshToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshTokenFromCookie();
      if (!refreshToken) return false;

      // POST /api/auth/refresh — send the refresh token in the request body
      // because the gateway strips Set-Cookie headers from upstream responses.
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/auth/refresh`,
        { refreshToken },
        { withCredentials: true, timeout: 8000 },
      );

      // Update cookies from the response body since gateway strips Set-Cookie headers.
      if (res.data?.accessToken) {
        document.cookie = `access_token=${encodeURIComponent(res.data.accessToken)}; Path=/; Max-Age=900; SameSite=Lax`;
      }
      if (res.data?.refreshToken) {
        document.cookie = `refresh_token=${encodeURIComponent(res.data.refreshToken)}; Path=/; Max-Age=604800; SameSite=Lax`;
      }

      return res.status === 200;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/* ── Request interceptor ──
 *
 * Attach Bearer token from cookie.  Even though the gateway can read the
 * cookie directly, some service-to-service paths expect an Authorization
 * header, so we include both.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessTokenFromCookie();
    if (token) {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/* ── Response interceptor ──
 *
 * On 401 → silently try to refresh the access token.
 * If refresh succeeds → replay the original request.
 * If refresh fails  → redirect to login.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retried?: boolean };

    // Only attempt refresh for 401 responses from the server (not network errors)
    // and only if we haven't already retried this request.
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retried &&
      // Don't try to refresh if the failing request IS the refresh request
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      originalRequest._retried = true;

      const refreshed = await tryRefreshToken();

      if (refreshed) {
        // Cookies were updated from the JSON response body by tryRefreshToken().
        // Re-read the fresh access_token for the Authorization header.
        const newToken = getAccessTokenFromCookie();
        if (newToken) {
          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Authorization: `Bearer ${newToken}`,
          };
        }
        return apiClient(originalRequest);
      }

      // Refresh failed → redirect to login (client-side only)
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname + window.location.search;
        if (!currentPath.startsWith('/auth/login')) {
          window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    }

    if (!error.response) {
      console.error('Network error - please check your connection.');
    }

    return Promise.reject(error);
  },
);

export default apiClient;
