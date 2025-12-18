import api from './api';

export interface Matiere {
  id: number;
  code: string;
  designation: string;
  type: string;
  categorie: string;
  unite: string;
  valeurUnitaire?: number;
  seuilAlerte?: number;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMatiereDto {
  designation: string;
  type: string;
  categorie: string;
  unite: string;
  valeurUnitaire?: number;
  seuilAlerte?: number;
  actif?: boolean;
  code?: string;
}

export const matiereService = {
  getAll: async (): Promise<Matiere[]> => {
    const response = await api.get('/matieres');
    return response.data;
  },

  getById: async (id: number): Promise<Matiere> => {
    const response = await api.get(`/matieres/${id}`);
    return response.data;
  },

  create: async (data: CreateMatiereDto): Promise<Matiere> => {
    const response = await api.post('/matieres', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateMatiereDto>): Promise<Matiere> => {
    const response = await api.patch(`/matieres/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/matieres/${id}`);
  },

  getByType: async (type: string): Promise<Matiere[]> => {
    const response = await api.get(`/matieres?type=${type}`);
    return response.data;
  },
};
