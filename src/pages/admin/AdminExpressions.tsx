import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { adminService, type ExpressionAdmin } from '../../services/admin.service';

export default function AdminExpressions() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [expressions, setExpressions] = useState<ExpressionAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser?.role !== 'ADMIN') {
      navigate('/expressions');
      return;
    }
    loadExpressions();
  }, [currentUser, navigate]);

  const loadExpressions = async () => {
    try {
      const data = await adminService.getAllExpressions();
      setExpressions(data);
    } catch (err) {
      setError('Erreur lors du chargement des expressions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (id: number, currentStatus: string) => {
    const statuts = ['BROUILLON', 'EN_ATTENTE', 'VALIDE', 'REFUSE', 'PRIS_EN_CHARGE'];
    const newStatus = prompt(
      `Changer le statut de l'expression ?\n\nStatut actuel : ${currentStatus}\n\nChoisissez parmi :\n${statuts.join(', ')}`,
      currentStatus
    );

    if (!newStatus || newStatus === currentStatus) return;

    if (!statuts.includes(newStatus.toUpperCase())) {
      alert('Statut invalide');
      return;
    }

    try {
      await adminService.updateExpressionStatus(id, newStatus.toUpperCase() as any);
      await loadExpressions();
      alert('Statut modifié avec succès');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'BROUILLON': return '#6b7280';
      case 'EN_ATTENTE': return '#f59e0b';
      case 'VALIDE': return '#10b981';
      case 'REFUSE': return '#ef4444';
      case 'PRIS_EN_CHARGE': return '#8b5cf6';
      default: return '#6b7280';
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
        <div style={styles.header}>
          <h1 style={styles.title}>📋 Toutes les Expressions de Besoin</h1>
          <button style={styles.backButton} onClick={() => navigate('/admin')}>
            ← Retour au Dashboard
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.info}>
          <p><strong>Note :</strong> En tant qu'administrateur, vous pouvez uniquement changer le statut des expressions. Vous ne pouvez pas les modifier ou les supprimer.</p>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Titre</th>
                <th style={styles.th}>Créateur</th>
                <th style={styles.th}>Division</th>
                <th style={styles.th}>Service</th>
                <th style={styles.th}>Lignes</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expressions.map((expr) => (
                <tr key={expr.id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <strong>{expr.titre}</strong>
                  </td>
                  <td style={styles.td}>
                    {expr.createur.nom} {expr.createur.prenom}
                    <br />
                    <span style={styles.email}>{expr.createur.email}</span>
                  </td>
                  <td style={styles.td}>{expr.division.nom}</td>
                  <td style={styles.td}>{expr.service?.nom || '-'}</td>
                  <td style={styles.td}>{expr._count?.lignes || 0}</td>
                  <td style={styles.td}>
                    {new Date(expr.dateCreation).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(expr.statut),
                    }}>
                      {expr.statut}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        style={styles.viewButton}
                        onClick={() => navigate(`/expressions/${expr.id}`)}
                      >
                        👁️ Voir
                      </button>
                      <button
                        style={styles.statusButton}
                        onClick={() => handleChangeStatus(expr.id, expr.statut)}
                      >
                        🔄 Statut
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {expressions.length === 0 && (
          <div style={styles.empty}>
            <p>Aucune expression de besoin trouvée.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  error: {
    padding: '15px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  info: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    color: '#1e40af',
    fontSize: '14px',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  tableHeaderRow: {
    backgroundColor: '#f3f4f6',
  },
  th: {
    padding: '15px',
    textAlign: 'left' as const,
    fontSize: '14px',
    fontWeight: '700',
    color: '#374151',
    borderBottom: '2px solid #e5e7eb',
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '15px',
    fontSize: '14px',
    color: '#1f2937',
  },
  email: {
    fontSize: '12px',
    color: '#6b7280',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '600',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  viewButton: {
    padding: '6px 12px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  statusButton: {
    padding: '6px 12px',
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  empty: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#6b7280',
  },
};
