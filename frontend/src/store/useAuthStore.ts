import { create } from 'zustand';
import apiClient from '../api/client';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  register: (name: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/auth/register', { name, email, password });
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Registration failed. Please check your details.';
      set({ error: errMsg, isLoading: false });
      return false;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // Build form-urlencoded request for FastAPI OAuth2 login compatibilities
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const response = await apiClient.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      set({ token: access_token, isAuthenticated: true, error: null });
      
      // Load user profile details immediately on login
      await get().fetchProfile();
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Invalid email or password.';
      set({ error: errMsg, isLoading: false, isAuthenticated: false, token: null });
      localStorage.removeItem('token');
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<User>('/users/me');
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, error: null, isLoading: false });
    }
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put<User>('/users/me', profileData);
      set({ user: response.data, isLoading: false });
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Failed to update profile metrics.';
      set({ error: errMsg, isLoading: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
