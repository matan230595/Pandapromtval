import { auth } from '../firebase';

export async function apiFetch(resource: string | URL | Request, config?: RequestInit, maxRetries = 3): Promise<Response> {
  let url = '';
  if (typeof resource === 'string') {
    url = resource;
  } else if (resource instanceof URL) {
    url = resource.toString();
  } else if (resource instanceof Request) {
    url = resource.url;
  }

  let finalConfig = config || {};
  
  if (url.startsWith('/api/gemini/')) {
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      finalConfig.headers = {
        ...finalConfig.headers,
        'Authorization': `Bearer ${token}`
      };
    }
  }

  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const res = await fetch(resource, finalConfig);
      // If server returns 429 or 503, retry with backoff
      if ((res.status === 429 || res.status === 503) && attempt < maxRetries - 1) {
        attempt++;
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
        continue;
      }
      return res;
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) throw err;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
    }
  }

  return fetch(resource, finalConfig);
}

