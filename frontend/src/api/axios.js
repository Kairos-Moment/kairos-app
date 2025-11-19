// frontend/src/api/axios.js

import axios from 'axios';

/**
 * Creates a pre-configured instance of Axios.
 * This instance will be used for all API calls throughout the application.
 */
const apiClient = axios.create({
  // The base URL for all API requests. It's read from an environment variable,
  // which allows us to easily switch between local and production environments.
  // In development, this will be '/api' to use the Vite proxy.
  baseURL: import.meta.env.VITE_API_BASE_URL,

  // --- THIS IS THE CRITICAL ADDITION ---
  // This option tells Axios to include credentials (like cookies) with every
  // cross-origin request. Without this, the browser will not send the session
  // cookie, and the backend will not be able to identify the logged-in user.
  withCredentials: true,
});

// You can also add interceptors here later. For example, an interceptor could
// automatically handle 401 errors by logging the user out.
//
// apiClient.interceptors.response.use(
//   response => response,
//   error => {
//     if (error.response && error.response.status === 401) {
//       // Handle unauthorized errors (e.g., redirect to login)
//       console.log("Session expired or user is not authenticated.");
//       // You could call a logout function from your AuthContext here.
//     }
//     return Promise.reject(error);
//   }
// );

export default apiClient;