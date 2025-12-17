import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <header style={styles.topHeader}>
        <div style={styles.headerLeft}>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
            style={styles.menuToggle}
          >
            ☰
          </button>
          <h1 style={styles.brandLogo}>📋 BesoinPro</h1>
        </div>
        <div style={styles.headerRight}>
          {user && (
            <>
              <div style={styles.userBadge}>
                {user.photo && (
                  <img src={user.photo} alt="Profile" style={styles.userAvatar} />
                )}
                <div style={styles.userInfo}>
                  <span style={styles.userName}>{user.prenom || user.nom || user.email}</span>
                  <span style={styles.userRole}>{user.role}</span>
                </div>
              </div>
              <button onClick={logout} style={styles.logoutBtn}>
                <span>🚪</span>
              </button>
            </>
          )}
        </div>
      </header>

      <div style={styles.layoutWrapper}>
        {/* Sidebar */}
        <aside style={{
          ...styles.sidebar,
          width: sidebarCollapsed ? '80px' : '280px',
        }}>
          <nav style={styles.sidebarNav}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                ...styles.navItem,
                ...(isActive('/dashboard') ? styles.navItemActive : {}),
              }}
            >
              <span style={styles.navIcon}>🏠</span>
              {!sidebarCollapsed && <span style={styles.navLabel}>Tableau de bord</span>}
            </button>

            <button
              onClick={() => navigate('/expressions')}
              style={{
                ...styles.navItem,
                ...(isActive('/expressions') && !isActive('/expressions/validate') ? styles.navItemActive : {}),
              }}
            >
              <span style={styles.navIcon}>📄</span>
              {!sidebarCollapsed && <span style={styles.navLabel}>Mes Expressions</span>}
            </button>

            <button
              onClick={() => navigate('/expressions/create')}
              style={{
                ...styles.navItem,
                ...(isActive('/expressions/create') ? styles.navItemActive : {}),
              }}
            >
              <span style={styles.navIcon}>➕</span>
              {!sidebarCollapsed && <span style={styles.navLabel}>Nouvelle Expression</span>}
            </button>

            {(user?.role === 'VALIDATEUR' || user?.role === 'ADMIN') && (
              <button
                onClick={() => navigate('/expressions/validate')}
                style={{
                  ...styles.navItem,
                  ...(isActive('/expressions/validate') ? styles.navItemActive : {}),
                }}
              >
                <span style={styles.navIcon}>✅</span>
                {!sidebarCollapsed && <span style={styles.navLabel}>Validation</span>}
              </button>
            )}

            {user?.role === 'ADMIN' && (
              <>
                <div style={styles.navDivider}></div>
                <button
                  onClick={() => navigate('/admin')}
                  style={{
                    ...styles.navItem,
                    ...(isActive('/admin') ? styles.navItemActive : {}),
                  }}
                >
                  <span style={styles.navIcon}>🛠️</span>
                  {!sidebarCollapsed && <span style={styles.navLabel}>Administration</span>}
                </button>
              </>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{
          ...styles.mainContent,
          marginLeft: sidebarCollapsed ? '80px' : '280px',
        }}>
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
    backgroundColor: '#f5f7fa',
    display: 'flex',
    flexDirection: 'column',
  },
  topHeader: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '64px',
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    zIndex: 1000,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  menuToggle: {
    width: '40px',
    height: '40px',
    background: '#f7fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#4a5568',
    fontSize: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogo: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a202c',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 16px',
    background: '#f7fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    objectFit: 'cover',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d3748',
  },
  userRole: {
    fontSize: '11px',
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  logoutBtn: {
    width: '40px',
    height: '40px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#e53e3e',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  layoutWrapper: {
    display: 'flex',
    paddingTop: '64px',
    minHeight: 'calc(100vh - 64px)',
    flex: 1,
  },
  sidebar: {
    position: 'fixed',
    top: '64px',
    left: 0,
    bottom: 0,
    background: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    boxShadow: '1px 0 3px rgba(0, 0, 0, 0.05)',
    transition: 'width 0.3s ease',
    overflowY: 'auto',
    overflowX: 'hidden',
    zIndex: 999,
  },
  sidebarNav: {
    padding: '20px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  navItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    background: 'transparent',
    border: 'none',
    color: '#4a5568',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    borderLeft: '3px solid transparent',
  },
  navItemActive: {
    background: '#f7fafc',
    color: '#4299e1',
    borderLeft: '3px solid #4299e1',
    fontWeight: '600',
  },
  navIcon: {
    fontSize: '18px',
    flexShrink: 0,
  },
  navLabel: {
    fontSize: '14px',
    whiteSpace: 'nowrap',
  },
  navDivider: {
    height: '1px',
    background: '#e2e8f0',
    margin: '12px 20px',
  },
  mainContent: {
    flex: 1,
    transition: 'margin-left 0.3s ease',
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    flexDirection: 'column',
  },
};
