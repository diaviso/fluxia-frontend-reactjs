import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bonCommandeService, type BonCommande } from '../services/bon-commande.service';
import { Layout } from '../components/Layout';
import { pdf } from '@react-pdf/renderer';
import { BonCommandePDF } from '../components/BonCommandePDF';
import { RegenerateBonCommandeModal } from '../components/RegenerateBonCommandeModal';
import QRCode from 'qrcode';

export const BonCommandeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bonCommande, setBonCommande] = useState<BonCommande | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadBonCommande(Number(id));
    }
  }, [id]);

  const loadBonCommande = async (bcId: number) => {
    try {
      const data = await bonCommandeService.getById(bcId);
      setBonCommande(data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      alert('Bon de commande introuvable');
      navigate('/expressions');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
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

  const calculateTotals = () => {
    if (!bonCommande) return { totalHT: 0, remiseAmount: 0, tvaAmount: 0, totalTTC: 0 };
    
    const totalHT = bonCommande.lignes.reduce((sum, ligne) => sum + ligne.quantite * ligne.prixUnitaire, 0);
    const remiseAmount = (totalHT * bonCommande.remise) / 100;
    const totalApresRemise = totalHT - remiseAmount;
    const tvaAmount = (totalApresRemise * bonCommande.tauxTVA) / 100;
    const totalTTC = totalApresRemise + tvaAmount;

    return { totalHT, remiseAmount, tvaAmount, totalTTC };
  };

  if (loading) {
    return (
      <Layout>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Chargement...</p>
        </div>
      </Layout>
    );
  }

  if (!bonCommande) {
    return null;
  }

  const totals = calculateTotals();

  return (
    <Layout>
      <div style={styles.pageWrapper}>
        <div style={styles.container}>
          {/* Header with gradient */}
          <div style={styles.header}>
            <div style={styles.headerContent}>
              <div>
                <button onClick={() => navigate(`/expressions/${bonCommande.expressionId}`)} style={styles.backButton}>
                  ← Retour à l'expression
                </button>
                <h1 style={styles.title}>📋 Bon de Commande</h1>
                <div style={styles.numeroBox}>
                  <span style={styles.numeroLabel}>N°</span>
                  <span style={styles.numeroValue}>{bonCommande.numero}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => navigate(`/bons-commande/${bonCommande.id}/reception`)} style={{...styles.downloadButton, background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'}}>
                  <span style={styles.downloadIcon}>📦</span>
                  <span>Réception</span>
                </button>
                <button onClick={handleDownloadPDF} style={styles.downloadButton}>
                  <span style={styles.downloadIcon}>📥</span>
                  <span>Télécharger PDF</span>
                </button>
                <button onClick={() => setShowRegenerateModal(true)} style={{...styles.downloadButton, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
                  <span style={styles.downloadIcon}>🔄</span>
                  <span>Régénérer</span>
                </button>
              </div>
            </div>
          </div>

          <div style={styles.contentGrid}>
            {/* Informations générales */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>📄 Informations générales</h2>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Date d'émission</span>
                    <span style={styles.infoValue}>
                      {new Date(bonCommande.dateEmission).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Division</span>
                    <span style={styles.infoValue}>{bonCommande.expression?.division.nom}</span>
                  </div>
                  {bonCommande.expression?.service && (
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Service</span>
                      <span style={styles.infoValue}>{bonCommande.expression.service.nom}</span>
                    </div>
                  )}
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Expression liée</span>
                    <span style={styles.infoValue}>{bonCommande.expression?.titre}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fournisseur */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>🏢 Fournisseur</h2>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.supplierBox}>
                  <div style={styles.supplierIcon}>🏪</div>
                  <div>
                    <div style={styles.supplierName}>
                      {bonCommande.fournisseur?.raisonSociale || 'Non spécifié'}
                    </div>
                    {bonCommande.fournisseur?.code && (
                      <div style={styles.supplierCode}>
                        Code: {bonCommande.fournisseur.code}
                      </div>
                    )}
                    {bonCommande.fournisseur?.adresse && (
                      <div style={styles.supplierAddress}>
                        📍 {bonCommande.fournisseur.adresse}
                      </div>
                    )}
                    {bonCommande.adresseLivraison && (
                      <div style={styles.supplierAddress}>
                        🚚 Livraison: {bonCommande.adresseLivraison}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lignes du bon de commande */}
          <div style={styles.lignesCard}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>📦 Articles commandés ({bonCommande.lignes.length})</h2>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={{...styles.th, textAlign: 'left', width: '50%'}}>Description</th>
                      <th style={{...styles.th, textAlign: 'center', width: '15%'}}>Quantité</th>
                      <th style={{...styles.th, textAlign: 'right', width: '17.5%'}}>Prix unitaire</th>
                      <th style={{...styles.th, textAlign: 'right', width: '17.5%'}}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bonCommande.lignes.map((ligne, index) => (
                      <tr key={ligne.id} style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                        <td style={styles.td}>
                          <div style={styles.ligneDescription}>
                            <span style={styles.ligneNumber}>{index + 1}.</span>
                            <div>
                              <div style={styles.ligneTitle}>{ligne.description}</div>
                              <div style={styles.ligneSubtitle}>
                                {ligne.matiereNom} • {ligne.matiereCode}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{...styles.td, textAlign: 'center'}}>
                          <span style={styles.quantityBadge}>{ligne.quantite}</span>
                        </td>
                        <td style={{...styles.td, textAlign: 'right'}}>
                          <span style={styles.priceText}>
                            {ligne.prixUnitaire.toLocaleString('fr-FR')} FCFA
                          </span>
                        </td>
                        <td style={{...styles.td, textAlign: 'right'}}>
                          <span style={styles.totalText}>
                            {(ligne.quantite * ligne.prixUnitaire).toLocaleString('fr-FR')} FCFA
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Totaux */}
          <div style={styles.totalsSection}>
            {bonCommande.observations && (
              <div style={styles.observationsCard}>
                <h3 style={styles.observationsTitle}>📝 Observations</h3>
                <p style={styles.observationsText}>{bonCommande.observations}</p>
              </div>
            )}

            <div style={styles.totalsCard}>
              <div style={styles.totalsHeader}>
                <h3 style={styles.totalsTitle}>💰 Récapitulatif financier</h3>
              </div>
              <div style={styles.totalsBody}>
                <div style={styles.totalRow}>
                  <span style={styles.totalLabel}>Total HT</span>
                  <span style={styles.totalValue}>{totals.totalHT.toLocaleString('fr-FR')} FCFA</span>
                </div>
                {bonCommande.remise > 0 && (
                  <div style={styles.totalRow}>
                    <span style={styles.totalLabel}>Remise ({bonCommande.remise}%)</span>
                    <span style={{...styles.totalValue, color: '#10b981'}}>
                      -{totals.remiseAmount.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                )}
                <div style={styles.totalRow}>
                  <span style={styles.totalLabel}>TVA ({bonCommande.tauxTVA}%)</span>
                  <span style={styles.totalValue}>{totals.tvaAmount.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div style={styles.totalRowFinal}>
                  <span style={styles.totalLabelFinal}>Total TTC</span>
                  <span style={styles.totalValueFinal}>
                    {totals.totalTTC.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regenerate Modal */}
      {showRegenerateModal && bonCommande && (
        <RegenerateBonCommandeModal
          bonCommande={bonCommande}
          onClose={() => setShowRegenerateModal(false)}
          onSuccess={() => {
            setShowRegenerateModal(false);
            loadBonCommande(bonCommande.id);
            alert('Bon de commande régénéré avec succès !');
          }}
        />
      )}
    </Layout>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh',
    padding: '40px 20px',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    gap: '16px',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #4299e1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  header: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    borderRadius: '20px',
    padding: '30px',
    marginBottom: '30px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '16px',
    padding: '8px 0',
    transition: 'color 0.2s',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a202c',
    margin: '0 0 16px 0',
  },
  numeroBox: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '12px 24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },
  numeroLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  numeroValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
  },
  downloadButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  downloadIcon: {
    fontSize: '20px',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
  },
  cardHeader: {
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a202c',
    margin: 0,
  },
  cardBody: {
    padding: '24px',
  },
  infoGrid: {
    display: 'grid',
    gap: '20px',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  infoLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2d3748',
  },
  supplierBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    borderRadius: '12px',
    border: '2px solid #bae6fd',
  },
  supplierIcon: {
    fontSize: '40px',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  supplierName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0c4a6e',
    marginBottom: '4px',
  },
  supplierAddress: {
    fontSize: '14px',
    color: '#0369a1',
  },
  lignesCard: {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    marginBottom: '20px',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeaderRow: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  th: {
    padding: '16px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableRowEven: {
    background: '#ffffff',
  },
  tableRowOdd: {
    background: '#f8f9fa',
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#2d3748',
    borderBottom: '1px solid #e2e8f0',
  },
  ligneDescription: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  ligneNumber: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#667eea',
    minWidth: '24px',
  },
  ligneTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '4px',
  },
  ligneSubtitle: {
    fontSize: '13px',
    color: '#718096',
  },
  quantityBadge: {
    display: 'inline-block',
    padding: '6px 16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '700',
  },
  priceText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4a5568',
  },
  totalText: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#667eea',
  },
  totalsSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '20px',
    alignItems: 'start',
  },
  observationsCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  },
  observationsTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: '12px',
  },
  observationsText: {
    fontSize: '14px',
    color: '#4a5568',
    lineHeight: '1.6',
    margin: 0,
  },
  totalsCard: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
  },
  totalsHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  totalsTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
  },
  totalsBody: {
    padding: '24px',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  totalLabel: {
    fontSize: '15px',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  totalValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#ffffff',
  },
  totalRowFinal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 0 0 0',
    marginTop: '12px',
    borderTop: '2px solid rgba(255, 255, 255, 0.2)',
  },
  totalLabelFinal: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
  },
  totalValueFinal: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#10b981',
    textShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
  },
};
