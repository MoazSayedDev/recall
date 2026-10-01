export const API_URL = 'http://localhost:8000';

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});

  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let errorText = `Request failed with status ${response.status}`;

    try {
      const errorBody = await response.json();
      if (errorBody?.message) {
        errorText = errorBody.message;
      }
    } catch {
      try {
        errorText = await response.text();
      } catch {
        // no-op
      }
    }

    throw new Error(errorText || 'Request failed');
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return undefined as T;
}
