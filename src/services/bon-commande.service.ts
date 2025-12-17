import api from './api';

export interface LigneBonCommande {
  id: number;
  description: string;
  quantite: number;
  prixUnitaire: number;
  matiereCode: string;
  matiereNom: string;
  unite: string;
}

export interface BonCommande {
  id: number;
  numero: string;
  expressionId: number;
  dateEmission: string;
  fournisseur?: string;
  adresseLivraison?: string;
  tauxTVA: number;
  remise: number;
  observations?: string;
  lignes: LigneBonCommande[];
  expression?: {
    id: number;
    titre: string;
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
    createur: {
      id: number;
      email: string;
      nom: string | null;
      prenom: string | null;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBonCommandeDto {
  expressionId: number;
  fournisseur?: string;
  adresseLivraison?: string;
  tauxTVA?: number;
  remise?: number;
  observations?: string;
  lignes: {
    description: string;
    quantite: number;
    prixUnitaire: number;
    matiereCode: string;
    matiereNom: string;
    unite: string;
  }[];
}

export const bonCommandeService = {
  getAll: async (): Promise<BonCommande[]> => {
    const response = await api.get('/bon-commande');
    return response.data;
  },

  getById: async (id: number): Promise<BonCommande> => {
    const response = await api.get(`/bon-commande/${id}`);
    return response.data;
  },

  getByExpression: async (expressionId: number): Promise<BonCommande | null> => {
    try {
      const response = await api.get(`/bon-commande/expression/${expressionId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  create: async (data: CreateBonCommandeDto): Promise<BonCommande> => {
    const response = await api.post('/bon-commande', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateBonCommandeDto>): Promise<BonCommande> => {
    const response = await api.patch(`/bon-commande/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/bon-commande/${id}`);
  },

  regenerate: async (id: number, data: Partial<CreateBonCommandeDto>): Promise<BonCommande> => {
    const response = await api.post(`/bon-commande/${id}/regenerate`, data);
    return response.data;
  },

  downloadPDF: async (id: number) => {
    try {
      const response = await api.get(`/bon-commande/${id}/pdf`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bon-commande-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  },

  downloadExpressionPDF: async (expressionId: number) => {
    try {
      const response = await api.get(`/bon-commande/expression/${expressionId}/pdf`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expression-${expressionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading expression PDF:', error);
      throw error;
    }
  },
};
