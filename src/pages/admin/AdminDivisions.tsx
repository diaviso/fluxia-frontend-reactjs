import { useEffect, useState } from 'react';
import { AdminLayout, DataTable, Modal, Button, Badge, FormField, Input, Select } from '../../components/admin';
import { divisionService, type Division } from '../../services/division.service';
import { adminService } from '../../services/admin.service';
import type { Column } from '../../components/admin/DataTable';

export default function AdminDivisions() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [deleteModal, setDeleteModal] = useState<Division | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    directeurId: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [divisionsData, usersData] = await Promise.all([
        divisionService.getAll(),
        adminService.getAllUsers(),
      ]);
      setDivisions(divisionsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.code.trim()) newErrors.code = 'Le code est requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const data = {
        nom: formData.nom,
        code: formData.code,
        directeurId: formData.directeurId ? Number(formData.directeurId) : undefined,
      };

      if (editingDivision) {
        await divisionService.update(editingDivision.id, data);
      } else {
        await divisionService.create(data);
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
      await divisionService.delete(deleteModal.id);
      await loadData();
      setDeleteModal(null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const openCreateModal = () => {
    setEditingDivision(null);
    setFormData({ nom: '', code: '', directeurId: '' });
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (division: Division) => {
    setEditingDivision(division);
    setFormData({
      nom: division.nom,
      code: division.code,
      directeurId: division.directeurId?.toString() || '',
    });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDivision(null);
    setFormData({ nom: '', code: '', directeurId: '' });
    setErrors({});
  };

  const columns: Column<Division>[] = [
    {
      key: 'nom',
      header: 'Division',
      sortable: true,
      render: (division) => (
        <div style={styles.divisionCell}>
          <div style={styles.divisionIcon}>🏢</div>
          <div style={styles.divisionInfo}>
            <span style={styles.divisionName}>{division.nom}</span>
            <Badge variant="info" size="sm">{division.code}</Badge>
          </div>
        </div>
      ),
    },
    {
      key: 'directeur',
      header: 'Directeur',
      render: (division) => division.directeur ? (
        <div style={styles.directorCell}>
          <div style={styles.directorAvatar}>
            {division.directeur.prenom?.[0] || division.directeur.nom?.[0] || '?'}
          </div>
          <span>{division.directeur.prenom} {division.directeur.nom}</span>
        </div>
      ) : <span style={styles.muted}>Non assigné</span>,
    },
    {
      key: 'services',
      header: 'Services',
      render: (division) => (
        <span style={styles.countBadge}>{division.services?.length || 0}</span>
      ),
    },
    {
      key: '_count.users',
      header: 'Utilisateurs',
      sortable: true,
      render: (division) => (
        <span style={styles.countBadge}>{division._count?.users || 0}</span>
      ),
    },
    {
      key: '_count.expressions',
      header: 'Expressions',
      sortable: true,
      render: (division) => (
        <span style={styles.countBadge}>{division._count?.expressions || 0}</span>
      ),
    },
  ];

  const renderActions = (division: Division) => (
    <div style={styles.actions}>
      <Button size="sm" variant="secondary" onClick={() => openEditModal(division)}>
        ✏️ Modifier
      </Button>
      {division._count?.expressions === 0 && (
        <Button size="sm" variant="danger" onClick={() => setDeleteModal(division)}>
          🗑️ Supprimer
        </Button>
      )}
    </div>
  );

  const totalUsers = divisions.reduce((acc, d) => acc + (d._count?.users || 0), 0);
  const totalServices = divisions.reduce((acc, d) => acc + (d.services?.length || 0), 0);

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Gestion des Divisions</h1>
            <p style={styles.pageSubtitle}>Organisez la structure de votre entreprise</p>
          </div>
          <Button variant="success" icon="+" onClick={openCreateModal}>
            Nouvelle Division
          </Button>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{divisions.length}</span>
            <span style={styles.statLabel}>Divisions</span>
          </div>
          <div style={styles.statDivider}></div>
          <div style={styles.statItem}>
            <span style={{ ...styles.statValue, color: '#6366f1' }}>{totalServices}</span>
            <span style={styles.statLabel}>Services</span>
          </div>
          <div style={styles.statDivider}></div>
          <div style={styles.statItem}>
            <span style={{ ...styles.statValue, color: '#10b981' }}>{totalUsers}</span>
            <span style={styles.statLabel}>Utilisateurs</span>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={divisions}
          columns={columns}
          loading={loading}
          searchPlaceholder="Rechercher une division..."
          searchKeys={['nom', 'code']}
          actions={renderActions}
          emptyMessage="Aucune division trouvée"
        />

        {/* Create/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={editingDivision ? 'Modifier la division' : 'Nouvelle division'}
          footer={
            <>
              <Button variant="secondary" onClick={closeModal}>Annuler</Button>
              <Button 
                variant="primary" 
                onClick={handleSubmit}
                loading={submitting}
              >
                {editingDivision ? 'Modifier' : 'Créer'}
              </Button>
            </>
          }
        >
          <div style={styles.form}>
            <FormField label="Nom de la division" required error={errors.nom}>
              <Input
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Direction Informatique"
                hasError={!!errors.nom}
              />
            </FormField>

            <FormField label="Code" required error={errors.code} hint="Code unique pour identifier la division">
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Ex: DI"
                hasError={!!errors.code}
              />
            </FormField>

            <FormField label="Directeur">
              <Select
                value={formData.directeurId}
                onChange={(e) => setFormData({ ...formData, directeurId: e.target.value })}
                placeholder="Sélectionner un directeur (optionnel)"
                options={[
                  { value: '', label: 'Aucun directeur' },
                  ...users.map((user) => ({
                    value: user.id.toString(),
                    label: `${user.prenom} ${user.nom} (${user.email})`,
                  })),
                ]}
              />
            </FormField>
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
                Êtes-vous sûr de vouloir supprimer la division <strong>{deleteModal.nom}</strong> ?
              </p>
              <p style={styles.deleteWarning}>
                Cette action supprimera également tous les services associés.
              </p>
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
  divisionCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  divisionIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  divisionInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  divisionName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
  },
  directorCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  directorAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
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
