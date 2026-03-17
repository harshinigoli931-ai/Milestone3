import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach JWT token except for auth APIs
api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem('token');

    const isAuthRequest =
      config.url.includes('/auth/login') ||
      config.url.includes('/auth/register');

    if (token && !isAuthRequest) {
      console.log("api.js - Attaching token to:", config.url);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log("api.js - Skipping token for:", config.url);
    }

    return config;

  },
  (error) => Promise.reject(error)
);

// Response interceptor: redirect to login on unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("API error status:", error.response.status, "@", error.config.url);
    } else {
      console.error("API error (Network/No Response):", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;