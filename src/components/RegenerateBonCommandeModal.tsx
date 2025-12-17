import { useState } from 'react';
import { bonCommandeService, type BonCommande } from '../services/bon-commande.service';

interface RegenerateBonCommandeModalProps {
  bonCommande: BonCommande;
  onClose: () => void;
  onSuccess: () => void;
}

export const RegenerateBonCommandeModal: React.FC<RegenerateBonCommandeModalProps> = ({
  bonCommande,
  onClose,
  onSuccess,
}) => {
  const [fournisseur, setFournisseur] = useState(bonCommande.fournisseur || '');
  const [adresseLivraison, setAdresseLivraison] = useState(bonCommande.adresseLivraison || '');
  const [tauxTVA, setTauxTVA] = useState(bonCommande.tauxTVA);
  const [remise, setRemise] = useState(bonCommande.remise);
  const [observations, setObservations] = useState(bonCommande.observations || '');
  const [lignes, setLignes] = useState(bonCommande.lignes.map(ligne => ({
    description: ligne.description,
    quantite: ligne.quantite,
    matiereCode: ligne.matiereCode,
    matiereNom: ligne.matiereNom,
    unite: ligne.unite,
    prixUnitaire: ligne.prixUnitaire,
  })));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await bonCommandeService.regenerate(bonCommande.id, {
        expressionId: bonCommande.expressionId,
        fournisseur: fournisseur || undefined,
        adresseLivraison: adresseLivraison || undefined,
        tauxTVA,
        remise,
        observations: observations || undefined,
        lignes,
      });
      onSuccess();
    } catch (err: any) {
      console.error('Error regenerating bon de commande:', err);
      setError(err.response?.data?.message || 'Erreur lors de la régénération du bon de commande');
    } finally {
      setLoading(false);
    }
  };

  const updateLignePrix = (index: number, prixUnitaire: number) => {
    const newLignes = [...lignes];
    newLignes[index].prixUnitaire = prixUnitaire;
    setLignes(newLignes);
  };

  const calculateTotals = () => {
    const totalHT = lignes.reduce((sum, ligne) => sum + ligne.quantite * ligne.prixUnitaire, 0);
    const remiseAmount = (totalHT * remise) / 100;
    const totalApresRemise = totalHT - remiseAmount;
    const tvaAmount = (totalApresRemise * tauxTVA) / 100;
    const totalTTC = totalApresRemise + tvaAmount;

    return { totalHT, remiseAmount, tvaAmount, totalTTC };
  };

  const totals = calculateTotals();

  const styles: { [key: string]: React.CSSProperties } = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    },
    modal: {
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      maxWidth: '1000px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      padding: '24px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: '20px 20px 0 0',
    },
    title: {
      margin: 0,
      fontSize: '24px',
      fontWeight: '800',
      color: '#ffffff',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    closeButton: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      fontSize: '28px',
      cursor: 'pointer',
      color: '#ffffff',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s',
    },
    body: {
      padding: '32px',
      overflowY: 'auto',
      flex: 1,
      maxHeight: 'calc(90vh - 180px)',
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '600',
      color: '#4a5568',
      marginBottom: '8px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '15px',
      outline: 'none',
      transition: 'all 0.2s',
      background: '#ffffff',
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      background: '#ffffff',
      padding: '24px',
      borderRadius: '12px',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '16px',
      background: '#ffffff',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    },
    th: {
      padding: '14px 16px',
      textAlign: 'left',
      fontSize: '12px',
      fontWeight: '700',
      color: '#ffffff',
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    td: {
      padding: '14px 16px',
      fontSize: '14px',
      borderBottom: '1px solid #f1f3f5',
    },
    priceInput: {
      width: '120px',
      padding: '8px 12px',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      textAlign: 'right',
    },
    totalsCard: {
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: '16px',
      padding: '24px',
      marginTop: '24px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 0',
      fontSize: '15px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },
    totalLabel: {
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.8)',
    },
    totalValue: {
      fontWeight: '700',
      color: '#ffffff',
    },
    totalTTC: {
      fontSize: '22px',
      fontWeight: '800',
      color: '#10b981',
      borderTop: '2px solid rgba(255, 255, 255, 0.2)',
      paddingTop: '16px',
      marginTop: '12px',
      borderBottom: 'none',
      textShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
    },
    error: {
      padding: '14px 18px',
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      borderRadius: '10px',
      marginBottom: '20px',
      fontSize: '14px',
      fontWeight: '600',
      border: '2px solid #fecaca',
    },
    footer: {
      padding: '24px 32px',
      background: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      borderRadius: '0 0 20px 20px',
    },
    button: {
      padding: '12px 28px',
      borderRadius: '10px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    cancelButton: {
      background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      color: '#ffffff',
    },
    submitButton: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: '#ffffff',
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>🔄 Régénérer le Bon de Commande</h2>
          <button style={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.body}>
            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Fournisseur</label>
                <input
                  type="text"
                  style={styles.input}
                  value={fournisseur}
                  onChange={(e) => setFournisseur(e.target.value)}
                  placeholder="Nom du fournisseur"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Adresse de livraison</label>
                <input
                  type="text"
                  style={styles.input}
                  value={adresseLivraison}
                  onChange={(e) => setAdresseLivraison(e.target.value)}
                  placeholder="Adresse de livraison"
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Taux TVA (%)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={tauxTVA}
                  onChange={(e) => setTauxTVA(Number(e.target.value))}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Remise (%)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={remise}
                  onChange={(e) => setRemise(Number(e.target.value))}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Observations</label>
              <textarea
                style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Observations ou notes supplémentaires"
              />
            </div>

            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginTop: 0, marginBottom: '16px', color: '#1a202c' }}>
                📦 Articles à commander
              </h3>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Matière</th>
                    <th style={styles.th}>Description</th>
                    <th style={styles.th}>Qté</th>
                    <th style={styles.th}>Prix unitaire (FCFA)</th>
                    <th style={styles.th}>Total (FCFA)</th>
                  </tr>
                </thead>
                <tbody>
                  {lignes.map((ligne, index) => (
                    <tr key={index}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: '600', color: '#2d3748' }}>{ligne.matiereNom}</div>
                        <div style={{ fontSize: '12px', color: '#718096' }}>({ligne.matiereCode})</div>
                      </td>
                      <td style={styles.td}>{ligne.description}</td>
                      <td style={styles.td}>{ligne.quantite}</td>
                      <td style={styles.td}>
                        <input
                          type="number"
                          style={styles.priceInput}
                          value={ligne.prixUnitaire}
                          onChange={(e) => updateLignePrix(index, Number(e.target.value))}
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td style={styles.td}>
                        {(ligne.quantite * ligne.prixUnitaire).toLocaleString('fr-FR')} FCFA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={styles.totalsCard}>
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total HT:</span>
                <span style={styles.totalValue}>{totals.totalHT.toLocaleString('fr-FR')} FCFA</span>
              </div>
              {remise > 0 && (
                <div style={styles.totalRow}>
                  <span style={styles.totalLabel}>Remise ({remise}%):</span>
                  <span style={{...styles.totalValue, color: '#10b981'}}>-{totals.remiseAmount.toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>TVA ({tauxTVA}%):</span>
                <span style={styles.totalValue}>{totals.tvaAmount.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div style={{ ...styles.totalRow, ...styles.totalTTC }}>
                <span>Total TTC:</span>
                <span>{totals.totalTTC.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </div>

          <div style={styles.footer}>
            <button
              type="button"
              style={{ ...styles.button, ...styles.cancelButton }}
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={{ ...styles.button, ...styles.submitButton }}
              disabled={loading}
            >
              {loading ? 'Régénération...' : 'Régénérer le bon de commande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
