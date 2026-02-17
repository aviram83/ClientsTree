import axios, { AxiosError } from 'axios';

let showErrorModal: (message: string) => void;
let logout: () => void;

export const injectShowErrorModal = (fn: (message: string) => void) => {
  showErrorModal = fn;
};

export const injectLogout = (fn: () => void) => {
  logout = fn;
}

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const errorMessage = (error.response.data as { message: string })?.message || 'Unauthorized';
      if (errorMessage === 'Token is not valid') {
        logout();
      } else {
        showErrorModal(errorMessage);
      }
    }
    return Promise.reject(error);
  }
);

export default api;