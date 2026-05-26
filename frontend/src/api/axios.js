import axios from 'axios';

const api = axios.create({
  baseURL: "https://hardware-backend-oifg.onrender.com/api", // ✅ PRODUCTION BACKEND
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error logging (important for debugging)
api.interceptors.response.use(
  res => res,
  err => {
    console.error("API ERROR:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default api;