// src/store/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry

let sessionTimer = null;
let warningTimer = null;

const clearTimers = () => {
  if (sessionTimer) clearTimeout(sessionTimer);
  if (warningTimer) clearTimeout(warningTimer);
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      userRole: null,
      loginTime: null,
      isAuthenticated: false,
      isLoading: true,

      // Actions
      login: (loginResponse, roleParam = 'user') => {
        const token = loginResponse?.token;
        if (!token) return false;

        const role = roleParam || loginResponse.role || 'user';
        const userData = loginResponse.data || loginResponse.user || loginResponse;
        const now = Date.now();

        const normalizedUser = {
          ...userData,
          email: userData.email || loginResponse.email || null,
          role,
          id: userData.id || loginResponse.id || null,
        };

        set({
          user: normalizedUser,
          token,
          userRole: role,
          loginTime: now,
          isAuthenticated: true,
          isLoading: false,
        });

        get().startSessionTimer();
        return true;
      },

      logout: (showAlert = false) => {
        clearTimers();
        set({
          user: null,
          token: null,
          userRole: null,
          loginTime: null,
          isAuthenticated: false,
          isLoading: false,
        });

        if (showAlert) {
          Alert.alert('Session Expired', 'Your session has expired. Please login again.');
        }
      },

      startSessionTimer: () => {
        clearTimers();
        const { loginTime, logout } = get();
        if (!loginTime) return;

        const elapsedTime = Date.now() - loginTime;
        const remainingTime = SESSION_DURATION - elapsedTime;

        if (remainingTime <= 0) {
          logout(true);
          return;
        }

        if (remainingTime > WARNING_TIME) {
          warningTimer = setTimeout(() => {
            Alert.alert(
              'Session Warning',
              'Your session will expire in 5 minutes. Please save your work.'
            );
          }, remainingTime - WARNING_TIME);
        }

        sessionTimer = setTimeout(() => logout(true), remainingTime);
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const { loginTime, logout, startSessionTimer } = state;
          if (loginTime && Date.now() - loginTime > SESSION_DURATION) {
            logout(false);
          } else {
            startSessionTimer();
          }
          state.setLoading(false);
        }
      },
    }
  )
);