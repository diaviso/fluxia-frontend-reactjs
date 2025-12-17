import api from './api';

export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  photo?: string;
  role: 'AGENT' | 'VALIDATEUR' | 'ADMIN';
  actif: boolean;
  divisionId?: number;
  division?: {
    id: number;
    nom: string;
    code: string;
  };
  divisionDirigee?: {
    id: number;
    nom: string;
    code: string;
  };
  _count?: {
    expressionsDeBesoin: number;
  };
}

export interface ExpressionAdmin {
  id: number;
  titre: string;
  statut: 'BROUILLON' | 'EN_ATTENTE' | 'VALIDE' | 'REFUSE' | 'PRIS_EN_CHARGE';
  dateCreation: string;
  createur: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
  division: {
    id: number;
    nom: string;
    code: string;
  };
  service?: {
    id: number;
    nom: string;
    code: string;
  };
  _count?: {
    lignes: number;
  };
}

export const adminService = {
  // Gestion Utilisateurs
  async getAllUsers(): Promise<User[]> {
    const response = await api.get('/admin/users');
    return response.data;
  },

  async toggleUserStatus(userId: number, actif: boolean): Promise<User> {
    const response = await api.patch(`/admin/users/${userId}/status`, { actif });
    return response.data;
  },

  async updateUserRole(userId: number, role: 'AGENT' | 'VALIDATEUR' | 'ADMIN'): Promise<User> {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  async deleteUser(userId: number): Promise<void> {
    await api.delete(`/admin/users/${userId}`);
  },

  // Gestion Expressions
  async getAllExpressions(): Promise<ExpressionAdmin[]> {
    const response = await api.get('/admin/expressions');
    return response.data;
  },

  async getExpressionDetails(expressionId: number): Promise<any> {
    const response = await api.get(`/admin/expressions/${expressionId}`);
    return response.data;
  },

  async updateExpressionStatus(
    expressionId: number,
    statut: 'BROUILLON' | 'EN_ATTENTE' | 'VALIDE' | 'REFUSE' | 'PRIS_EN_CHARGE'
  ): Promise<ExpressionAdmin> {
    const response = await api.patch(`/admin/expressions/${expressionId}/status`, { statut });
    return response.data;
  },
};
