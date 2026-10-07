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

export async function apiFetchSse<T>(
  path: string,
  init: RequestInit,
  onEvent: (event: T) => void,
): Promise<void> {
  const response = await fetch(`${API_URL}${path}`, init);
  if (!response.ok || !response.body) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const event of events) {
      const eventType = event
        .split('\n')
        .find((line) => line.startsWith('event: '))
        ?.slice(7);
      const data = event
        .split('\n')
        .find((line) => line.startsWith('data: '))
        ?.slice(6);
      if (data) {
        if (eventType === 'error') {
          const error = JSON.parse(data) as { message?: string };
          throw new Error(error.message || 'Unable to stream the answer.');
        }
        onEvent(JSON.parse(data) as T);
      }
    }

    if (done) {
      break;
    }
  }
}
