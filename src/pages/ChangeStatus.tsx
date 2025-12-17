import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { expressionService } from '../services/expression.service';
import type { ExpressionDeBesoin } from '../services/expression.service';
import { Layout } from '../components/Layout';

export default function ChangeStatus() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expression, setExpression] = useState<ExpressionDeBesoin | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [commentaire, setCommentaire] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadExpression();
  }, [id]);

  const loadExpression = async () => {
    try {
      setLoading(true);
      const data = await expressionService.getById(Number(id));
      setExpression(data);
      setSelectedStatus(data.statut);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedStatus) {
      setError('Veuillez sélectionner un statut');
      return;
    }

    try {
      setSubmitting(true);
      await expressionService.updateStatut(Number(id), selectedStatus, commentaire || undefined);
      navigate(`/expressions/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du changement de statut');
    } finally {
      setSubmitting(false);
    }
  };

  const getAvailableStatuses = () => {
    if (!expression) return [];

    const currentStatus = expression.statut;
    const statuses = [];

    switch (currentStatus) {
      case 'BROUILLON':
        statuses.push(
          { value: 'BROUILLON', label: 'Brouillon (garder en brouillon)' },
          { value: 'EN_ATTENTE', label: 'En attente (soumettre au supérieur)' }
        );
        break;
      case 'EN_ATTENTE':
        statuses.push(
          { value: 'EN_ATTENTE', label: 'En attente (garder en attente)' },
          { value: 'BROUILLON', label: 'Brouillon (retirer de la validation)' }
        );
        break;
      case 'VALIDE':
        statuses.push(
          { value: 'VALIDE', label: 'Validé (garder validé)' },
          { value: 'PRIS_EN_CHARGE', label: 'Pris en charge (traitement en cours)' }
        );
        break;
      case 'REFUSE':
        statuses.push(
          { value: 'REFUSE', label: 'Refusé (garder refusé)' },
          { value: 'BROUILLON', label: 'Brouillon (modifier et resoumettre)' }
        );
        break;
      case 'PRIS_EN_CHARGE':
        statuses.push(
          { value: 'PRIS_EN_CHARGE', label: 'Pris en charge (garder en traitement)' }
        );
        break;
      default:
        break;
    }

    return statuses;
  };

  const getStatutBadge = (statut: string) => {
    const styles: { [key: string]: React.CSSProperties } = {
      BROUILLON: { backgroundColor: '#f3f4f6', color: '#374151' },
      EN_ATTENTE: { backgroundColor: '#fef3c7', color: '#92400e' },
      VALIDE: { backgroundColor: '#d1fae5', color: '#065f46' },
      REFUSE: { backgroundColor: '#fee2e2', color: '#991b1b' },
      PRIS_EN_CHARGE: { backgroundColor: '#dbeafe', color: '#1e40af' },
    };

    return (
      <span style={{ ...badgeStyle, ...styles[statut] }}>
        {statut.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div style={styles.container}>
          <div style={styles.loading}>Chargement...</div>
        </div>
      </Layout>
    );
  }

  if (!expression) {
    return (
      <Layout>
        <div style={styles.container}>
          <div style={styles.error}>Expression non trouvée</div>
        </div>
      </Layout>
    );
  }

  const availableStatuses = getAvailableStatuses();

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Changer le statut de l'expression</h1>
          <button onClick={() => navigate(`/expressions/${id}`)} style={styles.backButton}>
            ← Retour
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.expressionInfo}>
            <h2 style={styles.expressionTitle}>{expression.titre}</h2>
            <div style={styles.infoRow}>
              <span style={styles.label}>Statut actuel:</span>
              {getStatutBadge(expression.statut)}
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Division:</span>
              <span>{expression.division?.nom || '-'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Service:</span>
              <span>{expression.service?.nom || '-'}</span>
            </div>
          </div>

          {error && <div style={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>
                Nouveau statut <span style={styles.required}>*</span>
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={styles.select}
                required
              >
                {availableStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <div style={styles.hint}>
                {expression.statut === 'BROUILLON' && selectedStatus === 'EN_ATTENTE' && (
                  <p style={styles.hintText}>
                    ℹ️ L'expression sera soumise à votre supérieur hiérarchique pour validation
                  </p>
                )}
                {expression.statut === 'REFUSE' && selectedStatus === 'BROUILLON' && (
                  <p style={styles.hintText}>
                    ℹ️ Vous pourrez modifier l'expression et la resoumettre
                  </p>
                )}
                {selectedStatus === 'PRIS_EN_CHARGE' && (
                  <p style={styles.hintText}>
                    ℹ️ L'expression est en cours de traitement
                  </p>
                )}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Commentaire (optionnel)</label>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                style={styles.textarea}
                rows={4}
                placeholder="Ajoutez un commentaire pour expliquer le changement de statut..."
              />
            </div>

            <div style={styles.actions}>
              <button
                type="button"
                onClick={() => navigate(`/expressions/${id}`)}
                style={styles.cancelButton}
              >
                Annuler
              </button>
              <button type="submit" disabled={submitting} style={styles.submitButton}>
                {submitting ? 'Enregistrement...' : 'Changer le statut'}
              </button>
            </div>
          </form>
        </div>

        <div style={styles.infoBox}>
          <h3 style={styles.infoBoxTitle}>ℹ️ Workflow des statuts</h3>
          <ul style={styles.workflowList}>
            <li><strong>Brouillon</strong> → Expression en cours de rédaction</li>
            <li><strong>En attente</strong> → Soumise au supérieur hiérarchique</li>
            <li><strong>Validé</strong> → Approuvée par le validateur</li>
            <li><strong>Refusé</strong> → Rejetée par le validateur</li>
            <li><strong>Pris en charge</strong> → En cours de traitement</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}

const badgeStyle: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: '12px',
  fontSize: '13px',
  fontWeight: '600',
  textTransform: 'uppercase',
  display: 'inline-block',
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '800px',
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
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: 0,
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '40px',
    fontSize: '18px',
    color: '#666',
  },
  error: {
    textAlign: 'center' as const,
    padding: '40px',
    fontSize: '18px',
    color: '#dc3545',
  },
  card: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '30px',
  },
  expressionInfo: {
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '2px solid #e5e7eb',
  },
  expressionTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '15px',
  },
  infoRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '10px',
  },
  label: {
    fontWeight: '600',
    color: '#4b5563',
    minWidth: '120px',
  },
  errorMessage: {
    padding: '15px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb',
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
  formLabel: {
    fontWeight: '600',
    color: '#333',
    fontSize: '15px',
  },
  required: {
    color: '#dc3545',
  },
  select: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  textarea: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical' as const,
  },
  hint: {
    marginTop: '5px',
  },
  hintText: {
    margin: 0,
    padding: '10px',
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
    borderRadius: '6px',
    fontSize: '13px',
  },
  actions: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'flex-end',
    marginTop: '10px',
  },
  cancelButton: {
    padding: '12px 30px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
  },
  submitButton: {
    padding: '12px 30px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #dee2e6',
  },
  infoBoxTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 0,
    marginBottom: '15px',
  },
  workflowList: {
    margin: 0,
    paddingLeft: '20px',
    lineHeight: '1.8',
    color: '#4b5563',
  },
};
