// Custom fetch instance for Orval
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const customInstance = async <T>(
  config: RequestInit & { url: string; params?: Record<string, unknown> },
  options?: RequestInit,
): Promise<T> => {
  let url = `${API_BASE_URL}${config.url}`;

  // クエリパラメータを処理
  if (config.params) {
    const params = new URLSearchParams();
    Object.entries(config.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
      ...config.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.text();
      console.error('API Error Response:', errorBody);
      errorMessage += `\nResponse: ${errorBody}`;
    } catch (e) {
      console.error('Could not read error response body');
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

export default customInstance;

