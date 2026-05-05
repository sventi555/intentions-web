const getBaseUrl = (): string => {
  return import.meta.env.VITE_API_HOST;
};

export const customFetch = <T>(
  url: string,
  options: RequestInit,
): Promise<T> => {
  const baseUrl = getBaseUrl();
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
  const fullUrl = `${baseUrl}${normalizedUrl}`;

  return fetch(fullUrl, options).then(async (res) => {
    if (res.status >= 500) {
      throw new Error();
    }

    const data = await res.json();

    return {
      status: res.status,
      data,
      headers: res.headers,
    };
  }) as Promise<T>;
};

export default customFetch;
