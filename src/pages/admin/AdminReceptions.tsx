import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { receptionService, type Reception } from '../../services/reception.service';

export default function AdminReceptions() {
  const navigate = useNavigate();
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadReceptions();
  }, []);

  const loadReceptions = async () => {
    try {
      setLoading(true);
      const data = await receptionService.getAll();
      setReceptions(data);
    } catch (error) {
      console.error('Erreur lors du chargement des réceptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReceptions = receptions.filter(rec =>
    rec.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.bonCommande?.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.bonCommande?.fournisseur?.raisonSociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.livreur?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredReceptions.length / itemsPerPage);
  const paginatedReceptions = filteredReceptions.slice(
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

  const getTotalQuantites = (reception: Reception) => {
    const total = reception.lignes.reduce((sum, l) => sum + l.quantiteRecue, 0);
    const conforme = reception.lignes.reduce((sum, l) => sum + l.quantiteConforme, 0);
    return { total, conforme, taux: total > 0 ? Math.round((conforme / total) * 100) : 0 };
  };

  return (
    <AdminLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📦 Gestion des Réceptions</h1>
            <p style={styles.subtitle}>Suivi des réceptions de marchandises</p>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📦</div>
            <div style={styles.statInfo}>
              <span style={styles.statValue}>{receptions.length}</span>
              <span style={styles.statLabel}>Total réceptions</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'}}>✓</div>
            <div style={styles.statInfo}>
              <span style={styles.statValue}>{receptions.filter(r => r.pvGenere).length}</span>
              <span style={styles.statLabel}>PV générés</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>⏳</div>
            <div style={styles.statInfo}>
              <span style={styles.statValue}>{receptions.filter(r => !r.pvGenere).length}</span>
              <span style={styles.statLabel}>En attente PV</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Rechercher par numéro, bon de commande, fournisseur..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={styles.searchInput}
          />
        </div>

        {/* Table */}
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.loading}>Chargement...</div>
          ) : paginatedReceptions.length === 0 ? (
            <div style={styles.empty}>Aucune réception trouvée</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Numéro</th>
                  <th style={styles.th}>Bon de Commande</th>
                  <th style={styles.th}>Fournisseur</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Livreur</th>
                  <th style={styles.th}>Quantités</th>
                  <th style={styles.th}>Conformité</th>
                  <th style={styles.th}>PV</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReceptions.map((reception) => {
                  const stats = getTotalQuantites(reception);
                  return (
                    <tr key={reception.id} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={styles.numeroBadge}>{reception.numero}</span>
                      </td>
                      <td style={styles.td}>
                        <span 
                          style={styles.bcLink}
                          onClick={() => navigate(`/bons-commande/${reception.bonCommandeId}`)}
                        >
                          {reception.bonCommande?.numero || '-'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {reception.bonCommande?.fournisseur?.raisonSociale || '-'}
                      </td>
                      <td style={styles.td}>
                        {formatDate(reception.dateReception)}
                      </td>
                      <td style={styles.td}>
                        {reception.livreur || '-'}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.qtyBadge}>{stats.total}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.tauxBadge,
                          background: stats.taux >= 90 ? '#dcfce7' : stats.taux >= 70 ? '#fef3c7' : '#fee2e2',
                          color: stats.taux >= 90 ? '#16a34a' : stats.taux >= 70 ? '#d97706' : '#dc2626',
                        }}>
                          {stats.taux}%
                        </span>
                      </td>
                      <td style={styles.td}>
                        {reception.pvGenere ? (
                          <span style={styles.pvOk}>✓ Généré</span>
                        ) : (
                          <span style={styles.pvPending}>En attente</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actions}>
                          <button
                            style={styles.actionBtn}
                            onClick={() => navigate(`/receptions/${reception.id}/pv`)}
                            title="Voir le PV"
                          >
                            📄
                          </button>
                          <button
                            style={styles.actionBtn}
                            onClick={() => navigate(`/bons-commande/${reception.bonCommandeId}/reception`)}
                            title="Voir les réceptions du BC"
                          >
                            📦
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              style={{...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1}}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ← Précédent
            </button>
            <span style={styles.pageInfo}>
              Page {currentPage} sur {totalPages}
            </span>
            <button
              style={{...styles.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1}}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant →
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '24px',
  },
  header: {
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
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748b',
  },
  searchContainer: {
    marginBottom: '20px',
  },
  searchInput: {
    width: '100%',
    maxWidth: '400px',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
  },
  tableContainer: {
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#64748b',
  },
  empty: {
    padding: '40px',
    textAlign: 'center',
    color: '#64748b',
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
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#334155',
  },
  numeroBadge: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
  },
  bcLink: {
    color: '#6366f1',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  qtyBadge: {
    background: '#e0e7ff',
    color: '#4f46e5',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
  },
  tauxBadge: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
  },
  pvOk: {
    color: '#16a34a',
    fontWeight: '600',
    fontSize: '13px',
  },
  pvPending: {
    color: '#d97706',
    fontWeight: '600',
    fontSize: '13px',
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
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
  },
  pageBtn: {
    padding: '10px 16px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#64748b',
  },
  pageInfo: {
    fontSize: '14px',
    color: '#64748b',
  },
};
