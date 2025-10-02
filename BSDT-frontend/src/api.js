import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    let tokenString = localStorage.getItem('token');

    if (tokenString) {
      try {
        const tokenData = JSON.parse(tokenString);
        if (tokenData && tokenData.token) {
          tokenString = tokenData.token;
        }
      } catch (e) {
        // If it's not a JSON string, we assume tokenString is the token itself.
        // No action needed, just proceed.
      }
      config.headers['Authorization'] = `Bearer ${tokenString}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export default apiClient;