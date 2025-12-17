import api from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface User {
  id: number;
  email: string;
  nom: string | null;
  prenom: string | null;
  photo: string | null;
  role: 'AGENT' | 'VALIDATEUR' | 'ADMIN';
  actif: boolean;
  division: string | null;
  service: string | null;
  divisionDirigee?: { id: number; nom: string; code: string } | null;
}

export const authService = {
  loginWithGoogle: () => {
    window.location.href = `${API_URL}/auth/google`;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: {
    nom?: string;
    prenom?: string;
    division?: string;
    service?: string;
  }): Promise<User> => {
    const response = await api.patch('/auth/me', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  storeUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
};
