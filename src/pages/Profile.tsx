import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      if (user.photo) {
        setPhotoPreview(user.photo.startsWith('http') ? user.photo : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${user.photo}`);
      }
    }
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Prévisualisation locale
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload du fichier
    setUploading(true);
    setError('');
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('photo', file);
      const response = await api.post('/auth/upload-photo', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newPhotoUrl = response.data.photo;
      setFormData(prev => ({ ...prev, photo: newPhotoUrl }));
      // Mettre à jour la prévisualisation avec l'URL du serveur
      setPhotoPreview(newPhotoUrl.startsWith('http') ? newPhotoUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${newPhotoUrl}`);
      setSuccess('Photo mise à jour avec succès !');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'upload de la photo');
      setPhotoPreview(null);
    } finally {
      setUploading(false);
    }
  };

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
        {/* Header */}
        <div style={styles.pageHeader}>
          <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
            ← Retour
          </button>
          <div>
            <h1 style={styles.pageTitle}>Mon Profil</h1>
            <p style={styles.pageSubtitle}>Gérez vos informations personnelles</p>
          </div>
        </div>

        <div style={styles.contentGrid}>
          {/* Profile Card */}
          <div style={styles.profileCard}>
            <div style={styles.profileHeader}>
              {user?.photo || formData.photo ? (
                <img src={formData.photo || user?.photo || ''} alt="" style={styles.profileAvatar} />
              ) : (
                <div style={styles.profileAvatarPlaceholder}>
                  {user?.prenom?.[0] || user?.nom?.[0] || user?.email?.[0] || '?'}
                </div>
              )}
              <div style={styles.profileInfo}>
                <h2 style={styles.profileName}>
                  {formData.prenom || user?.prenom} {formData.nom || user?.nom}
                </h2>
                <span style={styles.profileEmail}>{user?.email}</span>
                <span style={{...styles.roleBadge, ...getRoleBadgeStyle(user?.role || '')}}>
                  {user?.role}
                </span>
              </div>
            </div>

            <div style={styles.profileStats}>
              <div style={styles.statItem}>
                <span style={styles.statIcon}>📧</span>
                <div style={styles.statContent}>
                  <span style={styles.statLabel}>Email</span>
                  <span style={styles.statValue}>{user?.email}</span>
                </div>
              </div>
              {user?.division && typeof user.division === 'object' && (
                <div style={styles.statItem}>
                  <span style={styles.statIcon}>🏢</span>
                  <div style={styles.statContent}>
                    <span style={styles.statLabel}>Division</span>
                    <span style={styles.statValue}>{(user.division as any).nom}</span>
                  </div>
                </div>
              )}
              {user?.divisionDirigee && (
                <div style={styles.statItem}>
                  <span style={styles.statIcon}>👔</span>
                  <div style={styles.statContent}>
                    <span style={styles.statLabel}>Chef de</span>
                    <span style={styles.statValue}>{user.divisionDirigee.nom}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Edit Form */}
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h3 style={styles.formTitle}>✏️ Modifier mes informations</h3>
              <p style={styles.formSubtitle}>
                Ces informations remplaceront celles de votre compte Google
              </p>
            </div>

            {error && (
              <div style={styles.errorBox}>
                <span style={styles.errorIcon}>⚠️</span>
                {error}
              </div>
            )}
            {success && (
              <div style={styles.successBox}>
                <span style={styles.successIcon}>✅</span>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formRow}>
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
                  <label style={styles.label}>Nom</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    style={styles.input}
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Photo de profil</label>
                <div style={styles.photoUploadContainer}>
                  <div style={styles.photoPreviewBox}>
                    {photoPreview ? (
                      <img src={photoPreview} alt="Aperçu" style={styles.previewImageLarge} />
                    ) : (
                      <div style={styles.photoPlaceholder}>
                        {user?.prenom?.[0] || user?.nom?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  <div style={styles.photoUploadActions}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      style={styles.uploadButton}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? '⏳ Upload...' : '📷 Changer la photo'}
                    </button>
                    <span style={styles.uploadHint}>JPG, PNG, GIF - Max 5MB</span>
                  </div>
                </div>
              </div>

              <div style={styles.formActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? 'Enregistrement...' : '💾 Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Info Note */}
        <div style={styles.infoNote}>
          <span style={styles.infoIcon}>ℹ️</span>
          <span>L'email et le rôle sont gérés par l'administrateur et ne peuvent pas être modifiés ici.</span>
        </div>
      </div>
    </Layout>
  );
}

const getRoleBadgeStyle = (role: string) => {
  switch (role) {
    case 'ADMIN': return { background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' };
    case 'VALIDATEUR': return { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' };
    default: return { background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' };
  }
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '32px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
    marginBottom: '32px',
  },
  backButton: {
    padding: '10px 16px',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    color: '#475569',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
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
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr',
    gap: '24px',
    marginBottom: '24px',
  },
  profileCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    height: 'fit-content',
  },
  profileHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    paddingBottom: '20px',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '20px',
  },
  profileAvatar: {
    width: '100px',
    height: '100px',
    borderRadius: '20px',
    objectFit: 'cover',
    marginBottom: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  profileAvatarPlaceholder: {
    width: '100px',
    height: '100px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '36px',
    fontWeight: '700',
    marginBottom: '16px',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  profileName: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  profileEmail: {
    fontSize: '14px',
    color: '#64748b',
  },
  roleBadge: {
    padding: '4px 12px',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '600',
    marginTop: '4px',
  },
  profileStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '10px',
  },
  statIcon: {
    fontSize: '20px',
  },
  statContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b',
  },
  statValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
  },
  formCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
  },
  formHeader: {
    marginBottom: '24px',
  },
  formTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 8px 0',
  },
  formSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    color: '#dc2626',
    fontSize: '14px',
    marginBottom: '20px',
  },
  errorIcon: {
    fontSize: '18px',
  },
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '10px',
    color: '#16a34a',
    fontSize: '14px',
    marginBottom: '20px',
  },
  successIcon: {
    fontSize: '18px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
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
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#1e293b',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  photoPreview: {
    marginTop: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '10px',
  },
  previewImage: {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    objectFit: 'cover',
    border: '2px solid #6366f1',
  },
  previewLabel: {
    fontSize: '13px',
    color: '#64748b',
  },
  photoUploadContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '2px dashed #e2e8f0',
  },
  photoPreviewBox: {
    flexShrink: 0,
  },
  previewImageLarge: {
    width: '80px',
    height: '80px',
    borderRadius: '16px',
    objectFit: 'cover',
    border: '3px solid #6366f1',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
  },
  photoPlaceholder: {
    width: '80px',
    height: '80px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: '700',
  },
  photoUploadActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  uploadButton: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  uploadHint: {
    fontSize: '12px',
    color: '#64748b',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '12px',
  },
  cancelButton: {
    padding: '12px 24px',
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  submitButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
  },
  infoNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    background: '#eff6ff',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#1e40af',
  },
  infoIcon: {
    fontSize: '18px',
  },
};
