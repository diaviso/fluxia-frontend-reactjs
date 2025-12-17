import axios from 'axios';

const API_URL = 'http://localhost:3000';

export interface Discussion {
  id: number;
  message: string;
  auteurId: number;
  expressionId: number;
  createdAt: string;
  updatedAt: string;
  auteur: {
    id: number;
    nom: string | null;
    prenom: string | null;
    email: string;
    photo: string | null;
    role: string;
  };
}

export interface CreateDiscussionDto {
  message: string;
  expressionId: number;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const discussionService = {
  async create(data: CreateDiscussionDto): Promise<Discussion> {
    const response = await axios.post(`${API_URL}/discussions`, data, getAuthHeaders());
    return response.data;
  },

  async getByExpression(expressionId: number): Promise<Discussion[]> {
    const response = await axios.get(
      `${API_URL}/discussions/expression/${expressionId}`,
      getAuthHeaders()
    );
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`${API_URL}/discussions/${id}`, getAuthHeaders());
  },
};
