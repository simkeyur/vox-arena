export default function SummaryStat({ label, value, subValue, icon: Icon, color }) {
  return (
    <div className="summary-stat-card" style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(8px)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      flex: 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        {Icon && <Icon size={16} style={{ color: color || 'var(--color-primary)' }} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.02em' }}>{value}</span>
        {subValue && <span style={{ fontSize: 12, color: 'var(--muted)' }}>{subValue}</span>}
      </div>
    </div>
  );
}
