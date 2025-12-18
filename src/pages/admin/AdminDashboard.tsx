import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout, StatsCard } from '../../components/admin';
import { adminService } from '../../services/admin.service';
import { divisionService } from '../../services/division.service';
import { serviceService } from '../../services/service.service';
import { matiereService } from '../../services/matiere.service';

interface Stats {
  users: number;
  divisions: number;
  services: number;
  expressions: number;
  matieres: number;
  activeUsers: number;
  pendingExpressions: number;
  validatedExpressions: number;
}


export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    users: 0,
    divisions: 0,
    services: 0,
    expressions: 0,
    matieres: 0,
    activeUsers: 0,
    pendingExpressions: 0,
    validatedExpressions: 0,
  });
  const [recentExpressions, setRecentExpressions] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [users, divisions, services, expressions, matieres] = await Promise.all([
        adminService.getAllUsers(),
        divisionService.getAll(),
        serviceService.getAll(),
        adminService.getAllExpressions(),
        matiereService.getAll(),
      ]);

      const activeUsers = users.filter((u: any) => u.actif).length;
      const pendingExpressions = expressions.filter((e: any) => e.statut === 'EN_ATTENTE').length;
      const validatedExpressions = expressions.filter((e: any) => e.statut === 'VALIDE').length;

      setStats({
        users: users.length,
        divisions: divisions.length,
        services: services.length,
        expressions: expressions.length,
        matieres: matieres.length,
        activeUsers,
        pendingExpressions,
        validatedExpressions,
      });

      setRecentExpressions(expressions.slice(0, 5));
      setRecentUsers(users.slice(0, 5));
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { bg: string; color: string; label: string } } = {
      BROUILLON: { bg: '#f1f5f9', color: '#475569', label: 'Brouillon' },
      EN_ATTENTE: { bg: '#fef3c7', color: '#92400e', label: 'En attente' },
      VALIDE: { bg: '#dcfce7', color: '#166534', label: 'Validé' },
      REFUSE: { bg: '#fee2e2', color: '#991b1b', label: 'Refusé' },
      PRIS_EN_CHARGE: { bg: '#dbeafe', color: '#1e40af', label: 'Pris en charge' },
    };
    const config = statusConfig[status] || statusConfig.BROUILLON;
    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '600',
        background: config.bg,
        color: config.color,
      }}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Chargement du tableau de bord...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Tableau de bord</h1>
            <p style={styles.pageSubtitle}>Vue d'ensemble de votre système</p>
          </div>
          <button style={styles.refreshBtn} onClick={loadData}>
            🔄 Actualiser
          </button>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <StatsCard
            title="Utilisateurs"
            value={stats.users}
            icon="👥"
            color="blue"
            onClick={() => navigate('/admin/users')}
          />
          <StatsCard
            title="Divisions"
            value={stats.divisions}
            icon="🏢"
            color="purple"
            onClick={() => navigate('/admin/divisions')}
          />
          <StatsCard
            title="Services"
            value={stats.services}
            icon="🔧"
            color="cyan"
            onClick={() => navigate('/admin/services')}
          />
          <StatsCard
            title="Matières"
            value={stats.matieres}
            icon="📦"
            color="orange"
            onClick={() => navigate('/admin/matieres')}
          />
        </div>

        {/* Secondary Stats */}
        <div style={styles.secondaryStats}>
          <div style={styles.statBox}>
            <div style={styles.statBoxIcon}>✅</div>
            <div style={styles.statBoxInfo}>
              <span style={styles.statBoxValue}>{stats.activeUsers}</span>
              <span style={styles.statBoxLabel}>Utilisateurs actifs</span>
            </div>
          </div>
          <div style={styles.statBox}>
            <div style={{ ...styles.statBoxIcon, background: '#fef3c7' }}>⏳</div>
            <div style={styles.statBoxInfo}>
              <span style={styles.statBoxValue}>{stats.pendingExpressions}</span>
              <span style={styles.statBoxLabel}>En attente de validation</span>
            </div>
          </div>
          <div style={styles.statBox}>
            <div style={{ ...styles.statBoxIcon, background: '#dcfce7' }}>✓</div>
            <div style={styles.statBoxInfo}>
              <span style={styles.statBoxValue}>{stats.validatedExpressions}</span>
              <span style={styles.statBoxLabel}>Expressions validées</span>
            </div>
          </div>
          <div style={styles.statBox}>
            <div style={{ ...styles.statBoxIcon, background: '#dbeafe' }}>📋</div>
            <div style={styles.statBoxInfo}>
              <span style={styles.statBoxValue}>{stats.expressions}</span>
              <span style={styles.statBoxLabel}>Total expressions</span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div style={styles.contentGrid}>
          {/* Recent Expressions */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>📋 Expressions récentes</h2>
              <button
                style={styles.viewAllBtn}
                onClick={() => navigate('/admin/expressions')}
              >
                Voir tout →
              </button>
            </div>
            <div style={styles.cardContent}>
              {recentExpressions.length === 0 ? (
                <div style={styles.emptyState}>
                  <span style={styles.emptyIcon}>📭</span>
                  <span>Aucune expression</span>
                </div>
              ) : (
                <div style={styles.list}>
                  {recentExpressions.map((expr) => (
                    <div key={expr.id} style={styles.listItem}>
                      <div style={styles.listItemMain}>
                        <span style={styles.listItemTitle}>{expr.titre}</span>
                        <span style={styles.listItemMeta}>
                          {expr.createur?.prenom} {expr.createur?.nom} • {formatDate(expr.dateCreation)}
                        </span>
                      </div>
                      {getStatusBadge(expr.statut)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>👥 Utilisateurs récents</h2>
              <button
                style={styles.viewAllBtn}
                onClick={() => navigate('/admin/users')}
              >
                Voir tout →
              </button>
            </div>
            <div style={styles.cardContent}>
              {recentUsers.length === 0 ? (
                <div style={styles.emptyState}>
                  <span style={styles.emptyIcon}>👤</span>
                  <span>Aucun utilisateur</span>
                </div>
              ) : (
                <div style={styles.list}>
                  {recentUsers.map((user) => (
                    <div key={user.id} style={styles.listItem}>
                      <div style={styles.userItem}>
                        {user.photo ? (
                          <img src={user.photo} alt="" style={styles.userAvatar} />
                        ) : (
                          <div style={styles.userAvatarPlaceholder}>
                            {user.prenom?.[0] || user.nom?.[0] || '?'}
                          </div>
                        )}
                        <div style={styles.listItemMain}>
                          <span style={styles.listItemTitle}>
                            {user.prenom} {user.nom}
                          </span>
                          <span style={styles.listItemMeta}>{user.email}</span>
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: user.role === 'ADMIN' ? '#fee2e2' : user.role === 'VALIDATEUR' ? '#fef3c7' : '#dbeafe',
                        color: user.role === 'ADMIN' ? '#991b1b' : user.role === 'VALIDATEUR' ? '#92400e' : '#1e40af',
                      }}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.quickActions}>
          <h2 style={styles.sectionTitle}>⚡ Actions rapides</h2>
          <div style={styles.actionsGrid}>
            <button style={styles.actionCard} onClick={() => navigate('/admin/users')}>
              <span style={styles.actionIcon}>👥</span>
              <span style={styles.actionLabel}>Gérer les utilisateurs</span>
            </button>
            <button style={styles.actionCard} onClick={() => navigate('/admin/divisions')}>
              <span style={styles.actionIcon}>🏢</span>
              <span style={styles.actionLabel}>Gérer les divisions</span>
            </button>
            <button style={styles.actionCard} onClick={() => navigate('/admin/services')}>
              <span style={styles.actionIcon}>🔧</span>
              <span style={styles.actionLabel}>Gérer les services</span>
            </button>
            <button style={styles.actionCard} onClick={() => navigate('/admin/matieres')}>
              <span style={styles.actionIcon}>📦</span>
              <span style={styles.actionLabel}>Gérer les matières</span>
            </button>
            <button style={styles.actionCard} onClick={() => navigate('/admin/expressions')}>
              <span style={styles.actionIcon}>📋</span>
              <span style={styles.actionLabel}>Voir les expressions</span>
            </button>
            <button style={styles.actionCard} onClick={() => navigate('/dashboard')}>
              <span style={styles.actionIcon}>🏠</span>
              <span style={styles.actionLabel}>Retour à l'application</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    color: '#64748b',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '4px 0 0 0',
  },
  refreshBtn: {
    padding: '10px 20px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    color: '#475569',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },
  secondaryStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  statBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  statBoxIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: '#ede9fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  statBoxInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  statBoxValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
  },
  statBoxLabel: {
    fontSize: '13px',
    color: '#64748b',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
    background: '#f8fafc',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
  },
  viewAllBtn: {
    background: 'none',
    border: 'none',
    color: '#6366f1',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cardContent: {
    padding: '16px 24px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
    color: '#94a3b8',
  },
  emptyIcon: {
    fontSize: '32px',
    marginBottom: '8px',
    opacity: 0.5,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  listItemMain: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  listItemTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e293b',
  },
  listItemMeta: {
    fontSize: '12px',
    color: '#64748b',
  },
  userItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  userAvatarPlaceholder: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b',
  },
  quickActions: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '16px',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  actionCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '24px',
    background: '#ffffff',
    border: '2px solid #e2e8f0',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  actionIcon: {
    fontSize: '28px',
  },
  actionLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#475569',
    textAlign: 'center',
  },
};
