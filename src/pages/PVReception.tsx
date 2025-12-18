import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { receptionService, type Reception } from '../services/reception.service';
import { pdf } from '@react-pdf/renderer';
import { ReceptionPDF } from '../components/ReceptionPDF';
import QRCode from 'qrcode';

export const PVReception = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reception, setReception] = useState<Reception | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (id) {
      loadReception();
    }
  }, [id]);

  const loadReception = async () => {
    try {
      setLoading(true);
      const data = await receptionService.getOne(parseInt(id!, 10));
      setReception(data);
    } catch (err) {
      setError('Erreur lors du chargement de la réception');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reception) return;
    
    setDownloading(true);
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(`PV-${reception.id}-${reception.numero}`, { width: 200 });
      const blob = await pdf(
        <ReceptionPDF reception={reception} qrCodeDataUrl={qrCodeDataUrl} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pv-reception-${reception.numero}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      
      // Marquer comme généré après téléchargement
      if (!reception.pvGenere) {
        await receptionService.markPvGenerated(parseInt(id!, 10));
        loadReception();
      }
    } catch (err) {
      console.error('Erreur lors du téléchargement du PDF:', err);
      setError('Erreur lors du téléchargement du PDF');
    } finally {
      setDownloading(false);
    }
  };

  
  if (loading) {
    return (
      <Layout>
        <div style={styles.loading}>Chargement...</div>
      </Layout>
    );
  }

  if (!reception) {
    return (
      <Layout>
        <div style={styles.error}>Réception non trouvée</div>
      </Layout>
    );
  }

  const bc = reception.bonCommande;
  const totalRecue = reception.lignes.reduce((sum, l) => sum + l.quantiteRecue, 0);
  const totalConforme = reception.lignes.reduce((sum, l) => sum + l.quantiteConforme, 0);
  const totalNonConforme = reception.lignes.reduce((sum, l) => sum + l.quantiteNonConforme, 0);

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.actions} className="no-print">
          <button style={styles.backBtn} onClick={() => navigate(-1)}>
            ← Retour
          </button>
          <div style={styles.actionBtns}>
            <button 
              style={styles.downloadBtn} 
              onClick={handleDownloadPDF}
              disabled={downloading}
            >
              {downloading ? '⏳ Génération...' : '📥 Télécharger PDF'}
            </button>
            {reception.pvGenere && (
              <span style={styles.pvStatus}>✓ PV généré</span>
            )}
          </div>
        </div>

        {error && <div style={styles.errorAlert} className="no-print">{error}</div>}

        <div style={styles.pvDocument}>
          {/* En-tête */}
          <div style={styles.pvHeader}>
            <div style={styles.pvLogo}>
              <span style={styles.logoIcon}>📋</span>
              <span style={styles.logoText}>Fluxia</span>
            </div>
            <div style={styles.pvTitle}>
              <h1 style={styles.pvMainTitle}>PROCÈS-VERBAL DE RÉCEPTION</h1>
              <div style={styles.pvNumero}>{reception.numero}</div>
            </div>
            <div style={styles.pvDate}>
              <div>Date de réception:</div>
              <strong>
                {new Date(reception.dateReception).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </strong>
            </div>
          </div>

          {/* Informations générales */}
          <div style={styles.pvSection}>
            <h2 style={styles.pvSectionTitle}>Informations générales</h2>
            <div style={styles.pvInfoGrid}>
              <div style={styles.pvInfoItem}>
                <span style={styles.pvInfoLabel}>Bon de commande:</span>
                <span style={styles.pvInfoValue}>{bc?.numero}</span>
              </div>
              <div style={styles.pvInfoItem}>
                <span style={styles.pvInfoLabel}>Expression:</span>
                <span style={styles.pvInfoValue}>{bc?.expression?.titre}</span>
              </div>
              <div style={styles.pvInfoItem}>
                <span style={styles.pvInfoLabel}>Fournisseur:</span>
                <span style={styles.pvInfoValue}>{bc?.fournisseur?.raisonSociale || 'Non défini'}</span>
              </div>
              <div style={styles.pvInfoItem}>
                <span style={styles.pvInfoLabel}>Livreur:</span>
                <span style={styles.pvInfoValue}>{reception.livreur || 'Non renseigné'}</span>
              </div>
            </div>
          </div>

          {/* Détail des matières reçues */}
          <div style={styles.pvSection}>
            <h2 style={styles.pvSectionTitle}>Détail des matières reçues</h2>
            <table style={styles.pvTable}>
              <thead>
                <tr>
                  <th style={styles.pvTh}>Code</th>
                  <th style={styles.pvTh}>Désignation</th>
                  <th style={styles.pvTh}>Qté Reçue</th>
                  <th style={styles.pvTh}>Qté Conforme</th>
                  <th style={styles.pvTh}>Qté Non Conforme</th>
                  <th style={styles.pvTh}>Observations</th>
                </tr>
              </thead>
              <tbody>
                {reception.lignes.map((ligne, index) => (
                  <tr key={index}>
                    <td style={styles.pvTd}>{ligne.ligneBonCommande?.matiereCode}</td>
                    <td style={styles.pvTd}>{ligne.ligneBonCommande?.matiereNom}</td>
                    <td style={{...styles.pvTd, textAlign: 'center'}}>{ligne.quantiteRecue}</td>
                    <td style={{...styles.pvTd, textAlign: 'center', color: '#16a34a'}}>{ligne.quantiteConforme}</td>
                    <td style={{...styles.pvTd, textAlign: 'center', color: ligne.quantiteNonConforme > 0 ? '#dc2626' : 'inherit'}}>
                      {ligne.quantiteNonConforme}
                    </td>
                    <td style={styles.pvTd}>{ligne.observations || '-'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={styles.pvTotalRow}>
                  <td style={styles.pvTd} colSpan={2}><strong>TOTAL</strong></td>
                  <td style={{...styles.pvTd, textAlign: 'center'}}><strong>{totalRecue}</strong></td>
                  <td style={{...styles.pvTd, textAlign: 'center', color: '#16a34a'}}><strong>{totalConforme}</strong></td>
                  <td style={{...styles.pvTd, textAlign: 'center', color: totalNonConforme > 0 ? '#dc2626' : 'inherit'}}>
                    <strong>{totalNonConforme}</strong>
                  </td>
                  <td style={styles.pvTd}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Observations */}
          {reception.observations && (
            <div style={styles.pvSection}>
              <h2 style={styles.pvSectionTitle}>Observations</h2>
              <div style={styles.pvObservations}>
                {reception.observations}
              </div>
            </div>
          )}

          {/* Résumé */}
          <div style={styles.pvSection}>
            <h2 style={styles.pvSectionTitle}>Résumé de la réception</h2>
            <div style={styles.pvSummary}>
              <div style={styles.pvSummaryItem}>
                <span style={styles.pvSummaryLabel}>Total articles reçus:</span>
                <span style={styles.pvSummaryValue}>{totalRecue}</span>
              </div>
              <div style={styles.pvSummaryItem}>
                <span style={styles.pvSummaryLabel}>Articles conformes:</span>
                <span style={{...styles.pvSummaryValue, color: '#16a34a'}}>{totalConforme}</span>
              </div>
              {totalNonConforme > 0 && (
                <div style={styles.pvSummaryItem}>
                  <span style={styles.pvSummaryLabel}>Articles non conformes:</span>
                  <span style={{...styles.pvSummaryValue, color: '#dc2626'}}>{totalNonConforme}</span>
                </div>
              )}
              <div style={styles.pvSummaryItem}>
                <span style={styles.pvSummaryLabel}>Taux de conformité:</span>
                <span style={styles.pvSummaryValue}>
                  {totalRecue > 0 ? Math.round((totalConforme / totalRecue) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div style={styles.pvSignatures}>
            <div style={styles.pvSignatureBox}>
              <div style={styles.pvSignatureTitle}>Le Réceptionnaire</div>
              <div style={styles.pvSignatureLine}></div>
              <div style={styles.pvSignatureInfo}>Nom et signature</div>
              <div style={styles.pvSignatureDate}>Date: ___/___/______</div>
            </div>
            <div style={styles.pvSignatureBox}>
              <div style={styles.pvSignatureTitle}>Le Livreur</div>
              <div style={styles.pvSignatureLine}></div>
              <div style={styles.pvSignatureInfo}>Nom et signature</div>
              <div style={styles.pvSignatureDate}>Date: ___/___/______</div>
            </div>
            <div style={styles.pvSignatureBox}>
              <div style={styles.pvSignatureTitle}>Le Responsable</div>
              <div style={styles.pvSignatureLine}></div>
              <div style={styles.pvSignatureInfo}>Nom et signature</div>
              <div style={styles.pvSignatureDate}>Date: ___/___/______</div>
            </div>
          </div>

          {/* Pied de page */}
          <div style={styles.pvFooter}>
            <div>Document généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</div>
            <div>Fluxia - Système de Gestion des Expressions de Besoin</div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
          @page { margin: 1cm; }
        }
      `}</style>
    </Layout>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '24px',
    maxWidth: '900px',
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
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  actionBtns: {
    display: 'flex',
    gap: '12px',
  },
  downloadBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  pvStatus: {
    padding: '10px 16px',
    background: '#dcfce7',
    color: '#16a34a',
    borderRadius: '10px',
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
  pvDocument: {
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    padding: '40px',
  },
  pvHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '2px solid #e2e8f0',
  },
  pvLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoIcon: {
    fontSize: '32px',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
  },
  pvTitle: {
    textAlign: 'center',
  },
  pvMainTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  pvNumero: {
    fontSize: '16px',
    color: '#6366f1',
    fontWeight: '600',
    marginTop: '8px',
  },
  pvDate: {
    textAlign: 'right',
    fontSize: '14px',
    color: '#64748b',
  },
  pvSection: {
    marginBottom: '24px',
  },
  pvSectionTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid #e2e8f0',
  },
  pvInfoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  pvInfoItem: {
    display: 'flex',
    gap: '8px',
  },
  pvInfoLabel: {
    color: '#64748b',
    fontSize: '14px',
  },
  pvInfoValue: {
    color: '#1e293b',
    fontSize: '14px',
    fontWeight: '600',
  },
  pvTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  pvTh: {
    padding: '10px 12px',
    textAlign: 'left',
    background: '#f8fafc',
    color: '#64748b',
    fontWeight: '600',
    borderBottom: '2px solid #e2e8f0',
    fontSize: '12px',
    textTransform: 'uppercase',
  },
  pvTd: {
    padding: '10px 12px',
    borderBottom: '1px solid #f1f5f9',
    color: '#334155',
  },
  pvTotalRow: {
    background: '#f8fafc',
    fontWeight: '600',
  },
  pvObservations: {
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#334155',
    lineHeight: '1.6',
  },
  pvSummary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '8px',
  },
  pvSummaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pvSummaryLabel: {
    fontSize: '14px',
    color: '#64748b',
  },
  pvSummaryValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
  },
  pvSignatures: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    marginTop: '40px',
    paddingTop: '24px',
    borderTop: '1px solid #e2e8f0',
  },
  pvSignatureBox: {
    textAlign: 'center',
  },
  pvSignatureTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '40px',
  },
  pvSignatureLine: {
    borderBottom: '1px solid #1e293b',
    marginBottom: '8px',
  },
  pvSignatureInfo: {
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '4px',
  },
  pvSignatureDate: {
    fontSize: '12px',
    color: '#64748b',
  },
  pvFooter: {
    marginTop: '40px',
    paddingTop: '16px',
    borderTop: '1px solid #e2e8f0',
    textAlign: 'center',
    fontSize: '11px',
    color: '#94a3b8',
  },
};

export default PVReception;
