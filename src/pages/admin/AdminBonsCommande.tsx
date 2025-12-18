import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { bonCommandeService, type BonCommande } from '../../services/bon-commande.service';

export default function AdminBonsCommande() {
  const navigate = useNavigate();
  const [bonsCommande, setBonsCommande] = useState<BonCommande[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadBonsCommande();
  }, []);

  const loadBonsCommande = async () => {
    try {
      setLoading(true);
      const data = await bonCommandeService.getAll();
      setBonsCommande(data);
    } catch (error) {
      console.error('Erreur lors du chargement des bons de commande:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBons = bonsCommande.filter(bon => 
    bon.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bon.fournisseur?.raisonSociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bon.expression?.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bon.expression?.division.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBons.length / itemsPerPage);
  const paginatedBons = filteredBons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const calculateTotal = (bon: BonCommande) => {
    const subtotal = bon.lignes.reduce((sum, ligne) => sum + (ligne.quantite * ligne.prixUnitaire), 0);
    const afterRemise = subtotal * (1 - (bon.remise || 0) / 100);
    const total = afterRemise * (1 + (bon.tauxTVA || 0) / 100);
    return total.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' });
  };

  const handleDownloadPDF = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await bonCommandeService.downloadPDF(id);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Chargement des bons de commande...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>🧾 Bons de Commande</h1>
            <p style={styles.subtitle}>Gestion de tous les bons de commande générés</p>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, ...styles.statCardBlue}}>
            <div style={styles.statContent}>
              <div>
                <div style={styles.statNumber}>{bonsCommande.length}</div>
                <div style={styles.statLabel}>TOTAL BONS</div>
              </div>
              <div style={styles.statIcon}>🧾</div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={styles.searchBar}>
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Rechercher par numéro, fournisseur, expression..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* Table */}
        {filteredBons.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🧾</div>
            <h3 style={styles.emptyTitle}>Aucun bon de commande</h3>
            <p style={styles.emptyText}>
              {searchTerm ? 'Aucun résultat pour votre recherche' : 'Aucun bon de commande n\'a été créé'}
            </p>
          </div>
        ) : (
          <>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.tableHeader}>Numéro</th>
                    <th style={styles.tableHeader}>Expression</th>
                    <th style={styles.tableHeader}>Division</th>
                    <th style={styles.tableHeader}>Fournisseur</th>
                    <th style={styles.tableHeader}>Date</th>
                    <th style={styles.tableHeader}>Lignes</th>
                    <th style={styles.tableHeader}>Total</th>
                    <th style={styles.tableHeader}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBons.map((bon) => (
                    <tr
                      key={bon.id}
                      style={styles.tableRow}
                      onClick={() => navigate(`/bons-commande/${bon.id}`)}
                    >
                      <td style={styles.tableCell}>
                        <span style={styles.numeroBadge}>{bon.numero}</span>
                      </td>
                      <td style={{...styles.tableCell, fontWeight: '600', color: '#1e293b'}}>
                        {bon.expression?.titre || '-'}
                      </td>
                      <td style={styles.tableCell}>
                        {bon.expression?.division.nom || '-'}
                      </td>
                      <td style={styles.tableCell}>
                        {bon.fournisseur?.raisonSociale || '-'}
                      </td>
                      <td style={styles.tableCell}>
                        {formatDate(bon.dateEmission)}
                      </td>
                      <td style={styles.tableCell}>
                        <span style={styles.lignesBadge}>{bon.lignes.length}</span>
                      </td>
                      <td style={{...styles.tableCell, fontWeight: '600', color: '#059669'}}>
                        {calculateTotal(bon)}
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.tableActions}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/bons-commande/${bon.id}`);
                            }}
                            style={styles.actionBtn}
                            title="Voir détails"
                          >
                            👁
                          </button>
                          <button
                            onClick={(e) => handleDownloadPDF(bon.id, e)}
                            style={styles.actionBtn}
                            title="Télécharger PDF"
                          >
                            📥
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  style={{...styles.pageBtn, ...(currentPage === 1 ? styles.pageBtnDisabled : {})}}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ← Précédent
                </button>
                <div style={styles.pageInfo}>
                  Page {currentPage} sur {totalPages} ({filteredBons.length} résultats)
                </div>
                <button
                  style={{...styles.pageBtn, ...(currentPage === totalPages ? styles.pageBtnDisabled : {})}}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '32px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#64748b',
    fontSize: '14px',
  },
  header: {
    marginBottom: '32px',
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '28px',
  },
  statCard: {
    borderRadius: '16px',
    padding: '24px',
    color: '#ffffff',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  },
  statCardBlue: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
  },
  statContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: '700',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: '600',
    opacity: 0.9,
    letterSpacing: '0.5px',
  },
  statIcon: {
    fontSize: '48px',
    opacity: 0.3,
  },
  searchBar: {
    marginBottom: '24px',
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    background: '#ffffff',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    padding: '0 16px',
    maxWidth: '500px',
  },
  searchIcon: {
    fontSize: '18px',
    marginRight: '12px',
    color: '#94a3b8',
  },
  searchInput: {
    flex: 1,
    padding: '14px 0',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: '#1e293b',
    background: 'transparent',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#64748b',
  },
  tableContainer: {
    background: '#ffffff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeaderRow: {
    background: '#f8fafc',
  },
  tableHeader: {
    padding: '16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #e2e8f0',
  },
  tableRow: {
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderBottom: '1px solid #f1f5f9',
  },
  tableCell: {
    padding: '16px',
    fontSize: '14px',
    color: '#475569',
  },
  numeroBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#ffffff',
  },
  lignesBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    background: '#f1f5f9',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
  },
  tableActions: {
    display: 'flex',
    gap: '8px',
  },
  actionBtn: {
    padding: '8px 12px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '24px',
    padding: '20px',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  pageBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  pageBtnDisabled: {
    background: '#e2e8f0',
    color: '#94a3b8',
    cursor: 'not-allowed',
  },
  pageInfo: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500',
  },
};
