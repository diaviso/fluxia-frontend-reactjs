import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { divisionService, type Division } from '../../services/division.service';
import { adminService } from '../../services/admin.service';

export default function AdminDivisions() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    directeurId: undefined as number | undefined,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser?.role !== 'ADMIN') {
      navigate('/expressions');
      return;
    }
    loadData();
  }, [currentUser, navigate]);

  const loadData = async () => {
    try {
      const [divisionsData, usersData] = await Promise.all([
        divisionService.getAll(),
        adminService.getAllUsers(),
      ]);
      setDivisions(divisionsData);
      setUsers(usersData);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingId) {
        await divisionService.update(editingId, formData);
      } else {
        await divisionService.create(formData);
      }
      await loadData();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (division: Division) => {
    setEditingId(division.id);
    setFormData({
      nom: division.nom,
      code: division.code,
      directeurId: division.directeurId,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number, nom: string) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer la division "${nom}" ?\n\nCette action est irréversible et ne peut être effectuée que si la division n'a aucune expression de besoin.`)) {
      return;
    }

    try {
      await divisionService.delete(id);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({ nom: '', code: '', directeurId: undefined });
    setEditingId(null);
    setShowForm(false);
    setError('');
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
          <h1 style={styles.title}>🏢 Gestion des Divisions</h1>
          <div style={styles.headerActions}>
            <button
              style={styles.addButton}
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? '✕ Annuler' : '+ Nouvelle Division'}
            </button>
            <button style={styles.backButton} onClick={() => navigate('/admin')}>
              ← Retour
            </button>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {showForm && (
          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>
              {editingId ? 'Modifier la Division' : 'Nouvelle Division'}
            </h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nom *</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Directeur</label>
                <select
                  value={formData.directeurId || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    directeurId: e.target.value ? Number(e.target.value) : undefined
                  })}
                  style={styles.input}
                >
                  <option value="">Aucun</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nom} {user.prenom} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formActions}>
                <button type="submit" style={styles.submitButton}>
                  {editingId ? 'Modifier' : 'Créer'}
                </button>
                <button type="button" style={styles.cancelButton} onClick={resetForm}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Nom</th>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Directeur</th>
                <th style={styles.th}>Services</th>
                <th style={styles.th}>Utilisateurs</th>
                <th style={styles.th}>Expressions</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {divisions.map((division) => (
                <tr key={division.id} style={styles.tableRow}>
                  <td style={styles.td}>{division.nom}</td>
                  <td style={styles.td}>
                    <span style={styles.codeBadge}>{division.code}</span>
                  </td>
                  <td style={styles.td}>
                    {division.directeur ? (
                      `${division.directeur.nom} ${division.directeur.prenom}`
                    ) : (
                      <span style={styles.noDirector}>Aucun directeur</span>
                    )}
                  </td>
                  <td style={styles.td}>{division.services?.length || 0}</td>
                  <td style={styles.td}>{division._count?.users || 0}</td>
                  <td style={styles.td}>{division._count?.expressions || 0}</td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        style={styles.editButton}
                        onClick={() => handleEdit(division)}
                      >
                        ✏️ Modifier
                      </button>
                      {division._count?.expressions === 0 && (
                        <button
                          style={styles.deleteButton}
                          onClick={() => handleDelete(division.id, division.nom)}
                        >
                          🗑️ Supprimer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
  headerActions: {
    display: 'flex',
    gap: '10px',
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
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
  formContainer: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '30px',
  },
  formTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
  },
  formActions: {
    display: 'flex',
    gap: '10px',
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#e5e7eb',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
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
  codeBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    fontSize: '12px',
    fontWeight: '600',
  },
  noDirector: {
    color: '#9ca3af',
    fontStyle: 'italic' as const,
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    padding: '6px 12px',
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '6px 12px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
