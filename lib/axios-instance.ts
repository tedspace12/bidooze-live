import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      throw error.response.data || error;
    } else if (error.request) {
      // Request made but no response
      throw new Error('No response from server');
    } else {
      // Error in request setup
      throw error;
    }
  }
);

export default axiosInstance;
