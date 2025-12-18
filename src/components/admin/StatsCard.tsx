interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan';
  onClick?: () => void;
}

const colorSchemes = {
  blue: {
    bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    light: '#dbeafe',
  },
  green: {
    bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    light: '#d1fae5',
  },
  purple: {
    bg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    light: '#ede9fe',
  },
  orange: {
    bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    light: '#fef3c7',
  },
  red: {
    bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    light: '#fee2e2',
  },
  cyan: {
    bg: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    light: '#cffafe',
  },
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  onClick,
}) => {
  const scheme = colorSchemes[color];

  return (
    <div
      style={{
        ...styles.card,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <div style={styles.content}>
        <div style={styles.info}>
          <span style={styles.title}>{title}</span>
          <span style={styles.value}>{value}</span>
          {trend && (
            <div style={styles.trend}>
              <span
                style={{
                  ...styles.trendValue,
                  color: trend.isPositive ? '#10b981' : '#ef4444',
                }}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span style={styles.trendLabel}>vs mois dernier</span>
            </div>
          )}
        </div>
        <div
          style={{
            ...styles.iconWrapper,
            background: scheme.bg,
          }}
        >
          <span style={styles.icon}>{icon}</span>
        </div>
      </div>
      <div
        style={{
          ...styles.bottomBar,
          background: scheme.bg,
        }}
      />
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    position: 'relative',
  },
  content: {
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  title: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  value: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 1,
  },
  trend: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '4px',
  },
  trendValue: {
    fontSize: '13px',
    fontWeight: '600',
  },
  trendLabel: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  iconWrapper: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  icon: {
    fontSize: '26px',
    filter: 'brightness(0) invert(1)',
  },
  bottomBar: {
    height: '4px',
    width: '100%',
  },
};

export default StatsCard;
