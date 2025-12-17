import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { adminService, type User } from '../../services/admin.service';

export default function AdminUsers() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser?.role !== 'ADMIN') {
      navigate('/expressions');
      return;
    }
    loadUsers();
  }, [currentUser, navigate]);

  const loadUsers = async () => {
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    if (!window.confirm(`Voulez-vous ${currentStatus ? 'désactiver' : 'activer'} cet utilisateur ?`)) {
      return;
    }

    try {
      await adminService.toggleUserStatus(userId, !currentStatus);
      await loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la modification du statut');
    }
  };

  const handleChangeRole = async (userId: number, currentRole: string, userName: string) => {
    const newRole = prompt(
      `Changer le rôle de "${userName}" ?\n\nRôle actuel : ${currentRole}\n\nChoisissez parmi :\nAGENT, VALIDATEUR, ADMIN`,
      currentRole
    );

    if (!newRole || newRole === currentRole) return;

    const validRoles = ['AGENT', 'VALIDATEUR', 'ADMIN'];
    if (!validRoles.includes(newRole.toUpperCase())) {
      alert('Rôle invalide. Choisissez parmi : AGENT, VALIDATEUR, ADMIN');
      return;
    }

    try {
      await adminService.updateUserRole(userId, newRole.toUpperCase() as any);
      await loadUsers();
      alert('Rôle modifié avec succès');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la modification du rôle');
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer l'utilisateur "${userName}" ?\n\nCette action est irréversible et ne peut être effectuée que si l'utilisateur n'a aucune expression de besoin.`)) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      await loadUsers();
      alert('Utilisateur supprimé avec succès');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return '#dc2626';
      case 'VALIDATEUR': return '#ea580c';
      case 'AGENT': return '#2563eb';
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
          <h1 style={styles.title}>👥 Gestion des Utilisateurs</h1>
          <button style={styles.backButton} onClick={() => navigate('/admin')}>
            ← Retour au Dashboard
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Nom</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Rôle</th>
                <th style={styles.th}>Division</th>
                <th style={styles.th}>Directeur de</th>
                <th style={styles.th}>Expressions</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={styles.tableRow}>
                  <td style={styles.td}>
                    {user.nom} {user.prenom}
                  </td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: getRoleBadgeColor(user.role),
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {user.division ? user.division.nom : '-'}
                  </td>
                  <td style={styles.td}>
                    {user.divisionDirigee ? (
                      <span style={styles.directorBadge}>
                        🏢 {user.divisionDirigee.nom}
                      </span>
                    ) : '-'}
                  </td>
                  <td style={styles.td}>
                    {user._count?.expressionsDeBesoin || 0}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: user.actif ? '#10b981' : '#ef4444',
                    }}>
                      {user.actif ? '✓ Actif' : '✗ Inactif'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        style={{
                          ...styles.actionButton,
                          backgroundColor: '#8b5cf6',
                        }}
                        onClick={() => handleChangeRole(user.id, user.role, `${user.nom} ${user.prenom}`)}
                      >
                        Changer rôle
                      </button>
                      <button
                        style={{
                          ...styles.actionButton,
                          backgroundColor: user.actif ? '#f59e0b' : '#10b981',
                        }}
                        onClick={() => handleToggleStatus(user.id, user.actif)}
                      >
                        {user.actif ? 'Désactiver' : 'Activer'}
                      </button>
                      {user._count?.expressionsDeBesoin === 0 && !user.divisionDirigee && (
                        <button
                          style={{
                            ...styles.actionButton,
                            backgroundColor: '#ef4444',
                          }}
                          onClick={() => handleDeleteUser(user.id, `${user.nom} ${user.prenom}`)}
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.info}>
          <p><strong>Note :</strong> Un utilisateur ne peut être supprimé que s'il n'a aucune expression de besoin et n'est pas directeur d'une division.</p>
        </div>
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
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '600',
  },
  directorBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    backgroundColor: '#8b5cf6',
    color: 'white',
    fontSize: '12px',
    fontWeight: '600',
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
  actionButton: {
    padding: '6px 12px',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  info: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    color: '#1e40af',
    fontSize: '14px',
  },
};
