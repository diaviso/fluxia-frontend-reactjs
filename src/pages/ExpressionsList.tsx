import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { expressionService, type ExpressionDeBesoin } from '../services/expression.service';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { StatusRibbon } from '../components/StatusRibbon';
import { AccessDenied } from '../components/AccessDenied';

export const ExpressionsList = () => {
  const [expressions, setExpressions] = useState<ExpressionDeBesoin[]>([]);
  const [allExpressions, setAllExpressions] = useState<ExpressionDeBesoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
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
            <button style={styles.gridViewButton}>☰</button>
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
        <div style={styles.grid}>
          {expressions.map((expr) => (
            <div
              key={expr.id}
              style={styles.card}
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
                  <span style={styles.cardInfoIcon}>�</span>
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
          ))}
        </div>
      )}
      </div>
      </div>
    </Layout>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    background: '#f5f7fa',
    minHeight: '100vh',
  },
  container: {
    padding: '24px',
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
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a202c',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#718096',
    marginTop: '4px',
  },
  createButton: {
    padding: '12px 24px',
    background: '#4299e1',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    borderRadius: '12px',
    padding: '24px',
    color: '#ffffff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease',
  },
  statCardBlue: {
    background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
  },
  statCardOrange: {
    background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
  },
  statCardGreen: {
    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
  },
  statCardRed: {
    background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
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
    gap: '12px',
    marginBottom: '24px',
    alignItems: 'center',
  },
  searchWrapper: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '0 16px',
  },
  searchIcon: {
    fontSize: '18px',
    marginRight: '12px',
    color: '#a0aec0',
  },
  searchInput: {
    flex: 1,
    padding: '12px 0',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: '#2d3748',
    background: 'transparent',
  },
  selectWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '0 16px',
    minWidth: '200px',
  },
  selectIcon: {
    fontSize: '16px',
    marginRight: '12px',
    color: '#a0aec0',
  },
  select: {
    flex: 1,
    padding: '12px 24px 12px 0',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: '#2d3748',
    background: 'transparent',
    appearance: 'none',
    cursor: 'pointer',
  },
  selectArrow: {
    position: 'absolute',
    right: '16px',
    fontSize: '10px',
    color: '#a0aec0',
    pointerEvents: 'none',
  },
  gridViewButton: {
    padding: '12px 16px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#4a5568',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#718096',
    marginBottom: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
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
};
