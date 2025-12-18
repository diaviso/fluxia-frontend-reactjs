import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Footer } from './Footer';
import { NotificationBell } from './NotificationBell';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
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

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const formatDate = () => {
    return currentTime.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const menuItems = [
    { path: '/dashboard', icon: '🏠', label: 'Tableau de bord', exact: true },
    { path: '/expressions', icon: '📄', label: 'Mes Expressions', excludePath: '/expressions/validate' },
    { path: '/expressions/create', icon: '➕', label: 'Nouvelle Expression' },
  ];

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'ADMIN': return { background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' };
      case 'VALIDATEUR': return { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' };
      default: return { background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' };
    }
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
          <div style={styles.logoIcon}>📋</div>
          {!sidebarCollapsed && (
            <div style={styles.logoText}>
              <span style={styles.logoTitle}>Fluxia</span>
              <span style={styles.logoSubtitle}>Gestion des besoins</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={styles.sidebarNav}>
          <div style={styles.navSection}>
            {!sidebarCollapsed && <span style={styles.navSectionTitle}>MENU PRINCIPAL</span>}
            {menuItems.map((item) => {
              const active = item.excludePath 
                ? isActive(item.path) && !isActive(item.excludePath)
                : isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    ...styles.navItem,
                    ...(active ? styles.navItemActive : {}),
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  }}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <span style={styles.navIcon}>{item.icon}</span>
                  {!sidebarCollapsed && <span style={styles.navLabel}>{item.label}</span>}
                  {active && !sidebarCollapsed && <span style={styles.activeIndicator}></span>}
                </button>
              );
            })}

            {(user?.role === 'VALIDATEUR' || user?.role === 'ADMIN') && (
              <button
                onClick={() => navigate('/expressions/validate')}
                style={{
                  ...styles.navItem,
                  ...(isActive('/expressions/validate') ? styles.navItemActive : {}),
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                }}
                title={sidebarCollapsed ? 'Validation' : undefined}
              >
                <span style={styles.navIcon}>✅</span>
                {!sidebarCollapsed && <span style={styles.navLabel}>Validation</span>}
                {isActive('/expressions/validate') && !sidebarCollapsed && <span style={styles.activeIndicator}></span>}
              </button>
            )}
          </div>

          {user?.role === 'ADMIN' && (
            <div style={styles.navSection}>
              {!sidebarCollapsed && <span style={styles.navSectionTitle}>ADMINISTRATION</span>}
              <button
                onClick={() => navigate('/admin')}
                style={{
                  ...styles.navItem,
                  ...(isActive('/admin') ? styles.navItemActive : {}),
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                }}
                title={sidebarCollapsed ? 'Administration' : undefined}
              >
                <span style={styles.navIcon}>🛠️</span>
                {!sidebarCollapsed && <span style={styles.navLabel}>Administration</span>}
                {isActive('/admin') && !sidebarCollapsed && <span style={styles.activeIndicator}></span>}
              </button>
            </div>
          )}
        </nav>

        {/* User Profile in Sidebar */}
        {!sidebarCollapsed && user && (
          <div style={styles.sidebarProfile}>
            <div style={styles.profileCard} onClick={() => navigate('/profile')}>
              {user.photo ? (
                <img src={user.photo} alt="" style={styles.profileAvatar} />
              ) : (
                <div style={styles.profileAvatarPlaceholder}>
                  {user.prenom?.[0] || user.nom?.[0] || user.email?.[0] || '?'}
                </div>
              )}
              <div style={styles.profileInfo}>
                <span style={styles.profileName}>{user.prenom || user.nom || 'Utilisateur'}</span>
                <span style={{...styles.profileRole, ...getRoleBadgeStyle(user.role)}}>{user.role}</span>
              </div>
            </div>
          </div>
        )}

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={styles.collapseBtn}
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </aside>

      {/* Main Area */}
      <div style={{
        ...styles.mainArea,
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
            <div style={styles.dateTime}>
              <span style={styles.date}>{isMobile ? formatTime() : formatDate()}</span>
              {!isMobile && <span style={styles.time}>{formatTime()}</span>}
            </div>
          </div>
          <div style={styles.topBarRight}>
            <NotificationBell />
            <button 
              onClick={() => navigate('/profile')} 
              style={styles.topBarBtn}
              title="Mon profil"
            >
              👤
            </button>
            <button 
              onClick={logout} 
              style={{...styles.topBarBtn, ...styles.logoutBtn}}
              title="Déconnexion"
            >
              🚪
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main style={styles.mainContent}>
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
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
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    transition: 'width 0.3s ease, transform 0.3s ease',
    overflowY: 'auto',
    overflowX: 'hidden',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
  },
  logoSection: {
    padding: '24px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
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
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '-0.5px',
  },
  logoSubtitle: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '0.5px',
  },
  sidebarNav: {
    flex: 1,
    padding: '20px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  navSection: {
    marginBottom: '16px',
  },
  navSectionTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: '1px',
    padding: '8px 16px',
    display: 'block',
  },
  navItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    borderRadius: '10px',
    position: 'relative',
  },
  navItemActive: {
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#ffffff',
  },
  navIcon: {
    fontSize: '18px',
    flexShrink: 0,
  },
  navLabel: {
    fontSize: '14px',
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
  sidebarProfile: {
    padding: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  profileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  profileAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    objectFit: 'cover',
  },
  profileAvatarPlaceholder: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  profileName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
  },
  profileRole: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#ffffff',
    padding: '2px 8px',
    borderRadius: '4px',
    width: 'fit-content',
  },
  collapseBtn: {
    position: 'absolute',
    bottom: '80px',
    right: '-12px',
    width: '24px',
    height: '24px',
    background: '#6366f1',
    border: 'none',
    borderRadius: '50%',
    color: '#ffffff',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
    transition: 'all 0.2s ease',
  },
  mainArea: {
    flex: 1,
    transition: 'margin-left 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  topBar: {
    height: '70px',
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
  dateTime: {
    display: 'flex',
    flexDirection: 'column',
  },
  date: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    textTransform: 'capitalize',
  },
  time: {
    fontSize: '12px',
    color: '#64748b',
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  topBarBtn: {
    width: '40px',
    height: '40px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '10px',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  logoutBtn: {
    background: '#fef2f2',
    color: '#ef4444',
  },
  hamburgerBtn: {
    width: '40px',
    height: '40px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '10px',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px',
  },
  mainContent: {
    flex: 1,
    padding: '0',
    display: 'flex',
    flexDirection: 'column',
  },
};
