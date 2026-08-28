import { useCallback } from 'react';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api';

export function useApi() {
  const request = useCallback(async (endpoint, options = {}) => {
    const token = localStorage.getItem('pnz-token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    // Jeśli status to 204 No Content, nie próbujemy parsować JSONa
    if (response.status === 204) {
        return null;
    }

    return response.json();
  }, []);

  const get = useCallback((endpoint) => request(endpoint, { method: 'GET' }), [request]);
  const post = useCallback((endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }), [request]);
  const patch = useCallback((endpoint, body) => request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }), [request]);
  const del = useCallback((endpoint) => request(endpoint, { method: 'DELETE' }), [request]);

  return { get, post, patch, del };
}

export default useApi;
