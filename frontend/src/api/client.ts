import type { ApiErrorBody } from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const TOKEN_KEY = 'fc_admin_token';

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string> | null;

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.status = body.status;
    this.fieldErrors = body.fieldErrors;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number | undefined>;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, query } = options;

  let url = `${BASE_URL}${path}`;
  if (query) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, String(value));
      }
    });
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && auth) {
    clearToken();
  }

  if (!response.ok) {
    let errorBody: ApiErrorBody;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = { status: response.status, message: 'Something went wrong. Please try again.' };
    }
    throw new ApiError(errorBody);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/csv')) {
    return (await response.text()) as unknown as T;
  }
  if (contentType.includes('application/pdf')) {
    return (await response.blob()) as unknown as T;
  }

  return (await response.json()) as T;
}
