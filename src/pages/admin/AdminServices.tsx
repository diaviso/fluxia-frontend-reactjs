import { useEffect, useState } from 'react';
import { AdminLayout, DataTable, Modal, Button, Badge, FormField, Input, Select } from '../../components/admin';
import { serviceService, type Service } from '../../services/service.service';
import { divisionService, type Division } from '../../services/division.service';
import type { Column } from '../../components/admin/DataTable';

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteModal, setDeleteModal] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    divisionId: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [servicesData, divisionsData] = await Promise.all([
        serviceService.getAll(),
        divisionService.getAll(),
      ]);
      setServices(servicesData);
      setDivisions(divisionsData);
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
    if (!formData.divisionId) newErrors.divisionId = 'La division est requise';
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
        divisionId: Number(formData.divisionId),
      };

      if (editingService) {
        await serviceService.update(editingService.id, data);
      } else {
        await serviceService.create(data);
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
      await serviceService.delete(deleteModal.id);
      await loadData();
      setDeleteModal(null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({ nom: '', code: '', divisionId: '' });
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({
      nom: service.nom,
      code: service.code,
      divisionId: service.divisionId.toString(),
    });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({ nom: '', code: '', divisionId: '' });
    setErrors({});
  };

  const columns: Column<Service>[] = [
    {
      key: 'nom',
      header: 'Service',
      sortable: true,
      render: (service) => (
        <div style={styles.serviceCell}>
          <div style={styles.serviceIcon}>🔧</div>
          <div style={styles.serviceInfo}>
            <span style={styles.serviceName}>{service.nom}</span>
            <Badge variant="info" size="sm">{service.code}</Badge>
          </div>
        </div>
      ),
    },
    {
      key: 'division.nom',
      header: 'Division',
      sortable: true,
      render: (service) => service.division ? (
        <div style={styles.divisionCell}>
          <span style={styles.divisionBadge}>🏢 {service.division.nom}</span>
        </div>
      ) : <span style={styles.muted}>-</span>,
    },
    {
      key: '_count.expressions',
      header: 'Expressions',
      sortable: true,
      render: (service) => (
        <span style={styles.countBadge}>{service._count?.expressions || 0}</span>
      ),
    },
  ];

  const renderActions = (service: Service) => (
    <div style={styles.actions}>
      <Button size="sm" variant="secondary" onClick={() => openEditModal(service)}>
        ✏️ Modifier
      </Button>
      {service._count?.expressions === 0 && (
        <Button size="sm" variant="danger" onClick={() => setDeleteModal(service)}>
          🗑️ Supprimer
        </Button>
      )}
    </div>
  );

  // Group services by division for stats
  const servicesByDivision = divisions.map(d => ({
    division: d.nom,
    count: services.filter(s => s.divisionId === d.id).length,
  })).filter(d => d.count > 0);

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Gestion des Services</h1>
            <p style={styles.pageSubtitle}>Gérez les services au sein des divisions</p>
          </div>
          <Button variant="success" icon="+" onClick={openCreateModal}>
            Nouveau Service
          </Button>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{services.length}</span>
            <span style={styles.statLabel}>Total Services</span>
          </div>
          <div style={styles.statDivider}></div>
          <div style={styles.statItem}>
            <span style={{ ...styles.statValue, color: '#6366f1' }}>{divisions.length}</span>
            <span style={styles.statLabel}>Divisions</span>
          </div>
          {servicesByDivision.slice(0, 3).map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={styles.statDivider}></div>
              <div style={styles.statItem}>
                <span style={{ ...styles.statValue, color: '#10b981', fontSize: '20px' }}>{item.count}</span>
                <span style={styles.statLabel}>{item.division}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Data Table */}
        <DataTable
          data={services}
          columns={columns}
          loading={loading}
          searchPlaceholder="Rechercher un service..."
          searchKeys={['nom', 'code', 'division.nom']}
          actions={renderActions}
          emptyMessage="Aucun service trouvé"
        />

        {/* Create/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={editingService ? 'Modifier le service' : 'Nouveau service'}
          footer={
            <>
              <Button variant="secondary" onClick={closeModal}>Annuler</Button>
              <Button 
                variant="primary" 
                onClick={handleSubmit}
                loading={submitting}
              >
                {editingService ? 'Modifier' : 'Créer'}
              </Button>
            </>
          }
        >
          <div style={styles.form}>
            <FormField label="Nom du service" required error={errors.nom}>
              <Input
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Service Développement"
                hasError={!!errors.nom}
              />
            </FormField>

            <FormField label="Code" required error={errors.code} hint="Code unique pour identifier le service">
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Ex: DEV"
                hasError={!!errors.code}
              />
            </FormField>

            <FormField label="Division" required error={errors.divisionId}>
              <Select
                value={formData.divisionId}
                onChange={(e) => setFormData({ ...formData, divisionId: e.target.value })}
                placeholder="Sélectionner une division"
                hasError={!!errors.divisionId}
                options={divisions.map((division) => ({
                  value: division.id.toString(),
                  label: `${division.nom} (${division.code})`,
                }))}
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
                Êtes-vous sûr de vouloir supprimer le service <strong>{deleteModal.nom}</strong> ?
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
    flexWrap: 'wrap',
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
    textAlign: 'center',
  },
  statDivider: {
    width: '1px',
    height: '40px',
    background: '#e2e8f0',
  },
  serviceCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  serviceIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  serviceInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  serviceName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
  },
  divisionCell: {
    display: 'flex',
    alignItems: 'center',
  },
  divisionBadge: {
    padding: '6px 12px',
    background: '#ede9fe',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#5b21b6',
    fontWeight: '500',
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
