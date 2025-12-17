import React from 'react';

interface StatusRibbonProps {
  status: 'BROUILLON' | 'EN_ATTENTE' | 'VALIDE' | 'REFUSE' | 'PRIS_EN_CHARGE';
  size?: 'small' | 'medium' | 'large';
}

export const StatusRibbon: React.FC<StatusRibbonProps> = ({ status, size = 'medium' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'BROUILLON':
        return {
          label: 'Brouillon',
          colors: {
            bg: 'linear-gradient(135deg, #a0aec0 0%, #718096 100%)',
            shadow: 'rgba(160, 174, 192, 0.4)',
          },
          icon: '📝',
        };
      case 'EN_ATTENTE':
        return {
          label: 'En attente',
          colors: {
            bg: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            shadow: 'rgba(139, 92, 246, 0.4)',
          },
          icon: '⏳',
        };
      case 'VALIDE':
        return {
          label: 'Validé',
          colors: {
            bg: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
            shadow: 'rgba(59, 130, 246, 0.4)',
          },
          icon: '✅',
        };
      case 'REFUSE':
        return {
          label: 'Refusé',
          colors: {
            bg: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
            shadow: 'rgba(248, 113, 113, 0.4)',
          },
          icon: '❌',
        };
      case 'PRIS_EN_CHARGE':
        return {
          label: 'Pris en charge',
          colors: {
            bg: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
            shadow: 'rgba(96, 165, 250, 0.4)',
          },
          icon: '📦',
        };
    }
  };

  const config = getStatusConfig();
  const sizeConfig = {
    small: { fontSize: '11px', padding: '4px 12px', iconSize: '12px' },
    medium: { fontSize: '13px', padding: '6px 16px', iconSize: '14px' },
    large: { fontSize: '15px', padding: '8px 20px', iconSize: '16px' },
  };

  const styles: { [key: string]: React.CSSProperties } = {
    ribbon: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      background: config.colors.bg,
      color: '#ffffff',
      fontSize: sizeConfig[size].fontSize,
      fontWeight: '700',
      padding: sizeConfig[size].padding,
      borderRadius: '8px 8px 8px 0',
      boxShadow: `0 4px 12px ${config.colors.shadow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      overflow: 'hidden',
    },
    ribbonBefore: {
      content: '""',
      position: 'absolute',
      bottom: '-6px',
      left: 0,
      width: 0,
      height: 0,
      borderLeft: '6px solid transparent',
      borderTop: `6px solid ${config.colors.shadow}`,
    },
    icon: {
      fontSize: sizeConfig[size].iconSize,
    },
    shine: {
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '50%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
      animation: 'shine 3s infinite',
    },
  };

  return (
    <div style={styles.ribbon}>
      <div style={styles.shine}></div>
      <span style={styles.icon}>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
};
