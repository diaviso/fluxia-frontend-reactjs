import api from './api';

export interface Service {
  id: number;
  nom: string;
  code: string;
  divisionId: number;
  division?: {
    id: number;
    nom: string;
    code: string;
  };
  _count?: {
    expressions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDto {
  nom: string;
  code: string;
  divisionId: number;
}

export interface UpdateServiceDto {
  nom?: string;
  code?: string;
  divisionId?: number;
}

export const serviceService = {
  async getAll(): Promise<Service[]> {
    const response = await api.get('/service');
    return response.data;
  },

  async getByDivision(divisionId: number): Promise<Service[]> {
    const response = await api.get(`/service/by-division/${divisionId}`);
    return response.data;
  },

  async getById(id: number): Promise<Service> {
    const response = await api.get(`/service/${id}`);
    return response.data;
  },

  async create(data: CreateServiceDto): Promise<Service> {
    const response = await api.post('/service', data);
    return response.data;
  },

  async update(id: number, data: UpdateServiceDto): Promise<Service> {
    const response = await api.patch(`/service/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/service/${id}`);
  },
};
