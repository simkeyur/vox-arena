export default function MetricComparison({
  title,
  geminiValue,
  openaiValue,
  unit,
  decimals = 0,
  unitPrefix = '',
  lowerIsBetter = true,
  isPercentage = false,
}) {
  const hasG = geminiValue != null;
  const hasO = openaiValue != null;

  const isTie = hasG && hasO && Math.abs(geminiValue - openaiValue) < 0.0001;
  const isGeminiWinner = !isTie && hasG && (!hasO || (lowerIsBetter ? geminiValue < openaiValue : geminiValue > openaiValue));
  const isOpenaiWinner = !isTie && hasO && (!hasG || (lowerIsBetter ? openaiValue < geminiValue : openaiValue > geminiValue));

  const showStats = hasG || hasO;
  const showWinner = (isGeminiWinner || isOpenaiWinner) && hasG && hasO;

  let scaleMax = 100;
  if (!isPercentage) {
    const maxVal = Math.max(Math.abs(geminiValue || 0), Math.abs(openaiValue || 0));
    scaleMax = maxVal > 0 ? maxVal * 1.2 : 100;
  }

  const getPercent = (val) => (val != null ? (Math.abs(val) / scaleMax) * 100 : 0);
  const gPercent = getPercent(geminiValue);
  const oPercent = getPercent(openaiValue);

  const formatValue = (val) => {
    if (val == null) return 'No data';
    return `${unitPrefix}${val.toFixed(decimals)}${unit}`;
  };

  return (
    <div className="metric-comparison-row" style={{ padding: '4px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: 6 }}>
          {title}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {isTie && (
            <span style={{
              fontSize: 9, fontWeight: 800, color: 'var(--muted)',
              background: 'var(--muted-light)', padding: '2px 8px',
              borderRadius: '10px', textTransform: 'uppercase',
              letterSpacing: '0.04em', border: '1px solid var(--border)',
            }}>
              Tied
            </span>
          )}
          {!isTie && showStats && (
            <span style={{
              fontSize: 9, fontWeight: 800, color: 'var(--success)',
              background: 'rgba(16, 185, 129, 0.08)', padding: '2px 8px',
              borderRadius: '10px', textTransform: 'uppercase',
              letterSpacing: '0.04em', border: '1px solid rgba(16, 185, 129, 0.12)',
            }}>
              {isGeminiWinner ? 'Gemini Leads' : 'OpenAI Leads'}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{
          background: 'var(--muted-light)', borderRadius: 8, padding: '10px 12px',
          border: '1px solid var(--border)', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6, position: 'relative', zIndex: 2 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Gemini</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)' }}>{formatValue(geminiValue)}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(0,0,0,0.05)', borderRadius: 2, position: 'relative', zIndex: 2 }}>
            {geminiValue != null && (
              <div style={{
                width: `${Math.max(2, gPercent)}%`, height: '100%',
                background: 'var(--color-primary)', borderRadius: 2,
                boxShadow: '0 0 8px rgba(99, 102, 241, 0.3)',
              }} />
            )}
          </div>
          {showWinner && isGeminiWinner && (
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, transparent 100%)', zIndex: 1 }} />
          )}
        </div>

        <div style={{
          background: 'var(--muted-light)', borderRadius: 8, padding: '10px 12px',
          border: '1px solid var(--border)', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6, position: 'relative', zIndex: 2 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>OpenAI</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)' }}>{formatValue(openaiValue)}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(0,0,0,0.05)', borderRadius: 2, position: 'relative', zIndex: 2 }}>
            {openaiValue != null && (
              <div style={{
                width: `${Math.max(2, oPercent)}%`, height: '100%',
                background: 'var(--color-secondary)', borderRadius: 2,
                boxShadow: '0 0 8px rgba(6, 182, 212, 0.3)',
              }} />
            )}
          </div>
          {showWinner && !isGeminiWinner && (
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.03) 0%, transparent 100%)', zIndex: 1 }} />
          )}
        </div>
      </div>
    </div>
  );
}
