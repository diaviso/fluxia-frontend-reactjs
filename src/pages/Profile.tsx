import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    photo: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        photo: user.photo || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.patch('/auth/profile', formData);
      
      setSuccess('Profil mis à jour avec succès ! Rechargement...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>👤 Mon Profil</h1>
          <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
            ← Retour au Dashboard
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.infoSection}>
            <h2 style={styles.sectionTitle}>Informations du compte</h2>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Email :</span>
              <span style={styles.infoValue}>{user?.email}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Rôle :</span>
              <span style={{...styles.badge, backgroundColor: getRoleBadgeColor(user?.role || '')}}>
                {user?.role}
              </span>
            </div>
            <p style={styles.infoNote}>
              ℹ️ L'email et le rôle ne peuvent pas être modifiés.
            </p>
          </div>

          <div style={styles.divider}></div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <h2 style={styles.sectionTitle}>Informations personnelles</h2>
            <p style={styles.formNote}>
              💡 Ces informations remplaceront celles provenant de votre compte Google.
            </p>

            {error && <div style={styles.errorBox}>{error}</div>}
            {success && <div style={styles.successBox}>{success}</div>}

            <div style={styles.formGroup}>
              <label style={styles.label}>Nom</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                style={styles.input}
                placeholder="Votre nom"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Prénom</label>
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                style={styles.input}
                placeholder="Votre prénom"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Photo (URL)</label>
              <input
                type="url"
                value={formData.photo}
                onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                style={styles.input}
                placeholder="https://exemple.com/photo.jpg"
              />
              {formData.photo && (
                <div style={styles.photoPreview}>
                  <img src={formData.photo} alt="Aperçu" style={styles.previewImage} />
                  <span style={styles.previewLabel}>Aperçu de la photo</span>
                </div>
              )}
            </div>

            <div style={styles.formActions}>
              <button
                type="submit"
                style={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : '💾 Enregistrer les modifications'}
              </button>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'ADMIN': return '#dc2626';
    case 'VALIDATEUR': return '#ea580c';
    case 'AGENT': return '#2563eb';
    default: return '#6b7280';
  }
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
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: '30px',
  },
  infoSection: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '20px',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  infoLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6b7280',
    minWidth: '80px',
  },
  infoValue: {
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
  infoNote: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '12px',
    fontStyle: 'italic',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e5e7eb',
    margin: '30px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formNote: {
    fontSize: '14px',
    color: '#3b82f6',
    backgroundColor: '#eff6ff',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '10px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  },
  photoPreview: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  previewImage: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #667eea',
  },
  previewLabel: {
    fontSize: '12px',
    color: '#6b7280',
  },
  errorBox: {
    padding: '12px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '8px',
    fontSize: '14px',
  },
  successBox: {
    padding: '12px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    borderRadius: '8px',
    fontSize: '14px',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '10px',
  },
  submitButton: {
    flex: 1,
    padding: '14px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '14px 24px',
    backgroundColor: '#e5e7eb',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
