import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { expressionService, type ExpressionDeBesoin } from '../services/expression.service';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { StatusRibbon } from '../components/StatusRibbon';
import { AccessDenied } from '../components/AccessDenied';

type ViewMode = 'cards' | 'table';

export const ExpressionsList = () => {
  const [expressions, setExpressions] = useState<ExpressionDeBesoin[]>([]);
  const [allExpressions, setAllExpressions] = useState<ExpressionDeBesoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const navigate = useNavigate();
  const { user } = useAuth();

  // Calculate stats
  const stats = {
    total: allExpressions.length,
    brouillon: allExpressions.filter(e => e.statut === 'BROUILLON').length,
    enAttente: allExpressions.filter(e => e.statut === 'EN_ATTENTE').length,
    valide: allExpressions.filter(e => e.statut === 'VALIDE').length,
    refuse: allExpressions.filter(e => e.statut === 'REFUSE').length,
  };

  useEffect(() => {
    loadExpressions();
  }, []);

  useEffect(() => {
    applyFilters(allExpressions, statusFilter, searchTerm);
  }, [statusFilter, searchTerm, allExpressions]);

  const loadExpressions = async () => {
    try {
      setLoading(true);
      const data = await expressionService.getAll();
      setAllExpressions(data);
      applyFilters(data, statusFilter, searchTerm);
    } catch (error) {
      console.error('Erreur lors du chargement des expressions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data: ExpressionDeBesoin[], status: string, search: string) => {
    let filtered = [...data];

    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(e => e.statut === status);
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(e => 
        e.titre.toLowerCase().includes(searchLower) ||
        e.division?.nom.toLowerCase().includes(searchLower) ||
        e.service?.nom.toLowerCase().includes(searchLower) ||
        (e.createur?.nom && e.createur.nom.toLowerCase().includes(searchLower)) ||
        (e.createur?.prenom && e.createur.prenom.toLowerCase().includes(searchLower))
      );
    }

    setExpressions(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Pagination
  const totalPages = Math.ceil(expressions.length / itemsPerPage);
  const paginatedExpressions = expressions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get status color for cards/rows
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'BROUILLON': return { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' };
      case 'EN_ATTENTE': return { bg: '#e0e7ff', border: '#6366f1', text: '#3730a3' };
      case 'VALIDE': return { bg: '#d1fae5', border: '#10b981', text: '#065f46' };
      case 'REFUSE': return { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' };
      case 'PRIS_EN_CHARGE': return { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' };
      default: return { bg: '#f1f5f9', border: '#94a3b8', text: '#475569' };
    }
  };



  if (loading) {
    return (
      <Layout>
        <div style={styles.pageWrapper}>
          <div style={styles.container}>
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>⏳</div>
              <h3 style={styles.emptyTitle}>Chargement...</h3>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Check if user is activated
  if (user && !user.actif) {
    return (
      <Layout>
        <AccessDenied
          icon="⚠️"
          title="Compte non activé"
          message="Votre compte n'est pas encore activé. Veuillez contacter l'administrateur pour activer votre compte et accéder à la plateforme."
        />
      </Layout>
    );
  }

  // Check if user is chef de division or admin
  const isChefDivision = user?.divisionDirigee != null;
  const isAdmin = user?.role === 'ADMIN';
  const canCreateExpression = isChefDivision || isAdmin;

  if (user && !canCreateExpression) {
    return (
      <Layout>
        <AccessDenied
          icon="🔐"
          title="Accès restreint"
          message="Vous devez être désigné comme chef de division pour créer des expressions de besoin. Veuillez contacter l'administrateur si vous pensez que c'est une erreur."
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.pageWrapper}>
        <div style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>Gestion des Expressions de Besoin</h1>
              <p style={styles.subtitle}>Gestion des expressions de besoin du CROUS</p>
            </div>
            <button
              onClick={() => navigate('/expressions/create')}
              style={styles.createButton}
            >
              + Nouvelle expression
            </button>
          </div>

          {/* Stats Cards */}
          <div style={styles.statsGrid}>
            <div style={{...styles.statCard, ...styles.statCardBlue}}>
              <div style={styles.statContent}>
                <div>
                  <div style={styles.statNumber}>{stats.total}</div>
                  <div style={styles.statLabel}>TOTAL EXPRESSIONS</div>
                </div>
                <div style={styles.statIcon}>📋</div>
              </div>
            </div>
            <div style={{...styles.statCard, ...styles.statCardOrange}}>
              <div style={styles.statContent}>
                <div>
                  <div style={styles.statNumber}>{stats.brouillon}</div>
                  <div style={styles.statLabel}>BROUILLONS</div>
                </div>
                <div style={styles.statIcon}>📝</div>
              </div>
            </div>
            <div style={{...styles.statCard, ...styles.statCardGreen}}>
              <div style={styles.statContent}>
                <div>
                  <div style={styles.statNumber}>{stats.valide}</div>
                  <div style={styles.statLabel}>VALIDÉES</div>
                </div>
                <div style={styles.statIcon}>✅</div>
              </div>
            </div>
            <div style={{...styles.statCard, ...styles.statCardRed}}>
              <div style={styles.statContent}>
                <div>
                  <div style={styles.statNumber}>{stats.enAttente}</div>
                  <div style={styles.statLabel}>EN ATTENTE</div>
                </div>
                <div style={styles.statIcon}>⏳</div>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div style={styles.filterBar}>
            <div style={styles.searchWrapper}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Rechercher par numéro, fournisseur, bon de livraison..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <div style={styles.selectWrapper}>
              <span style={styles.selectIcon}>☰</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={styles.select}
              >
                <option value="all">Tous les statuts</option>
                <option value="BROUILLON">Brouillons</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="VALIDE">Validées</option>
                <option value="REFUSE">Refusées</option>
              </select>
              <span style={styles.selectArrow}>▼</span>
            </div>
            {/* View Mode Toggle */}
            <div style={styles.viewToggle}>
              <button
                style={{
                  ...styles.viewToggleBtn,
                  ...(viewMode === 'cards' ? styles.viewToggleBtnActive : {})
                }}
                onClick={() => setViewMode('cards')}
              >
                ▦ Cartes
              </button>
              <button
                style={{
                  ...styles.viewToggleBtn,
                  ...(viewMode === 'table' ? styles.viewToggleBtnActive : {})
                }}
                onClick={() => setViewMode('table')}
              >
                ☰ Tableau
              </button>
            </div>
          </div>

      {expressions.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📋</div>
          <h3 style={styles.emptyTitle}>Aucune expression trouvée</h3>
          <p style={styles.emptyText}>Commencez par créer votre première expression de besoin</p>
          <button
            onClick={() => navigate('/expressions/create')}
            style={styles.createButton}
          >
            ✨ Créer la première
          </button>
        </div>
      ) : (
        <>
          {/* Cards View */}
          {viewMode === 'cards' && (
            <div style={styles.grid}>
              {paginatedExpressions.map((expr) => {
                const statusColor = getStatusColor(expr.statut);
                return (
                  <div
                    key={expr.id}
                    style={{
                      ...styles.card,
                      borderLeft: `4px solid ${statusColor.border}`,
                      background: `linear-gradient(135deg, ${statusColor.bg} 0%, #ffffff 30%)`,
                    }}
                    onClick={() => navigate(`/expressions/${expr.id}`)}
                  >
                    {/* Card Header with ID and Status Badge */}
                    <div style={styles.cardHeader}>
                      <div style={styles.cardId}>
                        <span style={styles.idLabel}>EXP-{String(expr.id).padStart(8, '0')}</span>
                        <StatusRibbon status={expr.statut as any} size="small" />
                      </div>
                      <div style={styles.cardDate}>
                        {new Date(expr.dateCreation).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </div>
                    </div>

                    {/* Card Body with Info */}
                    <div style={styles.cardBody}>
                      <div style={styles.cardInfoRow}>
                        <span style={styles.cardInfoIcon}>📋</span>
                        <span style={styles.cardInfoText}>{expr.titre}</span>
                      </div>
                      <div style={styles.cardInfoRow}>
                        <span style={styles.cardInfoIcon}>📦</span>
                        <span style={styles.cardInfoText}>{expr.lignes?.length || 0} lot(s)</span>
                      </div>
                      <div style={styles.cardInfoRow}>
                        <span style={styles.cardInfoIcon}>🏢</span>
                        <span style={styles.cardInfoText}>{expr.division?.nom || '-'}</span>
                      </div>
                      <div style={styles.cardInfoRow}>
                        <span style={styles.cardInfoIcon}>🔧</span>
                        <span style={styles.cardInfoText}>{expr.service?.nom || '-'}</span>
                      </div>
                    </div>

                    {/* Card Footer with Actions */}
                    <div style={styles.cardFooter}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/expressions/${expr.id}`);
                        }}
                        style={styles.detailsButton}
                      >
                        <span style={styles.detailsIcon}>👁</span>
                        Détails
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/expressions/${expr.id}/edit`);
                        }}
                        style={styles.editButton}
                      >
                        ✏️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.tableHeader}>Référence</th>
                    <th style={styles.tableHeader}>Titre</th>
                    <th style={styles.tableHeader}>Division</th>
                    <th style={styles.tableHeader}>Service</th>
                    <th style={styles.tableHeader}>Lots</th>
                    <th style={styles.tableHeader}>Date</th>
                    <th style={styles.tableHeader}>Statut</th>
                    <th style={styles.tableHeader}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedExpressions.map((expr) => {
                    const statusColor = getStatusColor(expr.statut);
                    return (
                      <tr
                        key={expr.id}
                        style={{
                          ...styles.tableRow,
                          background: statusColor.bg,
                          borderLeft: `4px solid ${statusColor.border}`,
                        }}
                        onClick={() => navigate(`/expressions/${expr.id}`)}
                      >
                        <td style={styles.tableCell}>
                          <span style={styles.refBadge}>EXP-{String(expr.id).padStart(8, '0')}</span>
                        </td>
                        <td style={{...styles.tableCell, fontWeight: '600', color: '#1e293b'}}>
                          {expr.titre}
                        </td>
                        <td style={styles.tableCell}>{expr.division?.nom || '-'}</td>
                        <td style={styles.tableCell}>{expr.service?.nom || '-'}</td>
                        <td style={styles.tableCell}>{expr.lignes?.length || 0}</td>
                        <td style={styles.tableCell}>
                          {new Date(expr.dateCreation).toLocaleDateString('fr-FR')}
                        </td>
                        <td style={styles.tableCell}>
                          <StatusRibbon status={expr.statut as any} size="small" />
                        </td>
                        <td style={styles.tableCell}>
                          <div style={styles.tableActions}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/expressions/${expr.id}`);
                              }}
                              style={styles.tableActionBtn}
                            >
                              👁
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/expressions/${expr.id}/edit`);
                              }}
                              style={styles.tableActionBtn}
                            >
                              ✏️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

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
                Page {currentPage} sur {totalPages} ({expressions.length} résultats)
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
      </div>
    </Layout>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    background: '#f8fafc',
    minHeight: '100vh',
  },
  container: {
    padding: '32px',
    maxWidth: '1400px',
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
    border: '3px solid #e2e8f0',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '20px',
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
  createButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    transition: 'all 0.2s ease',
  },
  oldSearchBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    alignItems: 'center',
  },
  oldSearchInput: {
    flex: 1,
    padding: '14px 20px',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(229, 231, 235, 0.8)',
    borderRadius: '12px',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  searchButton: {
    padding: '12px 24px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  oldClearButton: {
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 12px rgba(248, 113, 113, 0.3)',
    transition: 'all 0.3s ease',
  },
  oldFilters: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  oldFilterButton: {
    padding: '10px 20px',
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    color: '#4b5563',
    border: '2px solid rgba(229, 231, 235, 0.8)',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  oldFilterActive: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
    color: 'white',
    border: '2px solid transparent',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(152, 251, 152, 0.3)',
  },
  oldValidateButton: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #98fb98 0%, #10b981 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginLeft: 'auto',
    boxShadow: '0 4px 12px rgba(152, 251, 152, 0.3)',
    transition: 'all 0.3s ease',
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
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  statCardBlue: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
  },
  statCardOrange: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
  },
  statCardGreen: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
  },
  statCardRed: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
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
  filterBar: {
    display: 'flex',
    gap: '16px',
    marginBottom: '28px',
    alignItems: 'center',
  },
  searchWrapper: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: '#ffffff',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    padding: '0 16px',
    transition: 'all 0.2s ease',
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
  selectWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: '#ffffff',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    padding: '0 16px',
    minWidth: '200px',
  },
  selectIcon: {
    fontSize: '16px',
    marginRight: '12px',
    color: '#94a3b8',
  },
  select: {
    flex: 1,
    padding: '14px 24px 14px 0',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: '#1e293b',
    background: 'transparent',
    appearance: 'none',
    cursor: 'pointer',
  },
  selectArrow: {
    position: 'absolute',
    right: '16px',
    fontSize: '10px',
    color: '#94a3b8',
    pointerEvents: 'none',
  },
  gridViewButton: {
    padding: '14px 18px',
    background: '#ffffff',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#64748b',
    transition: 'all 0.2s ease',
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
    marginBottom: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '24px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid #e2e8f0',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e2e8f0',
  },
  cardId: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  idLabel: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#2d3748',
  },
  cardDate: {
    fontSize: '12px',
    color: '#a0aec0',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  },
  cardInfoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cardInfoIcon: {
    fontSize: '16px',
    width: '24px',
  },
  cardInfoText: {
    fontSize: '13px',
    color: '#4a5568',
  },
  cardFooter: {
    display: 'flex',
    gap: '8px',
    paddingTop: '12px',
    borderTop: '1px solid #e2e8f0',
  },
  detailsButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px 16px',
    background: '#e6f2ff',
    color: '#4299e1',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  detailsIcon: {
    fontSize: '14px',
  },
  editButton: {
    padding: '10px 16px',
    background: '#ffffff',
    color: '#4299e1',
    border: '1px solid #4299e1',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  viewToggle: {
    display: 'flex',
    background: '#f1f5f9',
    borderRadius: '10px',
    padding: '4px',
  },
  viewToggleBtn: {
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  viewToggleBtnActive: {
    background: '#ffffff',
    color: '#6366f1',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
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
  refBadge: {
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
  tableActionBtn: {
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
