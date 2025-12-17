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
}

export interface LigneEB {
  id?: number;
  description: string;
  quantite: number;
  justification: string;
  matiereId: number;
  matiere?: Matiere;
}

export interface ExpressionDeBesoin {
  id: number;
  titre: string;
  divisionId: number;
  serviceId?: number;
  division?: {
    id: number;
    nom: string;
    code: string;
  };
  service?: {
    id: number;
    nom: string;
    code: string;
  };
  dateCreation: string;
  statut: 'BROUILLON' | 'EN_ATTENTE' | 'VALIDE' | 'REFUSE' | 'PRIS_EN_CHARGE';
  commentaireValidation?: string;
  createurId: number;
  createur?: {
    id: number;
    email: string;
    nom: string | null;
    prenom: string | null;
    photo: string | null;
    role: string;
  };
  lignes: LigneEB[];
}

export interface CreateExpressionDto {
  titre: string;
  divisionId: number;
  serviceId?: number;
  statut?: 'BROUILLON' | 'EN_ATTENTE';
  lignes?: {
    description: string;
    quantite: number;
    justification: string;
    matiereId: number;
  }[];
}

export const expressionService = {
  getAll: async (): Promise<ExpressionDeBesoin[]> => {
    const response = await api.get('/expressions-de-besoin');
    return response.data;
  },

  getById: async (id: number): Promise<ExpressionDeBesoin> => {
    const response = await api.get(`/expressions-de-besoin/${id}`);
    return response.data;
  },

  create: async (data: CreateExpressionDto): Promise<ExpressionDeBesoin> => {
    const response = await api.post('/expressions-de-besoin', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateExpressionDto>): Promise<ExpressionDeBesoin> => {
    const response = await api.patch(`/expressions-de-besoin/${id}`, data);
    return response.data;
  },

  updateStatut: async (
    id: number,
    statut: string,
    commentaire?: string
  ): Promise<ExpressionDeBesoin> => {
    const response = await api.patch(`/expressions-de-besoin/${id}/statut`, {
      statut,
      commentaire,
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/expressions-de-besoin/${id}`);
  },

  getByStatut: async (statut: string): Promise<ExpressionDeBesoin[]> => {
    const response = await api.get(`/expressions-de-besoin?statut=${statut}`);
    return response.data;
  },

  search: async (searchTerm: string): Promise<ExpressionDeBesoin[]> => {
    const response = await api.get(`/expressions-de-besoin?search=${encodeURIComponent(searchTerm)}`);
    return response.data;
  },
};
