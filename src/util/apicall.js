import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { LoginUrlByUser, GetUserByIdUrl, GetAdmissionsByUserUrl } from './url';

export const axiosInstance = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject Token & Check 2-Hour Expiry
axiosInstance.interceptors.request.use(
  (config) => {
    const { token, loginTime, logout } = useAuthStore.getState();

    if (token) {
      if (loginTime && Date.now() - loginTime > 2 * 60 * 60 * 1000) {
        logout(true);
        return Promise.reject(new Error('Session expired after 2 hours. Please login again.'));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Exception Handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message || error.response?.data?.error;
    const isLoginRequest = error.config?.url?.includes('/login');

    switch (status) {
      case 400:
        error.message = serverMessage || 'Invalid request. Please check your inputs.';
        break;

      case 401:
        if (isLoginRequest) {
          error.message = serverMessage || 'Invalid credentials. Please try again.';
        } else {
          error.message = 'Session expired. Please login again.';
          useAuthStore.getState().logout(true);
        }
        break;

      case 403:
        error.message = serverMessage || 'Access denied. You do not have permission.';
        break;

      case 404:
        error.message = serverMessage || 'Requested resource was not found.';
        break;

      case 500:
        error.message = serverMessage || 'Internal server error. Please try again later.';
        break;

      case 503:
        error.message = serverMessage || 'Service temporarily unavailable. Please try again later.';
        break;

      default:
        if (!error.response) {
          error.message = 'Network error. Please check your internet connection.';
        } else {
          error.message = serverMessage || 'An unexpected error occurred. Please try again.';
        }
    }

    return Promise.reject(error);
  }
);

export const getStoredUserData = () => useAuthStore.getState().user;

export const loginUser = async (email, password) => {
  try {
    const response = await axiosInstance.post(LoginUrlByUser, { email, password });
    if (response.data?.token) {
      useAuthStore.getState().login(response.data);
    }
    return response.data;
  } catch (error) {
    console.error('Login Error:', error.message);
    throw error;
  }
};

export const getUserById = async (id, role, email) => {
  try {
    const response = await axiosInstance.get(`${GetUserByIdUrl}/${id}`, {
      params: { role: role || 'user', email },
    });
    return response.data;
  } catch (error) {
    console.error('GetUserById Error:', error.message);
    throw error;
  }
};

export const getAdmissionsByUser = async (userId, email) => {
  try {
    if (!userId || !email) throw new Error('User ID and email are required.');

    const response = await axiosInstance.get(
      `${GetAdmissionsByUserUrl}/${encodeURIComponent(userId)}`,
      { params: { role: 'user', email } }
    );

    const admissions = Array.isArray(response.data)
      ? response.data
      : response.data?.data || [];

    return { success: true, data: admissions };
  } catch (error) {
    return { success: false, error: error.message, data: [] };
  }
};