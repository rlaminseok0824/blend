const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tteokyi.com';

export class ApiException extends Error {
  constructor(
    public code: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: HeadersInit;
  isFormData?: boolean;
};

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers, isFormData } = options;

  const config: RequestInit = {
    method,
    credentials: 'include',
  };

  // FormData일 때는 headers를 설정하지 않아야 브라우저가 Content-Type을 자동 설정
  if (isFormData) {
    if (headers) {
      config.headers = headers;
    }
    config.body = body as FormData;
  } else {
    config.headers = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (body) {
      config.body = JSON.stringify(body);
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Handle 401 Unauthorized - auto logout
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('blend.auth.user');
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      code?: unknown;
      message?: unknown;
      error?: { code?: unknown; message?: unknown };
    } | null;
    const details = payload?.error && typeof payload.error === 'object' ? payload.error : payload;
    const code = typeof details?.code === 'number' ? details.code : response.status === 403 ? 5004 : 5000;
    const message = typeof details?.message === 'string' ? details.message : `Request failed (${response.status})`;
    throw new ApiException(code, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  // Handle empty response body (e.g., login endpoint returns 200 with no body)
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text);
}
