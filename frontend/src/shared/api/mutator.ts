const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const customInstance = async <T>(config: {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}): Promise<T> => {
  const { url, method, params, data, headers = {}, signal } = config;

  // URLにクエリパラメータを追加
  let requestUrl = `${API_BASE_URL}${url}`;
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    const queryString = queryParams.toString();
    if (queryString) {
      requestUrl += `?${queryString}`;
    }
  }

  const requestOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    signal,
  };

  if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
    requestOptions.body = JSON.stringify(data);
  }

  const response = await fetch(requestUrl, requestOptions);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  // 204 No Contentなどの場合は空のオブジェクトを返す
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return {} as T;
  }

  return response.json();
};

// 後方互換性のためのmutator関数
export async function mutator<T>(url: string, options?: RequestInit): Promise<T> {
  return customInstance<T>({
    url,
    method: (options?.method as any) || "GET",
    data: options?.body ? JSON.parse(options.body as string) : undefined,
    headers: options?.headers as Record<string, string>,
  });
}
