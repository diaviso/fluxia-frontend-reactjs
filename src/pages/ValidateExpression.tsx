import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { expressionService, type ExpressionDeBesoin } from '../services/expression.service';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { DiscussionPanel } from '../components/DiscussionPanel';
import { ConfettiEffect } from '../components/ConfettiEffect';

export const ValidateExpression = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expressions, setExpressions] = useState<ExpressionDeBesoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpression, setSelectedExpression] = useState<ExpressionDeBesoin | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (user?.role !== 'VALIDATEUR' && user?.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
    loadExpressions();
  }, [user, navigate]);

  const loadExpressions = async () => {
    try {
      const data = await expressionService.getByStatut('EN_ATTENTE');
      setExpressions(data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (statut: 'VALIDE' | 'REFUSE') => {
    if (!selectedExpression) return;

    const confirmMessage = statut === 'VALIDE' 
      ? 'Êtes-vous sûr de vouloir valider cette expression de besoin ?' 
      : 'Êtes-vous sûr de vouloir refuser cette expression de besoin ?';
    
    if (!window.confirm(confirmMessage)) return;

    try {
      setProcessing(true);
      await expressionService.updateStatut(selectedExpression.id, statut);
      
      // Trigger confetti effect
      setShowConfetti(true);
      
      setTimeout(() => {
        setExpressions(prev => prev.filter(e => e.id !== selectedExpression.id));
        setSelectedExpression(null);
        setShowConfetti(false);
      }, 2000);
      
      alert(`Expression ${statut === 'VALIDE' ? 'validée' : 'refusée'} avec succès`);
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      alert('Erreur lors de la validation');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <Layout>
      <ConfettiEffect trigger={showConfetti} />
      <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/expressions')} style={styles.backButton}>
          ← Retour
        </button>
        <h1 style={styles.title}>Validation des Expressions de Besoin</h1>
      </div>

      {expressions.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>Aucune expression en attente de validation</p>
        </div>
      ) : (
        <div style={styles.layout}>
          <div style={styles.listPanel}>
            <h2 style={styles.panelTitle}>En attente ({expressions.length})</h2>
            <div style={styles.expressionsList}>
              {expressions.map(expr => (
                <div
                  key={expr.id}
                  style={{
                    ...styles.expressionCard,
                    ...(selectedExpression?.id === expr.id ? styles.expressionCardActive : {}),
                  }}
                  onClick={() => setSelectedExpression(expr)}
                >
                  <h3 style={styles.expressionTitle}>{expr.titre}</h3>
                  <p style={styles.expressionInfo}>
                    {expr.division?.nom || '-'} - {expr.service?.nom || '-'}
                  </p>
                  <p style={styles.expressionInfo}>
                    {expr.lignes?.length || 0} ligne(s)
                  </p>
                  {expr.createur && (
                    <p style={styles.expressionCreator}>
                      Par: {expr.createur.prenom} {expr.createur.nom}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={styles.detailPanel}>
            {selectedExpression ? (
              <>
                <div style={styles.detailHeader}>
                  <h2 style={styles.detailTitle}>{selectedExpression.titre}</h2>
                </div>

                <div style={styles.detailContent}>
                  <div style={styles.infoSection}>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Division:</span>
                      <span style={styles.infoValue}>{selectedExpression.division?.nom || '-'}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Service:</span>
                      <span style={styles.infoValue}>{selectedExpression.service?.nom || '-'}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Date:</span>
                      <span style={styles.infoValue}>
                        {new Date(selectedExpression.dateCreation).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    {selectedExpression.createur && (
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Créateur:</span>
                        <span style={styles.infoValue}>
                          {selectedExpression.createur.prenom} {selectedExpression.createur.nom}
                          <br />
                          <small>{selectedExpression.createur.email}</small>
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={styles.lignesSection}>
                    <h3 style={styles.subsectionTitle}>
                      Lignes de besoin ({selectedExpression.lignes?.length || 0})
                    </h3>
                    {selectedExpression.lignes?.map((ligne, index) => (
                      <div key={ligne.id || index} style={styles.ligneCard}>
                        <div style={styles.ligneHeader}>
                          <strong>Ligne {index + 1}</strong>
                          {ligne.matiere && (
                            <span style={styles.matiereTag}>
                              {ligne.matiere.designation} ({ligne.matiere.code})
                            </span>
                          )}
                        </div>
                        <p><strong>Description:</strong> {ligne.description}</p>
                        <p><strong>Quantité:</strong> {ligne.quantite}</p>
                        <p><strong>Justification:</strong> {ligne.justification}</p>
                      </div>
                    ))}
                  </div>

                  <div style={styles.discussionSection}>
                    <h3 style={styles.subsectionTitle}>💬 Discussion avec le créateur</h3>
                    <DiscussionPanel expressionId={selectedExpression.id} />
                  </div>

                  <div style={styles.validationSection}>
                    <h3 style={styles.subsectionTitle}>Actions de validation</h3>
                    <div style={styles.actions}>
                      <button
                        onClick={() => handleValidate('REFUSE')}
                        disabled={processing}
                        style={styles.refuseButton}
                      >
                        ❌ Refuser
                      </button>
                      <button
                        onClick={() => handleValidate('VALIDE')}
                        disabled={processing}
                        style={styles.validateButton}
                      >
                        ✅ Valider
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={styles.noSelection}>
                <p>Sélectionnez une expression pour la valider</p>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '32px',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  loadingContainer: {
    minHeight: '50vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '32px',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1a202c',
    margin: 0,
  },
  emptyState: {
    textAlign: 'center',
    padding: '64px 32px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  emptyText: {
    fontSize: '18px',
    color: '#6b7280',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '400px 1fr',
    gap: '24px',
    minHeight: '600px',
  },
  listPanel: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    maxHeight: '80vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  panelTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: '16px',
  },
  expressionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    overflowY: 'auto',
  },
  expressionCard: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  expressionCardActive: {
    backgroundColor: '#ede9fe',
    borderColor: '#667eea',
  },
  expressionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: '8px',
  },
  expressionInfo: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0',
  },
  expressionCreator: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '8px',
    fontStyle: 'italic',
  },
  detailPanel: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  detailHeader: {
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e5e7eb',
  },
  detailTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a202c',
    margin: 0,
  },
  detailContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6b7280',
  },
  infoValue: {
    fontSize: '14px',
    color: '#1f2937',
    fontWeight: '500',
    textAlign: 'right',
  },
  lignesSection: {
    paddingTop: '24px',
    borderTop: '2px solid #e5e7eb',
  },
  discussionSection: {
    paddingTop: '24px',
    borderTop: '2px solid #e5e7eb',
    marginBottom: '24px',
  },
  subsectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: '16px',
  },
  ligneCard: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  ligneHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid #e5e7eb',
  },
  matiereTag: {
    padding: '4px 8px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
  },
  validationSection: {
    paddingTop: '24px',
    borderTop: '2px solid #e5e7eb',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    marginBottom: '16px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  refuseButton: {
    padding: '12px 32px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  validateButton: {
    padding: '12px 32px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  noSelection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#9ca3af',
    fontSize: '18px',
  },
};
