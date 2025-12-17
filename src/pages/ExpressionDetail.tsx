import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { expressionService, type ExpressionDeBesoin } from '../services/expression.service';
import { bonCommandeService, type BonCommande } from '../services/bon-commande.service';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { DiscussionPanel } from '../components/DiscussionPanel';
import { StatusRibbon } from '../components/StatusRibbon';
import { CreateBonCommandeModal } from '../components/CreateBonCommandeModal';
import { pdf } from '@react-pdf/renderer';
import { ExpressionBesoinPDF } from '../components/ExpressionBesoinPDF';
import { BonCommandePDF } from '../components/BonCommandePDF';
import QRCode from 'qrcode';

export const ExpressionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expression, setExpression] = useState<ExpressionDeBesoin | null>(null);
  const [bonCommande, setBonCommande] = useState<BonCommande | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBonCommandeModal, setShowBonCommandeModal] = useState(false);
  const [showDiscussionPanel, setShowDiscussionPanel] = useState(false);
  const discussionButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (id) {
      loadExpression(Number(id));
    }
  }, [id]);

  const loadExpression = async (expressionId: number) => {
    try {
      const data = await expressionService.getById(expressionId);
      setExpression(data);
      
      // Load bon de commande if exists
      const bc = await bonCommandeService.getByExpression(expressionId);
      setBonCommande(bc);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      alert('Expression de besoin introuvable');
      navigate('/expressions');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExpressionPDF = async () => {
    if (expression) {
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(`EB-${expression.id}`, { width: 200 });
        const blob = await pdf(
          <ExpressionBesoinPDF expression={expression} qrCodeDataUrl={qrCodeDataUrl} />
        ).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `expression-${expression.id}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('Erreur lors du téléchargement du PDF');
      }
    }
  };

  const handleDownloadBonCommandePDF = async () => {
    if (bonCommande) {
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(`BC-${bonCommande.id}-${bonCommande.numero}`, { width: 200 });
        const blob = await pdf(
          <BonCommandePDF bonCommande={bonCommande} qrCodeDataUrl={qrCodeDataUrl} />
        ).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bon-commande-${bonCommande.numero}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('Erreur lors du téléchargement du PDF');
      }
    }
  };

  const handleBonCommandeCreated = async () => {
    setShowBonCommandeModal(false);
    if (expression) {
      await loadExpression(expression.id);
      alert('Bon de commande créé avec succès !');
    }
  };

  const handleDelete = async () => {
    if (!expression || !window.confirm('Êtes-vous sûr de vouloir supprimer cette expression ?')) {
      return;
    }

    try {
      await expressionService.delete(expression.id);
      navigate('/expressions');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleSubmitToSupervisor = async () => {
    if (!expression) return;
    
    if (!window.confirm('Voulez-vous soumettre cette expression à votre supérieur hiérarchique pour validation ?')) {
      return;
    }

    try {
      await expressionService.updateStatut(expression.id, 'EN_ATTENTE');
      await loadExpression(expression.id);
      alert('Expression soumise avec succès !');
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      alert('Erreur lors de la soumission');
    }
  };

  const handleCancelSubmission = async () => {
    if (!expression) return;
    
    if (!window.confirm('Voulez-vous annuler la soumission et repasser cette expression en brouillon ?')) {
      return;
    }

    try {
      await expressionService.updateStatut(expression.id, 'BROUILLON');
      await loadExpression(expression.id);
      alert('Soumission annulée. L\'expression est repassée en brouillon.');
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      alert('Erreur lors de l\'annulation');
    }
  };

  const handleValidate = async () => {
    if (!expression) return;
    
    if (!window.confirm('Voulez-vous VALIDER cette expression de besoin ?')) {
      return;
    }

    try {
      await expressionService.updateStatut(expression.id, 'VALIDE');
      await loadExpression(expression.id);
      alert('Expression validée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      alert('Erreur lors de la validation');
    }
  };

  const handleReject = async () => {
    if (!expression) return;
    
    if (!window.confirm('Voulez-vous REFUSER cette expression de besoin ?')) {
      return;
    }

    try {
      await expressionService.updateStatut(expression.id, 'REFUSE');
      await loadExpression(expression.id);
      alert('Expression refusée.');
    } catch (error) {
      console.error('Erreur lors du refus:', error);
      alert('Erreur lors du refus');
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

  if (!expression) {
    return null;
  }

  const canEdit = expression.statut === 'BROUILLON' && expression.createurId === user?.id;
  const canValidate = (user?.role === 'VALIDATEUR' || user?.role === 'ADMIN') && 
                      expression.statut === 'EN_ATTENTE';

  return (
    <Layout>
      <div style={styles.pageWrapper}>
        <div style={styles.container}>
          {/* Header with Status */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <button onClick={() => navigate('/expressions')} style={styles.backButton}>
                ← Retour
              </button>
              <h1 style={styles.title}>{expression.titre}</h1>
            </div>
            <div style={styles.headerRight}>
              <StatusRibbon status={expression.statut as any} size="medium" />
              <div style={styles.meta}>
                <span style={styles.metaItem}>
                  <span style={styles.metaIcon}>📅</span>
                  {new Date(expression.dateCreation).toLocaleDateString('fr-FR')}
                </span>
                {expression.createur && (
                  <span style={styles.metaItem}>
                    <span style={styles.metaIcon}>👤</span>
                    {expression.createur.prenom} {expression.createur.nom}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.actionBar}>
            {canEdit && (
              <>
                <button onClick={() => navigate(`/expressions/${expression.id}/edit`)} style={styles.actionButton}>
                  <span style={styles.actionIcon}>✏️</span>
                  <span>Modifier</span>
                </button>
                <button onClick={handleDelete} style={{...styles.actionButton, ...styles.deleteBtn}}>
                  <span style={styles.actionIcon}>🗑️</span>
                  <span>Supprimer</span>
                </button>
              </>
            )}
            {expression.createurId === user?.id && expression.statut === 'BROUILLON' && (
              <button onClick={handleSubmitToSupervisor} style={{...styles.actionButton, ...styles.submitBtn}}>
                <span style={styles.actionIcon}>📤</span>
                <span>Soumettre</span>
              </button>
            )}
            {expression.createurId === user?.id && expression.statut === 'EN_ATTENTE' && (
              <button onClick={handleCancelSubmission} style={{...styles.actionButton, ...styles.cancelBtn}}>
                <span style={styles.actionIcon}>↩️</span>
                <span>Annuler</span>
              </button>
            )}
            {canValidate && (
              <>
                <button onClick={handleValidate} style={{...styles.actionButton, ...styles.validateBtn}}>
                  <span style={styles.actionIcon}>✅</span>
                  <span>Valider</span>
                </button>
                <button onClick={handleReject} style={{...styles.actionButton, ...styles.rejectBtn}}>
                  <span style={styles.actionIcon}>❌</span>
                  <span>Refuser</span>
                </button>
              </>
            )}
            
            {/* PDF Download Button */}
            <button onClick={handleDownloadExpressionPDF} style={{...styles.actionButton, ...styles.pdfBtn}}>
              <span style={styles.actionIcon}>📄</span>
              <span>Télécharger PDF</span>
            </button>

            {/* Bon de Commande Actions (Admin only) */}
            {user?.role === 'ADMIN' && expression.statut === 'VALIDE' && (
              <>
                {!bonCommande ? (
                  <button onClick={() => setShowBonCommandeModal(true)} style={{...styles.actionButton, ...styles.bcBtn}}>
                    <span style={styles.actionIcon}>📋</span>
                    <span>Créer Bon de Commande</span>
                  </button>
                ) : (
                  <>
                    <button onClick={handleDownloadBonCommandePDF} style={{...styles.actionButton, ...styles.bcBtn}}>
                      <span style={styles.actionIcon}>📋</span>
                      <span>Télécharger BC (N° {bonCommande.numero})</span>
                    </button>
                    <button onClick={() => navigate(`/bon-commande/${bonCommande.id}`)} style={{...styles.actionButton, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
                      <span style={styles.actionIcon}>🔄</span>
                      <span>Régénérer BC</span>
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Main Content */}
          <div style={styles.contentContainer}>
            {/* Left Column */}
            <div style={styles.leftColumn}>
              {/* Bon de Commande Card (Admin only) */}
              
              
              {/* Info Card */}
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>
                  <span style={styles.cardIcon}>📊</span>
                  Informations générales
                </h2>
                <div style={styles.infoList}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Division</span>
                    <span style={styles.infoValue}>{expression.division?.nom || '-'}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Service</span>
                    <span style={styles.infoValue}>{expression.service?.nom || '-'}</span>
                  </div>
                  {expression.createur && (
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Créateur</span>
                      <div style={styles.creatorInfo}>
                        <span style={styles.infoValue}>
                          {expression.createur.prenom} {expression.createur.nom}
                        </span>
                        <span style={styles.creatorEmail}>{expression.createur.email}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Lignes de besoin */}
            <div style={styles.rightColumn}>
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>
                  <span style={styles.cardIcon}>📝</span>
                  Lignes de besoin ({expression.lignes?.length || 0})
                </h2>
                
                {expression.lignes && expression.lignes.length > 0 ? (
                  <div style={styles.lignesList}>
                    {expression.lignes.map((ligne, index) => (
                      <div key={ligne.id || index} style={styles.ligneCard}>
                        <div style={styles.ligneHeader}>
                          <span style={styles.ligneNumber}>Ligne {index + 1}</span>
                          {ligne.matiere && (
                            <span style={styles.matiereTag}>
                              {ligne.matiere.designation} - {ligne.matiere.code}
                            </span>
                          )}
                        </div>
                        <div style={styles.ligneContent}>
                          <div style={styles.ligneGrid}>
                            <div style={styles.ligneItem}>
                              <span style={styles.ligneLabel}>Description</span>
                              <p style={styles.ligneText}>{ligne.description}</p>
                            </div>
                            <div style={styles.ligneItem}>
                              <span style={styles.ligneLabel}>Quantité</span>
                              <p style={styles.ligneText}>{ligne.quantite}</p>
                            </div>
                            <div style={styles.ligneItem}>
                              <span style={styles.ligneLabel}>Justification</span>
                              <p style={styles.ligneText}>{ligne.justification}</p>
                            </div>
                            {ligne.matiere && (
                              <div style={styles.ligneItem}>
                                <span style={styles.ligneLabel}>Type de matière</span>
                                <p style={styles.ligneText}>{ligne.matiere.type}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={styles.emptyText}>Aucune ligne de besoin</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Button for Discussion */}
        {(expression.statut === 'EN_ATTENTE' || expression.statut === 'VALIDE' || expression.statut === 'REFUSE') && (
          <>
            <button 
              ref={discussionButtonRef}
              onClick={() => setShowDiscussionPanel(!showDiscussionPanel)} 
              style={styles.floatingButton}
              aria-label="Ouvrir la discussion"
            >
              <span style={styles.floatingButtonIcon}>💬</span>
            </button>
            
            {/* Discussion Panel Modal */}
            {showDiscussionPanel && (
              <div style={styles.discussionModal}>
                <div style={styles.discussionModalHeader}>
                  <h3 style={styles.discussionModalTitle}>Discussion</h3>
                  <button 
                    onClick={() => setShowDiscussionPanel(false)} 
                    style={styles.discussionModalCloseButton}
                  >
                    ✕
                  </button>
                </div>
                <div style={styles.discussionModalContent}>
                  <DiscussionPanel expressionId={expression.id} />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bon de Commande Modal */}
      {showBonCommandeModal && expression && (
        <CreateBonCommandeModal
          expression={expression}
          onClose={() => setShowBonCommandeModal(false)}
          onSuccess={handleBonCommandeCreated}
        />
      )}
    </Layout>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    background: '#f8fafc',
    minHeight: '100vh',
    position: 'relative',
  },
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '12px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a202c',
    margin: '12px 0 0 0',
    lineHeight: '1.2',
  },
  meta: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    marginTop: '4px',
  },
  metaItem: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  metaIcon: {
    fontSize: '16px',
    color: '#4299e1',
  },
  actionBar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    padding: '6px',
    background: '#f1f5f9',
    borderRadius: '10px',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: '#4a5568',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  actionIcon: {
    fontSize: '16px',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 2px 6px rgba(66, 153, 225, 0.3)',
  },
  deleteBtn: {
    background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 2px 6px rgba(229, 62, 62, 0.3)',
  },
  validateBtn: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
  },
  rejectBtn: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 2px 6px rgba(245, 158, 11, 0.3)',
  },
  pdfBtn: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 2px 6px rgba(139, 92, 246, 0.3)',
  },
  bcBtn: {
    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 2px 6px rgba(6, 182, 212, 0.3)',
  },
  cancelBtn: {
    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 2px 6px rgba(107, 114, 128, 0.3)',
  },
  contentContainer: {
    display: 'grid',
    gridTemplateColumns: 'minmax(300px, 1fr) minmax(500px, 2fr)',
    gap: '20px',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    height: 'fit-content',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid #edf2f7',
    paddingBottom: '12px',
  },
  cardIcon: {
    fontSize: '20px',
    color: '#4299e1',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '10px 0',
    borderBottom: '1px solid #edf2f7',
  },
  infoLabel: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: '14px',
    color: '#1e293b',
    fontWeight: '600',
    textAlign: 'right',
  },
  creatorInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
  },
  creatorEmail: {
    fontSize: '13px',
    color: '#94a3b8',
  },
  backButton: {
    padding: '8px 16px',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#475569',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: 'fit-content',
  },
  loadingContainer: {
    minHeight: '50vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  },
  lignesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  ligneCard: {
    background: '#f8fafc',
    borderRadius: '10px',
    padding: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  ligneHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    paddingBottom: '10px',
    borderBottom: '1px solid #e2e8f0',
  },
  ligneNumber: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4299e1',
  },
  matiereTag: {
    padding: '4px 10px',
    background: '#e6f2ff',
    color: '#3182ce',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
  },
  ligneContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  ligneGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  ligneItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  ligneLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
  },
  ligneText: {
    margin: '0',
    color: '#334155',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  emptyText: {
    fontSize: '15px',
    color: '#94a3b8',
    textAlign: 'center',
    padding: '40px 20px',
  },
  floatingButton: {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(66, 153, 225, 0.4)',
    border: 'none',
    cursor: 'pointer',
    zIndex: 1000,
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  floatingButtonIcon: {
    fontSize: '24px',
  },
  discussionModal: {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '400px',
    height: '500px',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 999,
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  discussionModalHeader: {
    padding: '16px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#f8fafc',
  },
  discussionModalTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
  },
  discussionModalCloseButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  discussionModalContent: {
    flex: 1,
    overflow: 'hidden',
  },
  bcCardContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px 0',
  },
  createBcButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(6, 182, 212, 0.3)',
    transition: 'all 0.2s ease',
    width: '100%',
    justifyContent: 'center',
  },
  createBcIcon: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  bcInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
  },
  bcNumber: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    padding: '8px 16px',
    background: '#f1f5f9',
    borderRadius: '6px',
    width: '100%',
    textAlign: 'center',
  },
  downloadBcButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(6, 182, 212, 0.3)',
    transition: 'all 0.2s ease',
    width: '100%',
    justifyContent: 'center',
  },
  downloadIcon: {
    fontSize: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '50%',
    borderTop: '4px solid #3182ce',
    animation: 'spin 1s linear infinite',
  },
};
