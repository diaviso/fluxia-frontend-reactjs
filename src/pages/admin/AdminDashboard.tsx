import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/admin.service';
import { divisionService } from '../../services/division.service';
import { serviceService } from '../../services/service.service';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    divisions: 0,
    services: 0,
    expressions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/expressions');
      return;
    }
    loadStats();
  }, [user, navigate]);

  const loadStats = async () => {
    try {
      const [users, divisions, services, expressions] = await Promise.all([
        adminService.getAllUsers(),
        divisionService.getAll(),
        serviceService.getAll(),
        adminService.getAllExpressions(),
      ]);

      setStats({
        users: users.length,
        divisions: divisions.length,
        services: services.length,
        expressions: expressions.length,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={styles.container}>
          <p>Chargement...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.container}>
        <h1 style={styles.title}>🛠️ Panneau d'Administration</h1>

        <div style={styles.statsGrid}>
          <div style={styles.statCard} onClick={() => navigate('/admin/users')}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statNumber}>{stats.users}</div>
            <div style={styles.statLabel}>Utilisateurs</div>
          </div>

          <div style={styles.statCard} onClick={() => navigate('/admin/divisions')}>
            <div style={styles.statIcon}>🏢</div>
            <div style={styles.statNumber}>{stats.divisions}</div>
            <div style={styles.statLabel}>Divisions</div>
          </div>

          <div style={styles.statCard} onClick={() => navigate('/admin/services')}>
            <div style={styles.statIcon}>🔧</div>
            <div style={styles.statNumber}>{stats.services}</div>
            <div style={styles.statLabel}>Services</div>
          </div>

          <div style={styles.statCard} onClick={() => navigate('/admin/expressions')}>
            <div style={styles.statIcon}>📋</div>
            <div style={styles.statNumber}>{stats.expressions}</div>
            <div style={styles.statLabel}>Expressions de Besoin</div>
          </div>
        </div>

        <div style={styles.quickActions}>
          <h2 style={styles.sectionTitle}>Actions Rapides</h2>
          <div style={styles.actionsGrid}>
            <button style={styles.actionButton} onClick={() => navigate('/admin/users')}>
              👥 Gérer les Utilisateurs
            </button>
            <button style={styles.actionButton} onClick={() => navigate('/admin/divisions')}>
              🏢 Gérer les Divisions
            </button>
            <button style={styles.actionButton} onClick={() => navigate('/admin/services')}>
              🔧 Gérer les Services
            </button>
            <button style={styles.actionButton} onClick={() => navigate('/admin/expressions')}>
              📋 Voir toutes les Expressions
            </button>
            <button style={styles.actionButton} onClick={() => navigate('/admin/matieres')}>
              📦 Matières
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '30px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
  },
  statIcon: {
    fontSize: '48px',
    marginBottom: '15px',
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: '10px',
  },
  statLabel: {
    fontSize: '16px',
    color: '#6b7280',
    fontWeight: '500',
  },
  quickActions: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '20px',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  actionButton: {
    padding: '15px 20px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};
