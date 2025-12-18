import api from './api';

export interface LigneReception {
  id: number;
  receptionId: number;
  ligneBonCommandeId: number;
  quantiteRecue: number;
  quantiteConforme: number;
  quantiteNonConforme: number;
  observations?: string;
  ligneBonCommande?: {
    id: number;
    description: string;
    quantite: number;
    quantiteRecue: number;
    prixUnitaire: number;
    matiereCode: string;
    matiereNom: string;
    unite: string;
  };
}

export interface Reception {
  id: number;
  numero: string;
  bonCommandeId: number;
  dateReception: string;
  livreur?: string;
  observations?: string;
  pvGenere: boolean;
  pvUrl?: string;
  lignes: LigneReception[];
  bonCommande?: {
    id: number;
    numero: string;
    fournisseur?: {
      id: number;
      raisonSociale: string;
    };
    expression?: {
      titre: string;
      numero: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateLigneReceptionDto {
  ligneBonCommandeId: number;
  quantiteRecue: number;
  quantiteConforme: number;
  quantiteNonConforme?: number;
  observations?: string;
}

export interface CreateReceptionDto {
  bonCommandeId: number;
  livreur?: string;
  observations?: string;
  lignes: CreateLigneReceptionDto[];
}

export interface ReceptionStats {
  bonCommandeId: number;
  statut: string;
  nombreReceptions: number;
  pourcentageGlobal: number;
  lignes: {
    ligneBonCommandeId: number;
    matiereNom: string;
    matiereCode: string;
    quantiteCommandee: number;
    quantiteRecue: number;
    quantiteConforme: number;
    quantiteNonConforme: number;
    quantiteRestante: number;
    pourcentageReception: number;
  }[];
}

export const receptionService = {
  async getAll(bonCommandeId?: number): Promise<Reception[]> {
    const url = bonCommandeId 
      ? `/receptions?bonCommandeId=${bonCommandeId}` 
      : '/receptions';
    const response = await api.get(url);
    return response.data;
  },

  async getOne(id: number): Promise<Reception> {
    const response = await api.get(`/receptions/${id}`);
    return response.data;
  },

  async getByBonCommande(bonCommandeId: number): Promise<Reception[]> {
    const response = await api.get(`/receptions/bon-commande/${bonCommandeId}`);
    return response.data;
  },

  async getStats(bonCommandeId: number): Promise<ReceptionStats> {
    const response = await api.get(`/receptions/stats/${bonCommandeId}`);
    return response.data;
  },

  async create(data: CreateReceptionDto): Promise<Reception> {
    const response = await api.post('/receptions', data);
    return response.data;
  },

  async update(id: number, data: { livreur?: string; observations?: string }): Promise<Reception> {
    const response = await api.patch(`/receptions/${id}`, data);
    return response.data;
  },

  async markPvGenerated(id: number, pvUrl?: string): Promise<Reception> {
    const response = await api.patch(`/receptions/${id}/pv-generated`, { pvUrl });
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/receptions/${id}`);
  },
};
