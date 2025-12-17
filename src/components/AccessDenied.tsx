import React from 'react';

interface AccessDeniedProps {
  title: string;
  message: string;
  icon?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ title, message, icon = '🔒' }) => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconWrapper}>
          <span style={styles.icon}>{icon}</span>
        </div>
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.message}>{message}</p>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '48px 40px',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  },
  iconWrapper: {
    marginBottom: '24px',
  },
  icon: {
    fontSize: '64px',
    display: 'inline-block',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: '16px',
    margin: 0,
  },
  message: {
    fontSize: '16px',
    color: '#718096',
    lineHeight: '1.6',
    margin: '16px 0 0 0',
  },
};
