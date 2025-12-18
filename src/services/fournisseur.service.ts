import api from './api';

export interface Fournisseur {
  id: number;
  code: string;
  raisonSociale: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  ice?: string;
  rc?: string;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    bonsCommande: number;
  };
}

export interface CreateFournisseurDto {
  code?: string;
  raisonSociale: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  ice?: string;
  rc?: string;
  actif?: boolean;
}

export const fournisseurService = {
  async getAll(includeInactive = false): Promise<Fournisseur[]> {
    const response = await api.get(`/fournisseurs?includeInactive=${includeInactive}`);
    return response.data;
  },

  async getOne(id: number): Promise<Fournisseur> {
    const response = await api.get(`/fournisseurs/${id}`);
    return response.data;
  },

  async search(term: string): Promise<Fournisseur[]> {
    const response = await api.get(`/fournisseurs/search?term=${encodeURIComponent(term)}`);
    return response.data;
  },

  async create(data: CreateFournisseurDto): Promise<Fournisseur> {
    const response = await api.post('/fournisseurs', data);
    return response.data;
  },

  async update(id: number, data: Partial<CreateFournisseurDto>): Promise<Fournisseur> {
    const response = await api.patch(`/fournisseurs/${id}`, data);
    return response.data;
  },

  async toggleStatus(id: number): Promise<Fournisseur> {
    const response = await api.patch(`/fournisseurs/${id}/toggle-status`);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/fournisseurs/${id}`);
  },
};
