import axios, { AxiosError } from 'axios';
import i18n from '../i18n';

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
    if (error.response) {
      const status = error.response.status;
      const errorMessage = (error.response.data as { message: string })?.message || 'Unexpected error';

      if (status === 401 && errorMessage === 'Token is not valid') {
        logout();
      } else if (status >= 400) {
        // Every other 4xx/5xx (400/403/404/409/500/...) was previously
        // swallowed silently here — surface it the same way a 401 already
        // was, so a failed add/update/delete/move isn't a silent no-op.
        showErrorModal(errorMessage);
      }
    } else {
      // No response at all: network failure, or the request never completed
      // (e.g. a Render cold-start timeout). Previously unhandled.
      showErrorModal(i18n.t('common.networkError'));
    }
    return Promise.reject(error);
  }
);

export default api;