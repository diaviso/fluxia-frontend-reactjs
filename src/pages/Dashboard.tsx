import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { expressionService } from '../services/expression.service';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { AccessDenied } from '../components/AccessDenied';
import { divisionService } from '../services/division.service';
import { serviceService } from '../services/service.service';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExpressions: 0,
    brouillon: 0,
    enAttente: 0,
    valide: 0,
    refuse: 0,
    prisEnCharge: 0,
    divisions: 0,
    services: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [expressions, divisions, services] = await Promise.all([
        expressionService.getAll(),
        divisionService.getAll(),
        serviceService.getAll(),
      ]);

      setStats({
        totalExpressions: expressions.length,
        brouillon: expressions.filter(e => e.statut === 'BROUILLON').length,
        enAttente: expressions.filter(e => e.statut === 'EN_ATTENTE').length,
        valide: expressions.filter(e => e.statut === 'VALIDE').length,
        refuse: expressions.filter(e => e.statut === 'REFUSE').length,
        prisEnCharge: expressions.filter(e => e.statut === 'PRIS_EN_CHARGE').length,
        divisions: divisions.length,
        services: services.length,
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <span style={styles.loadingText}>Chargement...</span>
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

  const statusItems = [
    { name: 'Brouillon', count: stats.brouillon, color: '#64748b', icon: '📝' },
    { name: 'En Attente', count: stats.enAttente, color: '#f59e0b', icon: '⏳' },
    { name: 'Validé', count: stats.valide, color: '#10b981', icon: '✅' },
    { name: 'Refusé', count: stats.refuse, color: '#ef4444', icon: '❌' },
    { name: 'Pris en Charge', count: stats.prisEnCharge, color: '#8b5cf6', icon: '📦' },
  ];

  return (
    <Layout>
      <div style={styles.container}>
        {/* Welcome Section */}
        <div style={styles.welcomeSection}>
          <div style={styles.welcomeContent}>
            <h1 style={styles.welcomeTitle}>
              Bonjour, {user?.prenom || user?.nom || 'Utilisateur'} 👋
            </h1>
            <p style={styles.welcomeSubtitle}>
              Bienvenue sur votre tableau de bord. Voici un aperçu de vos expressions de besoin.
            </p>
          </div>
          <button onClick={() => navigate('/expressions/create')} style={styles.createButton}>
            <span style={styles.createButtonIcon}>+</span>
            Nouvelle Expression
          </button>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard} onClick={() => navigate('/expressions')}>
            <div style={styles.statIconWrapper}>
              <span style={{...styles.statIconBg, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'}}>📋</span>
            </div>
            <div style={styles.statInfo}>
              <span style={styles.statValue}>{stats.totalExpressions}</span>
              <span style={styles.statLabel}>Total Expressions</span>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIconWrapper}>
              <span style={{...styles.statIconBg, background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)'}}>📝</span>
            </div>
            <div style={styles.statInfo}>
              <span style={styles.statValue}>{stats.brouillon}</span>
              <span style={styles.statLabel}>Brouillons</span>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIconWrapper}>
              <span style={{...styles.statIconBg, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>✅</span>
            </div>
            <div style={styles.statInfo}>
              <span style={styles.statValue}>{stats.valide}</span>
              <span style={styles.statLabel}>Validées</span>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIconWrapper}>
              <span style={{...styles.statIconBg, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>⏳</span>
            </div>
            <div style={styles.statInfo}>
              <span style={styles.statValue}>{stats.enAttente}</span>
              <span style={styles.statLabel}>En Attente</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={styles.contentGrid}>
          {/* Status Breakdown */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>📊 Répartition par Statut</h2>
            </div>
            <div style={styles.cardBody}>
              {statusItems.map(item => (
                <div key={item.name} style={styles.statusRow}>
                  <div style={styles.statusLeft}>
                    <span style={{...styles.statusDot, backgroundColor: item.color}}></span>
                    <span style={styles.statusIcon}>{item.icon}</span>
                    <span style={styles.statusName}>{item.name}</span>
                  </div>
                  <div style={styles.statusRight}>
                    <span style={styles.statusCount}>{item.count}</span>
                    <div style={styles.progressBarContainer}>
                      <div 
                        style={{
                          ...styles.progressBar,
                          width: `${stats.totalExpressions > 0 ? (item.count / stats.totalExpressions) * 100 : 0}%`,
                          backgroundColor: item.color,
                        }}
                      ></div>
                    </div>
                    <span style={styles.statusPercent}>
                      {stats.totalExpressions > 0 ? Math.round((item.count / stats.totalExpressions) * 100) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>🚀 Actions Rapides</h2>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.actionsGrid}>
                <button style={styles.actionCard} onClick={() => navigate('/expressions/create')}>
                  <span style={styles.actionIcon}>➕</span>
                  <span style={styles.actionLabel}>Nouvelle Expression</span>
                </button>
                <button style={styles.actionCard} onClick={() => navigate('/expressions')}>
                  <span style={styles.actionIcon}>📄</span>
                  <span style={styles.actionLabel}>Mes Expressions</span>
                </button>
                {(user?.role === 'VALIDATEUR' || user?.role === 'ADMIN') && (
                  <button style={styles.actionCard} onClick={() => navigate('/expressions/validate')}>
                    <span style={styles.actionIcon}>✅</span>
                    <span style={styles.actionLabel}>Validation</span>
                  </button>
                )}
                {user?.role === 'ADMIN' && (
                  <button style={styles.actionCard} onClick={() => navigate('/admin')}>
                    <span style={styles.actionIcon}>🛠️</span>
                    <span style={styles.actionLabel}>Administration</span>
                  </button>
                )}
                <button style={styles.actionCard} onClick={() => navigate('/profile')}>
                  <span style={styles.actionIcon}>👤</span>
                  <span style={styles.actionLabel}>Mon Profil</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        {user?.divisionDirigee && (
          <div style={styles.infoBox}>
            <span style={styles.infoIcon}>🏢</span>
            <div style={styles.infoContent}>
              <span style={styles.infoTitle}>Chef de Division</span>
              <span style={styles.infoText}>
                Vous êtes responsable de la division <strong>{user.divisionDirigee.nom}</strong>
              </span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

const styles: {[key:string]:React.CSSProperties} = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    //margin: '0 auto',
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
  welcomeSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    padding: '28px 32px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    borderRadius: '20px',
    color: '#ffffff',
    boxShadow: '0 10px 40px rgba(99, 102, 241, 0.3)',
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 8px 0',
  },
  welcomeSubtitle: {
    fontSize: '15px',
    opacity: 0.9,
    margin: 0,
  },
  createButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    color: '#ffffff',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  createButtonIcon: {
    fontSize: '20px',
    fontWeight: '700',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  statCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid #e2e8f0',
  },
  statIconWrapper: {
    flexShrink: 0,
  },
  statIconBg: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  cardHeader: {
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
  cardBody: {
    padding: '20px 24px',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  statusLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  statusIcon: {
    fontSize: '18px',
  },
  statusName: {
    fontSize: '14px',
    color: '#475569',
    fontWeight: '500',
  },
  statusRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statusCount: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b',
    minWidth: '30px',
  },
  progressBarContainer: {
    width: '80px',
    height: '6px',
    background: '#e2e8f0',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  statusPercent: {
    fontSize: '13px',
    color: '#64748b',
    minWidth: '40px',
    textAlign: 'right',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
  },
  actionCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    padding: '20px 16px',
    background: '#f8fafc',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  actionIcon: {
    fontSize: '28px',
  },
  actionLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  infoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 24px',
    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    borderRadius: '14px',
    border: '1px solid #bfdbfe',
  },
  infoIcon: {
    fontSize: '32px',
  },
  infoContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  infoTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e40af',
  },
  infoText: {
    fontSize: '14px',
    color: '#3b82f6',
  },
};
