import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { fournisseurService, type Fournisseur, type CreateFournisseurDto } from '../../services/fournisseur.service';

const AdminFournisseurs = () => {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingFournisseur, setEditingFournisseur] = useState<Fournisseur | null>(null);
  const [formData, setFormData] = useState<CreateFournisseurDto>({
    code: '',
    raisonSociale: '',
    adresse: '',
    telephone: '',
    email: '',
    ice: '',
    rc: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadFournisseurs();
  }, [showInactive]);

  const loadFournisseurs = async () => {
    try {
      setLoading(true);
      const data = await fournisseurService.getAll(showInactive);
      setFournisseurs(data);
    } catch (err) {
      setError('Erreur lors du chargement des fournisseurs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingFournisseur) {
        await fournisseurService.update(editingFournisseur.id, formData);
        setSuccess('Fournisseur mis à jour avec succès');
      } else {
        await fournisseurService.create(formData);
        setSuccess('Fournisseur créé avec succès');
      }
      setShowModal(false);
      resetForm();
      loadFournisseurs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    }
  };

  const handleEdit = (fournisseur: Fournisseur) => {
    setEditingFournisseur(fournisseur);
    setFormData({
      code: fournisseur.code,
      raisonSociale: fournisseur.raisonSociale,
      adresse: fournisseur.adresse || '',
      telephone: fournisseur.telephone || '',
      email: fournisseur.email || '',
      ice: fournisseur.ice || '',
      rc: fournisseur.rc || '',
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await fournisseurService.toggleStatus(id);
      loadFournisseurs();
      setSuccess('Statut mis à jour');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) return;
    
    try {
      await fournisseurService.delete(id);
      loadFournisseurs();
      setSuccess('Fournisseur supprimé');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setEditingFournisseur(null);
    setFormData({
      code: '',
      raisonSociale: '',
      adresse: '',
      telephone: '',
      email: '',
      ice: '',
      rc: '',
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <AdminLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Gestion des Fournisseurs</h1>
            <p style={styles.subtitle}>Gérez les fournisseurs de l'entreprise</p>
          </div>
          <button style={styles.addButton} onClick={openCreateModal}>
            ➕ Nouveau Fournisseur
          </button>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}
        {success && <div style={styles.successAlert}>{success}</div>}

        <div style={styles.filters}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              style={styles.checkbox}
            />
            Afficher les fournisseurs inactifs
          </label>
        </div>

        {loading ? (
          <div style={styles.loading}>Chargement...</div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Code</th>
                  <th style={styles.th}>Raison Sociale</th>
                  <th style={styles.th}>Contact</th>
                  <th style={styles.th}>ICE / RC</th>
                  <th style={styles.th}>Bons de Commande</th>
                  <th style={styles.th}>Statut</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fournisseurs.map((f) => (
                  <tr key={f.id} style={!f.actif ? styles.inactiveRow : {}}>
                    <td style={styles.td}>
                      <span style={styles.code}>{f.code}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.raisonSociale}>{f.raisonSociale}</div>
                      {f.adresse && <div style={styles.adresse}>{f.adresse}</div>}
                    </td>
                    <td style={styles.td}>
                      {f.telephone && <div>📞 {f.telephone}</div>}
                      {f.email && <div>✉️ {f.email}</div>}
                    </td>
                    <td style={styles.td}>
                      {f.ice && <div><strong>ICE:</strong> {f.ice}</div>}
                      {f.rc && <div><strong>RC:</strong> {f.rc}</div>}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.badge}>{f._count?.bonsCommande || 0}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        ...(f.actif ? styles.activeStatus : styles.inactiveStatus)
                      }}>
                        {f.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          style={styles.actionBtn}
                          onClick={() => handleEdit(f)}
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          style={styles.actionBtn}
                          onClick={() => handleToggleStatus(f.id)}
                          title={f.actif ? 'Désactiver' : 'Activer'}
                        >
                          {f.actif ? '🔒' : '🔓'}
                        </button>
                        {(f._count?.bonsCommande || 0) === 0 && (
                          <button
                            style={{...styles.actionBtn, ...styles.deleteBtn}}
                            onClick={() => handleDelete(f.id)}
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {fournisseurs.length === 0 && (
              <div style={styles.emptyState}>
                Aucun fournisseur trouvé
              </div>
            )}
          </div>
        )}

        {showModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>
                  {editingFournisseur ? 'Modifier le Fournisseur' : 'Nouveau Fournisseur'}
                </h2>
                <button style={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      style={styles.input}
                      placeholder="Auto-généré (FRN-XXXX)"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Raison Sociale *</label>
                    <input
                      type="text"
                      value={formData.raisonSociale}
                      onChange={(e) => setFormData({ ...formData, raisonSociale: e.target.value })}
                      style={styles.input}
                      required
                      placeholder="Nom de l'entreprise"
                    />
                  </div>
                  <div style={styles.formGroupFull}>
                    <label style={styles.label}>Adresse</label>
                    <input
                      type="text"
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                      style={styles.input}
                      placeholder="Adresse complète"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Téléphone</label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      style={styles.input}
                      placeholder="+212 5XX XX XX XX"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={styles.input}
                      placeholder="contact@entreprise.ma"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>ICE</label>
                    <input
                      type="text"
                      value={formData.ice}
                      onChange={(e) => setFormData({ ...formData, ice: e.target.value })}
                      style={styles.input}
                      placeholder="Identifiant Commun de l'Entreprise"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>RC</label>
                    <input
                      type="text"
                      value={formData.rc}
                      onChange={(e) => setFormData({ ...formData, rc: e.target.value })}
                      style={styles.input}
                      placeholder="Registre de Commerce"
                    />
                  </div>
                </div>
                <div style={styles.modalActions}>
                  <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" style={styles.submitBtn}>
                    {editingFournisseur ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px',
  },
  addButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  filters: {
    marginBottom: '20px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#64748b',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  errorAlert: {
    padding: '12px 16px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#dc2626',
    marginBottom: '16px',
  },
  successAlert: {
    padding: '12px 16px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    color: '#16a34a',
    marginBottom: '16px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
  },
  tableContainer: {
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    background: '#f8fafc',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '16px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '14px',
    color: '#334155',
  },
  inactiveRow: {
    opacity: 0.6,
    background: '#f8fafc',
  },
  code: {
    fontFamily: 'monospace',
    background: '#f1f5f9',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: '600',
  },
  raisonSociale: {
    fontWeight: '600',
    color: '#1e293b',
  },
  adresse: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px',
  },
  badge: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  activeStatus: {
    background: '#dcfce7',
    color: '#16a34a',
  },
  inactiveStatus: {
    background: '#fee2e2',
    color: '#dc2626',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  actionBtn: {
    padding: '8px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.2s',
  },
  deleteBtn: {
    background: '#fef2f2',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: '20px',
    width: '600px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    color: '#64748b',
    cursor: 'pointer',
  },
  form: {
    padding: '24px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formGroupFull: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    gridColumn: '1 / -1',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0',
  },
  cancelBtn: {
    padding: '12px 24px',
    background: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default AdminFournisseurs;
