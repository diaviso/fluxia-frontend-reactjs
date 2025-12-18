import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { path: '/admin', icon: '📊', label: 'Dashboard', exact: true },
  { path: '/admin/users', icon: '👥', label: 'Utilisateurs' },
  { path: '/admin/divisions', icon: '🏢', label: 'Divisions' },
  { path: '/admin/services', icon: '🔧', label: 'Services' },
  { path: '/admin/matieres', icon: '📦', label: 'Matières' },
  { path: '/admin/fournisseurs', icon: '🏭', label: 'Fournisseurs' },
  { path: '/admin/expressions', icon: '📋', label: 'Expressions' },
  { path: '/admin/bons-commande', icon: '🧾', label: 'Bons de Commande' },
  { path: '/admin/receptions', icon: '📥', label: 'Réceptions' },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={styles.container}>
      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          style={styles.mobileOverlay} 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        width: isMobile ? '280px' : (sidebarCollapsed ? '80px' : '280px'),
        transform: isMobile ? (mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
      }}>
        {/* Logo */}
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>⚙️</div>
          {(!sidebarCollapsed || isMobile) && (
            <div style={styles.logoText}>
              <span style={styles.logoTitle}>Admin Panel</span>
              <span style={styles.logoSubtitle}>Fluxia</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          <div style={styles.navSection}>
            {!sidebarCollapsed && <span style={styles.navSectionTitle}>MENU PRINCIPAL</span>}
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  ...styles.navItem,
                  ...(isActive(item.path, item.exact) ? styles.navItemActive : {}),
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                }}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                {!sidebarCollapsed && <span style={styles.navLabel}>{item.label}</span>}
                {!sidebarCollapsed && isActive(item.path, item.exact) && (
                  <span style={styles.activeIndicator}></span>
                )}
              </button>
            ))}
          </div>

          <div style={styles.navDivider}></div>

          <div style={styles.navSection}>
            {!sidebarCollapsed && <span style={styles.navSectionTitle}>NAVIGATION</span>}
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                ...styles.navItem,
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              }}
              title={sidebarCollapsed ? 'Retour à l\'app' : undefined}
            >
              <span style={styles.navIcon}>🏠</span>
              {!sidebarCollapsed && <span style={styles.navLabel}>Retour à l'application</span>}
            </button>
            <button
              onClick={logout}
              style={{
                ...styles.navItem,
                ...styles.logoutItem,
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              }}
              title={sidebarCollapsed ? 'Déconnexion' : undefined}
            >
              <span style={styles.navIcon}>🚪</span>
              {!sidebarCollapsed && <span style={styles.navLabel}>Déconnexion</span>}
            </button>
          </div>
        </nav>

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={styles.collapseBtn}
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </aside>

      {/* Main Content */}
      <div style={{
        ...styles.mainWrapper,
        marginLeft: isMobile ? '0' : (sidebarCollapsed ? '80px' : '280px'),
      }}>
        {/* Top Bar */}
        <header style={styles.topBar}>
          <div style={styles.topBarLeft}>
            {isMobile && (
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={styles.hamburgerBtn}
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            )}
            <div style={styles.breadcrumb}>
              <span style={styles.breadcrumbItem}>Admin</span>
              <span style={styles.breadcrumbSeparator}>/</span>
              <span style={styles.breadcrumbCurrent}>
                {menuItems.find(item => isActive(item.path, item.exact))?.label || 'Dashboard'}
              </span>
            </div>
          </div>
          <div style={styles.topBarRight}>
            {!isMobile && (
              <div style={styles.dateTime}>
                <span style={styles.date}>{formatDate(currentTime)}</span>
                <span style={styles.time}>{formatTime(currentTime)}</span>
              </div>
            )}
            <div style={styles.userSection}>
              {user?.photo && (
                <img src={user.photo} alt="Profile" style={styles.userAvatar} />
              )}
              {!isMobile && (
                <div style={styles.userInfo}>
                  <span style={styles.userName}>{user?.prenom} {user?.nom}</span>
                  <span style={styles.userRole}>Administrateur</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={styles.content}>
          {children}
        </main>

        {/* Footer */}
        <footer style={styles.footer}>
          <span>© 2024 Fluxia - Panneau d'Administration</span>
          <span style={styles.footerVersion}>v1.0.0</span>
        </footer>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
  },
  mobileOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  hamburgerBtn: {
    width: '40px',
    height: '40px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '10px',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px',
    color: '#fff',
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'width 0.3s ease, transform 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    overflow: 'hidden',
  },
  logoSection: {
    padding: '24px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  logoIcon: {
    width: '44px',
    height: '44px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    flexShrink: 0,
  },
  logoText: {
    display: 'flex',
    flexDirection: 'column',
  },
  logoTitle: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  logoSubtitle: {
    color: '#64748b',
    fontSize: '12px',
    fontWeight: '500',
  },
  nav: {
    flex: 1,
    padding: '20px 12px',
    overflowY: 'auto',
  },
  navSection: {
    marginBottom: '8px',
  },
  navSectionTitle: {
    display: 'block',
    padding: '8px 16px',
    color: '#64748b',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  navItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '10px',
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    marginBottom: '4px',
  },
  navItemActive: {
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
    color: '#ffffff',
  },
  navIcon: {
    fontSize: '18px',
    flexShrink: 0,
  },
  navLabel: {
    whiteSpace: 'nowrap',
  },
  activeIndicator: {
    position: 'absolute',
    right: '12px',
    width: '6px',
    height: '6px',
    background: '#6366f1',
    borderRadius: '50%',
  },
  navDivider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.1)',
    margin: '16px 0',
  },
  logoutItem: {
    color: '#f87171',
  },
  collapseBtn: {
    margin: '12px',
    padding: '10px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#94a3b8',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  mainWrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    transition: 'margin-left 0.3s ease',
    background: '#f1f5f9',
  },
  topBar: {
    height: '72px',
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  breadcrumbItem: {
    color: '#64748b',
    fontSize: '14px',
  },
  breadcrumbSeparator: {
    color: '#cbd5e1',
    fontSize: '14px',
  },
  breadcrumbCurrent: {
    color: '#1e293b',
    fontSize: '14px',
    fontWeight: '600',
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  dateTime: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  date: {
    color: '#64748b',
    fontSize: '12px',
    textTransform: 'capitalize',
  },
  time: {
    color: '#1e293b',
    fontSize: '16px',
    fontWeight: '600',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 16px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    objectFit: 'cover',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    color: '#1e293b',
    fontSize: '14px',
    fontWeight: '600',
  },
  userRole: {
    color: '#6366f1',
    fontSize: '11px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  content: {
    flex: 1,
    padding: '32px',
  },
  footer: {
    padding: '16px 32px',
    background: '#ffffff',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#64748b',
    fontSize: '13px',
  },
  footerVersion: {
    color: '#94a3b8',
    fontSize: '12px',
  },
};

export default AdminLayout;
