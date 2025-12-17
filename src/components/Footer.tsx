import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.footerContent}>
        <div style={styles.footerSection}>
          <p style={styles.footerText}>
            © 2024 CROUS Ziguinchor - Université Assane Seck
          </p>
        </div>
        <div style={styles.footerSection}>
          <a href="#" style={styles.footerLink}>Conditions d'utilisation</a>
          <span style={styles.separator}>•</span>
          <a href="#" style={styles.footerLink}>Politique de confidentialité</a>
          <span style={styles.separator}>•</span>
          <a href="#" style={styles.footerLink}>Support</a>
        </div>
      </div>
    </footer>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  footer: {
    background: '#ffffff',
    borderTop: '1px solid #e2e8f0',
    padding: '20px 24px',
    marginTop: 'auto',
  },
  footerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  footerSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  footerText: {
    fontSize: '13px',
    color: '#718096',
    margin: 0,
  },
  footerLink: {
    fontSize: '13px',
    color: '#4299e1',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  separator: {
    color: '#cbd5e0',
    fontSize: '12px',
  },
};
