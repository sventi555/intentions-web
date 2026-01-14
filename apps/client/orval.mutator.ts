// custom-fetch.ts

/**
 * Get the base URL from environment variables
 */
const getBaseUrl = (): string => {
  return import.meta.env.VITE_API_HOST;
};

/**
 * Custom fetch mutator for Orval
 * Simply prepends the base URL and delegates to native fetch
 */
export const customFetch = <T>(
  url: string,
  options: RequestInit,
): Promise<T> => {
  const baseUrl = getBaseUrl();
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
  const fullUrl = `${baseUrl}${normalizedUrl}`;

  return fetch(fullUrl, options) as Promise<T>;
};

export default customFetch;
