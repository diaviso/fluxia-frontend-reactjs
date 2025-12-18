import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.backgroundPattern}></div>
      
      <div style={styles.contentWrapper}>
        <div style={styles.leftPanel}>
          <div style={styles.logoSection}>
            <div style={styles.logo}>📋</div>
            <h1 style={styles.appTitle}>Fluxia</h1>
            <p style={styles.appSubtitle}>Gestion Professionnelle des Besoins</p>
          </div>

          <div style={styles.description}>
            <h2 style={styles.descTitle}>Bienvenue sur Fluxia</h2>
            <p style={styles.descText}>
              Une plateforme moderne et intuitive pour la gestion professionnelle des expressions de besoin 
              au sein du Centre Régional des Œuvres Universitaires de Ziguinchor (CROUS).
            </p>
            
            <div style={styles.features}>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>✨</span>
                <div>
                  <h3 style={styles.featureTitle}>Gestion simplifiée</h3>
                  <p style={styles.featureText}>Créez et suivez vos expressions de besoin en quelques clics</p>
                </div>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>💬</span>
                <div>
                  <h3 style={styles.featureTitle}>Communication directe</h3>
                  <p style={styles.featureText}>Échangez avec les validateurs via un système de discussion intégré</p>
                </div>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>📊</span>
                <div>
                  <h3 style={styles.featureTitle}>Suivi en temps réel</h3>
                  <p style={styles.featureText}>Visualisez l'état de vos demandes à tout moment</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.rightPanel}>
          <div style={styles.loginCard}>
            <h2 style={styles.loginTitle}>Connexion</h2>
            <p style={styles.loginSubtitle}>
              Connectez-vous avec votre compte Google institutionnel
            </p>
            
            <button onClick={login} style={styles.googleButton}>
              <svg style={styles.googleIcon} viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Se connecter avec Google</span>
            </button>

            <div style={styles.divider}>
              <span style={styles.dividerText}>Informations</span>
            </div>

            <div style={styles.infoBox}>
              <p style={styles.infoTitle}>🔒 Sécurité et confidentialité</p>
              <p style={styles.infoText}>
                Vos données sont protégées et utilisées uniquement dans le cadre de la gestion 
                des expressions de besoin du CROUS.
              </p>
            </div>

            <div style={styles.terms}>
              <p style={styles.termsText}>
                En vous connectant, vous acceptez nos{' '}
                <a href="#" style={styles.termsLink}>Conditions d'utilisation</a>
                {' '}et notre{' '}
                <a href="#" style={styles.termsLink}>Politique de confidentialité</a>
              </p>
            </div>
          </div>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              © 2024 CROUS Ziguinchor - Université Assane Seck
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    background: '#f5f7fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
    opacity: 0.05,
    zIndex: 0,
  },
  contentWrapper: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    width: '100%',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 20px',
    gap: '60px',
    flexWrap: 'wrap',
  },
  leftPanel: {
    flex: '1 1 500px',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
  },
  logoSection: {
    textAlign: 'center',
  },
  logo: {
    fontSize: '80px',
    marginBottom: '20px',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
  },
  appTitle: {
    fontSize: '56px',
    fontWeight: '800',
    color: '#1a202c',
    marginBottom: '10px',
    letterSpacing: '-1px',
  },
  appSubtitle: {
    fontSize: '20px',
    color: '#5a6c7d',
    fontWeight: '500',
  },
  description: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  descTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: '16px',
  },
  descText: {
    fontSize: '16px',
    color: '#4a5568',
    lineHeight: '1.8',
    marginBottom: '32px',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  feature: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  featureIcon: {
    fontSize: '32px',
    flexShrink: 0,
  },
  featureTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '4px',
  },
  featureText: {
    fontSize: '14px',
    color: '#718096',
    lineHeight: '1.6',
    margin: 0,
  },
  rightPanel: {
    flex: '1 1 450px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  loginCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '40px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  loginTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: '8px',
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: '15px',
    color: '#718096',
    marginBottom: '32px',
    textAlign: 'center',
    lineHeight: '1.6',
  },
  googleButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px 24px',
    backgroundColor: '#ffffff',
    color: '#3c4043',
    border: '2px solid #dadce0',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  googleIcon: {
    width: '24px',
    height: '24px',
  },
  divider: {
    position: 'relative',
    textAlign: 'center',
    margin: '32px 0',
  },
  dividerText: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: '0 16px',
    color: '#a0aec0',
    fontSize: '13px',
    fontWeight: '500',
    position: 'relative',
    zIndex: 1,
  },
  infoBox: {
    background: '#f7fafc',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
    border: '1px solid #e2e8f0',
  },
  infoTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '8px',
  },
  infoText: {
    fontSize: '13px',
    color: '#4a5568',
    lineHeight: '1.6',
    margin: 0,
  },
  terms: {
    textAlign: 'center',
  },
  termsText: {
    fontSize: '12px',
    color: '#718096',
    lineHeight: '1.6',
    margin: 0,
  },
  termsLink: {
    color: '#4299e1',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s',
  },
  footer: {
    textAlign: 'center',
    padding: '20px',
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  footerText: {
    fontSize: '13px',
    color: '#718096',
    margin: 0,
  },
};
