import { createClient } from './supabase/client';

export const getAuthToken = async () => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

const API_ORIGIN = (() => {
  const rawUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!rawUrl) return 'http://localhost:4000';
  return rawUrl.replace(/\/api\/?$/, '');
})();

const API_BASE_URL = `${API_ORIGIN}/api`;

export const apiClient = {
  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await getAuthToken();
    
    const isFormData = options.body instanceof FormData;
    const headers = new Headers(options.headers || {});
    if (!isFormData) {
      headers.set('Content-Type', 'application/json');
    }
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Try to parse error message from backend
      let errorMessage = 'An error occurred during the request';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        if (errorData.details) {
          errorMessage += `: ${JSON.stringify(errorData.details)}`;
        }
      } catch (e) {
        // Not JSON
        errorMessage = response.statusText;
      }
      throw new Error(errorMessage);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  },

  get<T>(endpoint: string, options?: RequestInit) {
    return this.fetch<T>(endpoint, { ...options, method: 'GET' });
  },

  getBlob(endpoint: string, options?: RequestInit): Promise<Blob> {
    return (async () => {
      const token = await getAuthToken();
      const headers = new Headers(options?.headers || {});
      if (token) headers.set('Authorization', `Bearer ${token}`);
      const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const response = await fetch(url, { ...options, method: 'GET', headers });
      if (!response.ok) {
        let errorMessage = response.statusText;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          if (errorData.details) {
            errorMessage += `: ${JSON.stringify(errorData.details)}`;
          }
        } catch (e) {
          // Not JSON
        }
        throw new Error(errorMessage);
      }
      return response.blob();
    })();
  },

  post<T>(endpoint: string, body: any, options?: RequestInit) {
    const isFormData = body instanceof FormData;
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  put<T>(endpoint: string, body: any, options?: RequestInit) {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  patch<T>(endpoint: string, body: any, options?: RequestInit) {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  delete<T>(endpoint: string, options?: RequestInit) {
    return this.fetch<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
