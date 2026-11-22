import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request.
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sgams_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth failures globally.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    if (status === 401 && !url.includes('/auth/login')) {
      localStorage.removeItem('sgams_token');
      localStorage.removeItem('sgams_user');
      window.dispatchEvent(new CustomEvent('auth:logout'));
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/** Unwrap the `{ success, ... }` envelope and surface a clean error message. */
export const request = async (method, url, data, config = {}) => {
  try {
    const { data: body } = await client.request({ method, url, data, ...config });
    return body;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED' ? 'Request timed out. Is the server running?' : null) ||
      error.message ||
      'Something went wrong';
    throw new Error(message);
  }
};

export default client;
