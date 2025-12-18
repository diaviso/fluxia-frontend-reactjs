import { useEffect, useState } from 'react';
import { AdminLayout, DataTable, Modal, Button, Badge, FormField, Input, Select, Checkbox } from '../../components/admin';
import { matiereService, type Matiere } from '../../services/matiere.service';
import type { Column } from '../../components/admin/DataTable';

const TYPES = [
  { value: 'CONSOMMABLE', label: 'Consommable' },
  { value: 'DURABLE', label: 'Durable' },
];

const CATEGORIES = [
  { value: 'INFORMATIQUE', label: 'Informatique' },
  { value: 'MOBILIER', label: 'Mobilier' },
  { value: 'FOURNITURE', label: 'Fourniture' },
  { value: 'VEHICULE', label: 'Véhicule' },
  { value: 'EQUIPEMENT', label: 'Équipement' },
  { value: 'MATERIEL_MEDICAL', label: 'Matériel Médical' },
  { value: 'PRODUIT_ENTRETIEN', label: 'Produit d\'Entretien' },
  { value: 'PAPETERIE', label: 'Papeterie' },
  { value: 'AUTRE', label: 'Autre' },
];

const UNITES = [
  { value: 'PIECE', label: 'Pièce' },
  { value: 'LOT', label: 'Lot' },
  { value: 'BOITE', label: 'Boîte' },
  { value: 'PAQUET', label: 'Paquet' },
  { value: 'KG', label: 'Kilogramme' },
  { value: 'GRAMME', label: 'Gramme' },
  { value: 'LITRE', label: 'Litre' },
  { value: 'MILLILITRE', label: 'Millilitre' },
  { value: 'METRE', label: 'Mètre' },
  { value: 'METRE_CARRE', label: 'Mètre Carré' },
  { value: 'CARTON', label: 'Carton' },
  { value: 'PALETTE', label: 'Palette' },
];

export default function AdminMatieres() {
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMatiere, setEditingMatiere] = useState<Matiere | null>(null);
  const [deleteModal, setDeleteModal] = useState<Matiere | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    designation: '',
    type: 'CONSOMMABLE',
    categorie: 'AUTRE',
    unite: 'PIECE',
    valeurUnitaire: '',
    seuilAlerte: '',
    actif: true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await matiereService.getAll();
      setMatieres(data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.designation.trim()) newErrors.designation = 'La désignation est requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const data = {
        code: formData.code || undefined,
        designation: formData.designation,
        type: formData.type,
        categorie: formData.categorie,
        unite: formData.unite,
        valeurUnitaire: formData.valeurUnitaire ? parseFloat(formData.valeurUnitaire) : undefined,
        seuilAlerte: formData.seuilAlerte ? parseInt(formData.seuilAlerte) : undefined,
        actif: formData.actif,
      };

      if (editingMatiere) {
        await matiereService.update(editingMatiere.id, data);
      } else {
        await matiereService.create(data);
      }
      await loadData();
      closeModal();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await matiereService.delete(deleteModal.id);
      await loadData();
      setDeleteModal(null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const openCreateModal = () => {
    setEditingMatiere(null);
    setFormData({
      code: '',
      designation: '',
      type: 'CONSOMMABLE',
      categorie: 'AUTRE',
      unite: 'PIECE',
      valeurUnitaire: '',
      seuilAlerte: '',
      actif: true,
    });
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (matiere: Matiere) => {
    setEditingMatiere(matiere);
    setFormData({
      code: matiere.code,
      designation: matiere.designation,
      type: matiere.type,
      categorie: matiere.categorie,
      unite: matiere.unite,
      valeurUnitaire: matiere.valeurUnitaire?.toString() || '',
      seuilAlerte: matiere.seuilAlerte?.toString() || '',
      actif: matiere.actif,
    });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMatiere(null);
    setErrors({});
  };

  const getCategoryLabel = (cat: string) => {
    return CATEGORIES.find(c => c.value === cat)?.label || cat;
  };

  const getUniteLabel = (unite: string) => {
    return UNITES.find(u => u.value === unite)?.label || unite;
  };

  const columns: Column<Matiere>[] = [
    {
      key: 'designation',
      header: 'Matière',
      sortable: true,
      render: (matiere) => (
        <div style={styles.matiereCell}>
          <div style={{
            ...styles.matiereIcon,
            background: matiere.type === 'DURABLE' 
              ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
              : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          }}>
            📦
          </div>
          <div style={styles.matiereInfo}>
            <span style={styles.matiereName}>{matiere.designation}</span>
            <Badge variant="info" size="sm">{matiere.code}</Badge>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (matiere) => (
        <Badge variant={matiere.type === 'DURABLE' ? 'info' : 'warning'}>
          {matiere.type}
        </Badge>
      ),
    },
    {
      key: 'categorie',
      header: 'Catégorie',
      sortable: true,
      render: (matiere) => (
        <span style={styles.categoryBadge}>{getCategoryLabel(matiere.categorie)}</span>
      ),
    },
    {
      key: 'unite',
      header: 'Unité',
      render: (matiere) => getUniteLabel(matiere.unite),
    },
    {
      key: 'valeurUnitaire',
      header: 'Valeur',
      sortable: true,
      render: (matiere) => matiere.valeurUnitaire 
        ? <span style={styles.price}>{matiere.valeurUnitaire.toFixed(2)} €</span>
        : <span style={styles.muted}>-</span>,
    },
    {
      key: 'seuilAlerte',
      header: 'Seuil',
      render: (matiere) => matiere.seuilAlerte 
        ? <span style={styles.countBadge}>{matiere.seuilAlerte}</span>
        : <span style={styles.muted}>-</span>,
    },
    {
      key: 'actif',
      header: 'Statut',
      sortable: true,
      render: (matiere) => (
        <Badge variant={matiere.actif ? 'success' : 'danger'}>
          {matiere.actif ? 'Actif' : 'Inactif'}
        </Badge>
      ),
    },
  ];

  const renderActions = (matiere: Matiere) => (
    <div style={styles.actions}>
      <Button size="sm" variant="secondary" onClick={() => openEditModal(matiere)}>
        ✏️
      </Button>
      <Button size="sm" variant="danger" onClick={() => setDeleteModal(matiere)}>
        🗑️
      </Button>
    </div>
  );

  const activeMatieres = matieres.filter(m => m.actif).length;
  const durables = matieres.filter(m => m.type === 'DURABLE').length;
  const consommables = matieres.filter(m => m.type === 'CONSOMMABLE').length;

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Gestion des Matières</h1>
            <p style={styles.pageSubtitle}>Catalogue des matières et fournitures</p>
          </div>
          <Button variant="success" icon="+" onClick={openCreateModal}>
            Nouvelle Matière
          </Button>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{matieres.length}</span>
            <span style={styles.statLabel}>Total</span>
          </div>
          <div style={styles.statDivider}></div>
          <div style={styles.statItem}>
            <span style={{ ...styles.statValue, color: '#10b981' }}>{activeMatieres}</span>
            <span style={styles.statLabel}>Actives</span>
          </div>
          <div style={styles.statDivider}></div>
          <div style={styles.statItem}>
            <span style={{ ...styles.statValue, color: '#3b82f6' }}>{durables}</span>
            <span style={styles.statLabel}>Durables</span>
          </div>
          <div style={styles.statDivider}></div>
          <div style={styles.statItem}>
            <span style={{ ...styles.statValue, color: '#f59e0b' }}>{consommables}</span>
            <span style={styles.statLabel}>Consommables</span>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={matieres}
          columns={columns}
          loading={loading}
          searchPlaceholder="Rechercher une matière..."
          searchKeys={['code', 'designation', 'categorie', 'type']}
          actions={renderActions}
          emptyMessage="Aucune matière trouvée"
        />

        {/* Create/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={editingMatiere ? 'Modifier la matière' : 'Nouvelle matière'}
          size="lg"
          footer={
            <>
              <Button variant="secondary" onClick={closeModal}>Annuler</Button>
              <Button 
                variant="primary" 
                onClick={handleSubmit}
                loading={submitting}
              >
                {editingMatiere ? 'Modifier' : 'Créer'}
              </Button>
            </>
          }
        >
          <div style={styles.form}>
            <div style={styles.formRow}>
              <FormField label="Code" error={errors.code}>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="Auto-généré (MAT-XXXX)"
                  hasError={!!errors.code}
                />
              </FormField>

              <FormField label="Désignation" required error={errors.designation}>
                <Input
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="Ex: Ordinateur portable"
                  hasError={!!errors.designation}
                />
              </FormField>
            </div>

            <div style={styles.formRow}>
              <FormField label="Type" required>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  options={TYPES}
                />
              </FormField>

              <FormField label="Catégorie" required>
                <Select
                  value={formData.categorie}
                  onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                  options={CATEGORIES}
                />
              </FormField>

              <FormField label="Unité" required>
                <Select
                  value={formData.unite}
                  onChange={(e) => setFormData({ ...formData, unite: e.target.value })}
                  options={UNITES}
                />
              </FormField>
            </div>

            <div style={styles.formRow}>
              <FormField label="Valeur unitaire (€)" hint="Prix unitaire de la matière">
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valeurUnitaire}
                  onChange={(e) => setFormData({ ...formData, valeurUnitaire: e.target.value })}
                  placeholder="0.00"
                />
              </FormField>

              <FormField label="Seuil d'alerte" hint="Quantité minimale avant alerte">
                <Input
                  type="number"
                  value={formData.seuilAlerte}
                  onChange={(e) => setFormData({ ...formData, seuilAlerte: e.target.value })}
                  placeholder="0"
                />
              </FormField>
            </div>

            <Checkbox
              label="Matière active (disponible pour les expressions de besoin)"
              checked={formData.actif}
              onChange={(checked) => setFormData({ ...formData, actif: checked })}
            />
          </div>
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={!!deleteModal}
          onClose={() => setDeleteModal(null)}
          title="Confirmer la suppression"
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeleteModal(null)}>Annuler</Button>
              <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
            </>
          }
        >
          {deleteModal && (
            <div style={styles.deleteContent}>
              <div style={styles.deleteIcon}>⚠️</div>
              <p style={styles.deleteText}>
                Êtes-vous sûr de vouloir supprimer la matière <strong>{deleteModal.designation}</strong> ?
              </p>
              <p style={styles.deleteWarning}>Cette action est irréversible.</p>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '4px 0 0 0',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '20px 24px',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748b',
  },
  statDivider: {
    width: '1px',
    height: '40px',
    background: '#e2e8f0',
  },
  matiereCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  matiereIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  matiereInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  matiereName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
  },
  categoryBadge: {
    padding: '4px 10px',
    background: '#f1f5f9',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#475569',
    fontWeight: '500',
  },
  price: {
    fontWeight: '600',
    color: '#10b981',
  },
  muted: {
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  countBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '28px',
    height: '28px',
    padding: '0 8px',
    background: '#f1f5f9',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  deleteContent: {
    textAlign: 'center',
    padding: '20px 0',
  },
  deleteIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  deleteText: {
    fontSize: '15px',
    color: '#475569',
    marginBottom: '8px',
  },
  deleteWarning: {
    fontSize: '13px',
    color: '#ef4444',
    fontWeight: '500',
  },
};
