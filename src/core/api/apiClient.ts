import axios from 'axios';
import { API_BASE_URLS } from '../constants/api';

export const identityApi = axios.create({
  baseURL: API_BASE_URLS.IDENTITY_SERVICE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const treatmentApi = axios.create({
  baseURL: API_BASE_URLS.TREATMENT_SERVICE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const appointmentApi = axios.create({
  baseURL: API_BASE_URLS.APPOINTMENT_SERVICE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const followUpApi = axios.create({
  baseURL: API_BASE_URLS.FOLLOW_UP_SERVICE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const analysisApi = axios.create({
  baseURL: API_BASE_URLS.ANALYSIS_SERVICE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const reminderApi = axios.create({
  baseURL: API_BASE_URLS.REMINDER_SERVICE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

const ALL_APIS = [identityApi, treatmentApi, appointmentApi, followUpApi, analysisApi, reminderApi];

const requestInterceptor = (instance: ReturnType<typeof axios.create>) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
};

const responseInterceptor = (instance: ReturnType<typeof axios.create>) => {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    },
  );
};

ALL_APIS.forEach((api) => {
  requestInterceptor(api);
  responseInterceptor(api);
});
