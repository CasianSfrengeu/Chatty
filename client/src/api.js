import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : '/api',
  withCredentials: true,
});

export default api; 