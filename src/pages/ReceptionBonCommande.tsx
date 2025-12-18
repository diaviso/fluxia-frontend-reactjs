import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { bonCommandeService, type BonCommande } from '../services/bon-commande.service';
import { receptionService, type Reception, type ReceptionStats, type CreateReceptionDto } from '../services/reception.service';

export const ReceptionBonCommande = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bonCommande, setBonCommande] = useState<BonCommande | null>(null);
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [stats, setStats] = useState<ReceptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<{
    livreur: string;
    observations: string;
    lignes: {
      ligneBonCommandeId: number;
      quantiteRecue: number;
      quantiteConforme: number;
      quantiteNonConforme: number;
      observations: string;
    }[];
  }>({
    livreur: '',
    observations: '',
    lignes: [],
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const bcId = parseInt(id!, 10);
      const [bcData, receptionsData, statsData] = await Promise.all([
        bonCommandeService.getById(bcId),
        receptionService.getByBonCommande(bcId),
        receptionService.getStats(bcId),
      ]);
      setBonCommande(bcData);
      setReceptions(receptionsData);
      setStats(statsData);
    } catch (err) {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const openReceptionModal = () => {
    if (!bonCommande || !stats) return;
    
    setFormData({
      livreur: '',
      observations: '',
      lignes: stats.lignes
        .filter(l => l.quantiteRestante > 0)
        .map(l => ({
          ligneBonCommandeId: l.ligneBonCommandeId,
          quantiteRecue: 0,
          quantiteConforme: 0,
          quantiteNonConforme: 0,
          observations: '',
        })),
    });
    setShowModal(true);
  };

  const handleLigneChange = (index: number, field: string, value: number | string) => {
    const newLignes = [...formData.lignes];
    (newLignes[index] as any)[field] = value;
    
    if (field === 'quantiteRecue') {
      newLignes[index].quantiteConforme = value as number;
      newLignes[index].quantiteNonConforme = 0;
    }
    
    setFormData({ ...formData, lignes: newLignes });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const lignesAvecQuantite = formData.lignes.filter(l => l.quantiteRecue > 0);
    
    if (lignesAvecQuantite.length === 0) {
      setError('Veuillez saisir au moins une quantité reçue');
      return;
    }

    try {
      const dto: CreateReceptionDto = {
        bonCommandeId: parseInt(id!, 10),
        livreur: formData.livreur || undefined,
        observations: formData.observations || undefined,
        lignes: lignesAvecQuantite,
      };
      
      await receptionService.create(dto);
      setSuccess('Réception enregistrée avec succès');
      setShowModal(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'LIVRE': return { bg: '#dcfce7', color: '#16a34a' };
      case 'PARTIELLEMENT_LIVRE': return { bg: '#fef3c7', color: '#d97706' };
      case 'EN_ATTENTE': return { bg: '#e0e7ff', color: '#4f46e5' };
      case 'ANNULE': return { bg: '#fee2e2', color: '#dc2626' };
      default: return { bg: '#f1f5f9', color: '#64748b' };
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'LIVRE': return 'Livré';
      case 'PARTIELLEMENT_LIVRE': return 'Partiellement livré';
      case 'EN_ATTENTE': return 'En attente';
      case 'VALIDE': return 'Validé';
      case 'ANNULE': return 'Annulé';
      default: return statut;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={styles.loading}>Chargement...</div>
      </Layout>
    );
  }

  if (!bonCommande) {
    return (
      <Layout>
        <div style={styles.error}>Bon de commande non trouvé</div>
      </Layout>
    );
  }

  const statusStyle = getStatusColor(bonCommande.statut);

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate(-1)}>
            ← Retour
          </button>
          <div>
            <h1 style={styles.title}>Réception - {bonCommande.numero}</h1>
            <p style={styles.subtitle}>
              {bonCommande.expression?.titre} • {bonCommande.fournisseur?.raisonSociale || 'Fournisseur non défini'}
            </p>
          </div>
          <span style={{
            ...styles.statusBadge,
            background: statusStyle.bg,
            color: statusStyle.color,
          }}>
            {getStatusLabel(bonCommande.statut)}
          </span>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}
        {success && <div style={styles.successAlert}>{success}</div>}

        {/* Stats de réception */}
        {stats && (
          <div style={styles.statsSection}>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{stats.pourcentageGlobal}%</div>
                <div style={styles.statLabel}>Réception globale</div>
                <div style={styles.progressBar}>
                  <div style={{
                    ...styles.progressFill,
                    width: `${stats.pourcentageGlobal}%`,
                    background: stats.pourcentageGlobal === 100 ? '#16a34a' : '#6366f1',
                  }} />
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{stats.nombreReceptions}</div>
                <div style={styles.statLabel}>Réceptions effectuées</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>
                  {stats.lignes.filter(l => l.quantiteRestante > 0).length}
                </div>
                <div style={styles.statLabel}>Lignes en attente</div>
              </div>
            </div>
          </div>
        )}

        {/* Détail des lignes */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>📦 Détail des matières</h2>
            {stats && stats.lignes.some(l => l.quantiteRestante > 0) && (
              <button style={styles.addBtn} onClick={openReceptionModal}>
                ➕ Nouvelle réception
              </button>
            )}
          </div>
          
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Matière</th>
                  <th style={styles.th}>Commandée</th>
                  <th style={styles.th}>Reçue</th>
                  <th style={styles.th}>Conforme</th>
                  <th style={styles.th}>Non conforme</th>
                  <th style={styles.th}>Restante</th>
                  <th style={styles.th}>Progression</th>
                </tr>
              </thead>
              <tbody>
                {stats?.lignes.map((ligne) => (
                  <tr key={ligne.ligneBonCommandeId}>
                    <td style={styles.td}>
                      <div style={styles.matiereInfo}>
                        <span style={styles.matiereCode}>{ligne.matiereCode}</span>
                        <span style={styles.matiereNom}>{ligne.matiereNom}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{ligne.quantiteCommandee}</td>
                    <td style={styles.td}>
                      <span style={styles.quantiteRecue}>{ligne.quantiteRecue}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.quantiteConforme}>{ligne.quantiteConforme}</span>
                    </td>
                    <td style={styles.td}>
                      {ligne.quantiteNonConforme > 0 && (
                        <span style={styles.quantiteNonConforme}>{ligne.quantiteNonConforme}</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {ligne.quantiteRestante > 0 ? (
                        <span style={styles.quantiteRestante}>{ligne.quantiteRestante}</span>
                      ) : (
                        <span style={styles.complete}>✓</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.miniProgress}>
                        <div style={{
                          ...styles.miniProgressFill,
                          width: `${ligne.pourcentageReception}%`,
                          background: ligne.pourcentageReception === 100 ? '#16a34a' : '#6366f1',
                        }} />
                      </div>
                      <span style={styles.progressText}>{ligne.pourcentageReception}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Historique des réceptions */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📋 Historique des réceptions</h2>
          
          {receptions.length === 0 ? (
            <div style={styles.emptyState}>
              Aucune réception enregistrée
            </div>
          ) : (
            <div style={styles.receptionsList}>
              {receptions.map((reception) => (
                <div key={reception.id} style={styles.receptionCard}>
                  <div style={styles.receptionHeader}>
                    <div>
                      <span style={styles.receptionNumero}>{reception.numero}</span>
                      <span style={styles.receptionDate}>
                        {new Date(reception.dateReception).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div style={styles.receptionActions}>
                      {reception.pvGenere ? (
                        <span style={styles.pvBadge}>PV généré ✓</span>
                      ) : (
                        <button
                          style={styles.pvBtn}
                          onClick={() => navigate(`/receptions/${reception.id}/pv`)}
                        >
                          📄 Générer PV
                        </button>
                      )}
                    </div>
                  </div>
                  {reception.livreur && (
                    <div style={styles.receptionInfo}>
                      <strong>Livreur:</strong> {reception.livreur}
                    </div>
                  )}
                  {reception.observations && (
                    <div style={styles.receptionInfo}>
                      <strong>Observations:</strong> {reception.observations}
                    </div>
                  )}
                  <div style={styles.receptionLignes}>
                    {reception.lignes.map((ligne, idx) => (
                      <span key={idx} style={styles.ligneBadge}>
                        {ligne.quantiteRecue} reçu(s) • {ligne.quantiteConforme} conforme(s)
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de nouvelle réception */}
        {showModal && stats && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Nouvelle réception</h2>
                <button style={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Livreur</label>
                    <input
                      type="text"
                      value={formData.livreur}
                      onChange={(e) => setFormData({ ...formData, livreur: e.target.value })}
                      style={styles.input}
                      placeholder="Nom du livreur"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Observations</label>
                    <input
                      type="text"
                      value={formData.observations}
                      onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                      style={styles.input}
                      placeholder="Observations générales"
                    />
                  </div>
                </div>

                <h3 style={styles.formSubtitle}>Quantités reçues</h3>
                <div style={styles.lignesForm}>
                  {formData.lignes.map((ligne, index) => {
                    const statLigne = stats.lignes.find(l => l.ligneBonCommandeId === ligne.ligneBonCommandeId);
                    if (!statLigne) return null;
                    
                    return (
                      <div key={ligne.ligneBonCommandeId} style={styles.ligneFormRow}>
                        <div style={styles.ligneInfo}>
                          <span style={styles.ligneCode}>{statLigne.matiereCode}</span>
                          <span style={styles.ligneNom}>{statLigne.matiereNom}</span>
                          <span style={styles.ligneRestante}>
                            Restant: {statLigne.quantiteRestante}
                          </span>
                        </div>
                        <div style={styles.ligneInputs}>
                          <div style={styles.inputGroup}>
                            <label style={styles.smallLabel}>Reçue</label>
                            <input
                              type="number"
                              min="0"
                              max={statLigne.quantiteRestante}
                              value={ligne.quantiteRecue}
                              onChange={(e) => handleLigneChange(index, 'quantiteRecue', parseInt(e.target.value) || 0)}
                              style={styles.smallInput}
                            />
                          </div>
                          <div style={styles.inputGroup}>
                            <label style={styles.smallLabel}>Conforme</label>
                            <input
                              type="number"
                              min="0"
                              max={ligne.quantiteRecue}
                              value={ligne.quantiteConforme}
                              onChange={(e) => handleLigneChange(index, 'quantiteConforme', parseInt(e.target.value) || 0)}
                              style={styles.smallInput}
                            />
                          </div>
                          <div style={styles.inputGroup}>
                            <label style={styles.smallLabel}>Non conforme</label>
                            <input
                              type="number"
                              min="0"
                              max={ligne.quantiteRecue}
                              value={ligne.quantiteNonConforme}
                              onChange={(e) => handleLigneChange(index, 'quantiteNonConforme', parseInt(e.target.value) || 0)}
                              style={styles.smallInput}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={styles.modalActions}>
                  <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" style={styles.submitBtn}>
                    Enregistrer la réception
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    color: '#64748b',
  },
  error: {
    textAlign: 'center',
    padding: '60px',
    color: '#dc2626',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '24px',
  },
  backBtn: {
    padding: '10px 16px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#64748b',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px',
  },
  statusBadge: {
    marginLeft: 'auto',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
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
  statsSection: {
    marginBottom: '24px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  statCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px',
  },
  progressBar: {
    height: '8px',
    background: '#e2e8f0',
    borderRadius: '4px',
    marginTop: '12px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  section: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    marginBottom: '24px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  addBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    background: '#f8fafc',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '14px',
  },
  matiereInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  matiereCode: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#64748b',
  },
  matiereNom: {
    fontWeight: '600',
    color: '#1e293b',
  },
  quantiteRecue: {
    fontWeight: '600',
    color: '#6366f1',
  },
  quantiteConforme: {
    color: '#16a34a',
  },
  quantiteNonConforme: {
    color: '#dc2626',
    fontWeight: '600',
  },
  quantiteRestante: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  complete: {
    color: '#16a34a',
    fontWeight: '700',
  },
  miniProgress: {
    height: '6px',
    background: '#e2e8f0',
    borderRadius: '3px',
    overflow: 'hidden',
    width: '80px',
    display: 'inline-block',
    marginRight: '8px',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: '3px',
  },
  progressText: {
    fontSize: '12px',
    color: '#64748b',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
  },
  receptionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  receptionCard: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #e2e8f0',
  },
  receptionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  receptionNumero: {
    fontWeight: '700',
    color: '#1e293b',
    marginRight: '12px',
  },
  receptionDate: {
    fontSize: '13px',
    color: '#64748b',
  },
  receptionActions: {
    display: 'flex',
    gap: '8px',
  },
  pvBadge: {
    padding: '6px 12px',
    background: '#dcfce7',
    color: '#16a34a',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  pvBtn: {
    padding: '6px 12px',
    background: '#e0e7ff',
    color: '#4f46e5',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  receptionInfo: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '8px',
  },
  receptionLignes: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px',
  },
  ligneBadge: {
    padding: '4px 10px',
    background: '#e2e8f0',
    borderRadius: '12px',
    fontSize: '12px',
    color: '#475569',
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
    width: '800px',
    maxWidth: '95vw',
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
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '24px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
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
  },
  formSubtitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '16px',
  },
  lignesForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  ligneFormRow: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  },
  ligneInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  ligneCode: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#64748b',
  },
  ligneNom: {
    fontWeight: '600',
    color: '#1e293b',
  },
  ligneRestante: {
    fontSize: '12px',
    color: '#f59e0b',
    fontWeight: '600',
  },
  ligneInputs: {
    display: 'flex',
    gap: '12px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  smallLabel: {
    fontSize: '11px',
    color: '#64748b',
    textAlign: 'center',
  },
  smallInput: {
    width: '70px',
    padding: '8px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    textAlign: 'center',
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

export default ReceptionBonCommande;
