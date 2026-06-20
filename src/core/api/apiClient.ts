import axios from 'axios';
import { API_BASE_URLS } from '../constants/api';

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

const interceptors = (instance: ReturnType<typeof axios.create>) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
};

[treatmentApi, appointmentApi, followUpApi, analysisApi].forEach(interceptors);
