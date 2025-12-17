import api from './api';

export interface Division {
  id: number;
  nom: string;
  code: string;
  directeurId?: number;
  directeur?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
  services?: Service[];
  _count?: {
    users: number;
    expressions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: number;
  nom: string;
  code: string;
  divisionId: number;
}

export interface CreateDivisionDto {
  nom: string;
  code: string;
  directeurId?: number;
}

export interface UpdateDivisionDto {
  nom?: string;
  code?: string;
  directeurId?: number;
}

export const divisionService = {
  async getAll(): Promise<Division[]> {
    const response = await api.get('/division');
    return response.data;
  },

  async getById(id: number): Promise<Division> {
    const response = await api.get(`/division/${id}`);
    return response.data;
  },

  async create(data: CreateDivisionDto): Promise<Division> {
    const response = await api.post('/division', data);
    return response.data;
  },

  async update(id: number, data: UpdateDivisionDto): Promise<Division> {
    const response = await api.patch(`/division/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/division/${id}`);
  },
};
