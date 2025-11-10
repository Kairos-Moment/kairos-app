// frontend/src/api/axios.js
import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// You can also add interceptors here later for auth tokens

export default apiClient;