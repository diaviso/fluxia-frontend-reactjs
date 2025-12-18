interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
}

const variantStyles = {
  default: {
    background: '#f1f5f9',
    color: '#475569',
  },
  success: {
    background: '#dcfce7',
    color: '#166534',
  },
  warning: {
    background: '#fef3c7',
    color: '#92400e',
  },
  danger: {
    background: '#fee2e2',
    color: '#991b1b',
  },
  info: {
    background: '#dbeafe',
    color: '#1e40af',
  },
  purple: {
    background: '#ede9fe',
    color: '#5b21b6',
  },
};

const sizeStyles = {
  sm: {
    padding: '4px 10px',
    fontSize: '11px',
  },
  md: {
    padding: '6px 12px',
    fontSize: '12px',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
}) => {
  return (
    <span
      style={{
        ...styles.base,
        ...variantStyles[variant],
        ...sizeStyles[size],
      }}
    >
      {children}
    </span>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    borderRadius: '20px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    whiteSpace: 'nowrap',
  },
};

export default Badge;
