/**
 * API Configuration with environment variable support
 */

const getApiBaseUrl = (): string => {
  // Try to get from environment variable (set in .env or Vite config)
  const envUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (envUrl) {
    return envUrl;
  }

  // Fallback to hostname-based detection
  const host = window.location.hostname.toLowerCase();
  if (host === "galaretkarnia.pl" || host === "www.galaretkarnia.pl") {
    return "https://galaretkarnia.onrender.com";
  }

  // For localhost/dev, use relative paths (API proxied in vite.config.ts)
  return "";
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Build full API URL with base URL and path
 */
export function buildApiUrl(path: string): string {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

/**
 * Fetch wrapper with error handling and timeout
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs = 10000
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildApiUrl(path), {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(`Request timeout after ${timeoutMs}ms`);
      }
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
