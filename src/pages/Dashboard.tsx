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
    return <Layout><div style={{padding:'20px'}}>Chargement...</div></Layout>;
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
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>Tableau de bord</h1>
              <p style={styles.subtitle}>Bienvenue, {user?.prenom || user?.nom || user?.email}</p>
            </div>
            <button onClick={() => navigate('/expressions/create')} style={styles.createButton}>
              + Nouvelle Expression
            </button>
          </div>

          <div style={styles.statsGrid}>
            <div style={{...styles.statCard, ...styles.statCardBlue}}>
              <div style={styles.statContent}>
                <div>
                  <div style={styles.statValue}>{stats.totalExpressions}</div>
                  <div style={styles.statLabel}>TOTAL EXPRESSIONS</div>
                </div>
                <div style={styles.statIcon}>📋</div>
              </div>
            </div>
            
            <div style={{...styles.statCard, ...styles.statCardOrange}}>
              <div style={styles.statContent}>
                <div>
                  <div style={styles.statValue}>{stats.brouillon}</div>
                  <div style={styles.statLabel}>BROUILLONS</div>
                </div>
                <div style={styles.statIcon}>📝</div>
              </div>
            </div>
            
            <div style={{...styles.statCard, ...styles.statCardGreen}}>
              <div style={styles.statContent}>
                <div>
                  <div style={styles.statValue}>{stats.valide}</div>
                  <div style={styles.statLabel}>VALIDÉES</div>
                </div>
                <div style={styles.statIcon}>✅</div>
              </div>
            </div>
            
            <div style={{...styles.statCard, ...styles.statCardPurple}}>
              <div style={styles.statContent}>
                <div>
                  <div style={styles.statValue}>{stats.enAttente}</div>
                  <div style={styles.statLabel}>EN ATTENTE</div>
                </div>
                <div style={styles.statIcon}>⏳</div>
              </div>
            </div>
            
          </div>

        <div style={styles.chartsGrid}>
          <div style={styles.chartCard}>
            <h2 style={styles.chartTitle}>📊 Par Statut</h2>
            {[
              {name:'Brouillon',count:stats.brouillon,color:'#6b7280'},
              {name:'En Attente',count:stats.enAttente,color:'#f59e0b'},
              {name:'Validé',count:stats.valide,color:'#10b981'},
              {name:'Refusé',count:stats.refuse,color:'#ef4444'},
              {name:'Pris en Charge',count:stats.prisEnCharge,color:'#8b5cf6'},
            ].map(item => (
              <div key={item.name} style={styles.statusItem}>
                <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                  <span style={{width:'12px',height:'12px',borderRadius:'50%',backgroundColor:item.color}}/>
                  <span>{item.name}</span>
                </div>
                <div style={{display:'flex',gap:'12px'}}>
                  <span style={{fontWeight:'bold'}}>{item.count}</span>
                  <span style={{color:'#6b7280'}}>
                    {stats.totalExpressions>0?Math.round((item.count/stats.totalExpressions)*100):0}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.chartCard}>
            <h2 style={styles.chartTitle}>🚀 Actions Rapides</h2>
            <button style={styles.actionBtn} onClick={()=>navigate('/expressions/create')}>
              ➕ Nouvelle Expression
            </button>
            <button style={styles.actionBtn} onClick={()=>navigate('/expressions')}>
              📄 Mes Expressions
            </button>
            {(user?.role==='VALIDATEUR'||user?.role==='ADMIN')&&(
              <button style={styles.actionBtn} onClick={()=>navigate('/expressions/validate')}>
                ✅ Validation
              </button>
            )}
            {user?.role==='ADMIN'&&(
              <button style={styles.actionBtn} onClick={()=>navigate('/admin')}>
                🛠️ Administration
              </button>
            )}
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
}

const styles: {[key:string]:React.CSSProperties} = {
  container: {
    background: '#f5f7fa',
    minHeight: '100vh',
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px',
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
  statCardPurple: {
    background: 'linear-gradient(135deg, #9f7aea 0%, #805ad5 100%)',
  },
  statContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statValue: {
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
  statIconWrapper: {
    flexShrink: 0,
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px',
  },
  chartCard: {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  chartTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '16px',
  },
  statusItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '14px',
    color: '#4a5568',
  },
  actionBtn: {
    width: '100%',
    padding: '12px 16px',
    background: '#f7fafc',
    color: '#2d3748',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '8px',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  },
};
