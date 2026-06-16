import {
  AlertCircle, History, Plus, LayoutDashboard, BarChart3,
  CloudLightning, ClipboardCheck, ShieldAlert,
} from 'lucide-react';
import SummaryStat from '../SummaryStat';
import MetricComparison from '../MetricComparison';

export default function DashboardTab({
  runs,
  needsApiKeySetup,
  noModelsConfigured,
  setActiveTab,
  setIsNewRunModalOpen,
  setSelectedRunId,
}) {
  const sum = (arr) => arr.reduce((a, b) => a + b, 0);
  const completedRuns = runs.filter((r) => r.status === 'completed');

  const getAggregates = (provider) => {
    const pRuns = completedRuns.filter((r) => r.provider === provider);
    if (pRuns.length === 0) return null;

    const ttfas = pRuns.map((r) => r.aggregate_metrics?.average_ttfa_ms).filter((v) => v != null);
    const accuracies = pRuns.map((r) => r.aggregate_metrics?.tool_call_accuracy_rate).filter((v) => v != null);
    const interruptions = pRuns.map((r) => r.aggregate_metrics?.average_interruption_stop_latency_ms).filter((v) => v != null);
    const hallucinations = pRuns.map((r) => r.aggregate_metrics?.hallucination_count || 0);
    const costs = pRuns.map((r) => r.aggregate_metrics?.total_cost_usd).filter((v) => v != null);

    return {
      avgTtfa: ttfas.length ? sum(ttfas) / ttfas.length : null,
      avgAccuracy: accuracies.length ? (sum(accuracies) / accuracies.length) * 100 : null,
      avgInterruption: interruptions.length ? sum(interruptions) / interruptions.length : null,
      totalHallucinations: sum(hallucinations),
      avgCost: costs.length ? sum(costs) / costs.length : null,
      runCount: pRuns.length,
    };
  };

  const geminiStats = getAggregates('gemini');
  const openaiStats = getAggregates('openai');
  const hasStats = geminiStats || openaiStats;

  const totalRuns = completedRuns.length;
  const totalHallucinations = (geminiStats?.totalHallucinations || 0) + (openaiStats?.totalHallucinations || 0);

  return (
    <>
      {needsApiKeySetup && (
        <div className="setup-banner">
          <div>
            <strong>Welcome to VoxArena!</strong> No API keys are configured yet, so runs will fail.
            Add your provider API keys to get started.
          </div>
          <button className="btn btn-primary" onClick={() => { window.location.hash = '#/settings'; }}>
            Set up API Keys
          </button>
        </div>
      )}
      {noModelsConfigured && (
        <div className="setup-banner" style={{
          background: 'rgba(239, 68, 68, 0.05)',
          borderColor: 'rgba(239, 68, 68, 0.15)',
          borderWidth: 1,
          borderStyle: 'solid',
          marginBottom: 20,
          padding: '8px 16px',
          borderRadius: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 13 }}>
            <AlertCircle size={14} style={{ color: 'var(--error)', flexShrink: 0, opacity: 0.8 }} />
            <div style={{ color: 'var(--muted)' }}>
              <strong style={{ color: 'var(--error)', fontWeight: 600 }}>Configuration Hint:</strong> No voice models are configured. Set up model names to start benchmarking.
            </div>
          </div>
          <button className="btn" style={{ fontSize: 12, height: 28, padding: '0 10px' }} onClick={() => { window.location.hash = '#/settings'; }}>
            Configure Models
          </button>
        </div>
      )}

      <div className="scrollable-tab-container dashboard-v2">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: '4px 0' }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em' }}>Arena Dashboard</h2>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>Across-the-board provider performance metrics</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn"
              onClick={() => setActiveTab('runs')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px' }}
            >
              <History size={16} />
              <span>Past Runs</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setIsNewRunModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }}
            >
              <Plus size={18} />
              <span>New Run</span>
            </button>
          </div>
        </div>

        {!hasStats ? (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-title">Welcome to VoxArena</span>
            </div>
            <div className="card-body" style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ background: 'var(--muted-light)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <LayoutDashboard size={32} style={{ color: 'var(--muted)' }} />
              </div>
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>No data yet</h3>
              <p style={{ color: 'var(--muted)', marginBottom: 24, maxWidth: 300, margin: '0 auto 24px' }}>
                Launch your first benchmark runs to see comparative performance metrics here.
              </p>
              <button className="btn btn-primary" onClick={() => setIsNewRunModalOpen(true)}>
                Start Your First Run
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="summary-row" style={{ display: 'flex', gap: 16 }}>
              <SummaryStat label="Total Benchmark Runs" value={totalRuns} icon={BarChart3} />
              <SummaryStat
                label="Best Response Delay"
                value={Math.min(geminiStats?.avgTtfa || Infinity, openaiStats?.avgTtfa || Infinity).toFixed(0)}
                subValue="ms avg"
                icon={CloudLightning}
                color="var(--success)"
              />
              <SummaryStat
                label="Global Accuracy"
                value={(((geminiStats?.avgAccuracy || 0) + (openaiStats?.avgAccuracy || 0)) / (geminiStats && openaiStats ? 2 : 1)).toFixed(1)}
                subValue="% average"
                icon={ClipboardCheck}
              />
              <SummaryStat
                label="Total Hallucinations"
                value={totalHallucinations}
                icon={ShieldAlert}
                color={totalHallucinations > 0 ? 'var(--error)' : 'var(--success)'}
              />
            </div>

            <div className="grid-2">
              <div className="card metric-group-card">
                <div className="card-header" style={{ border: 'none', background: 'transparent', paddingBottom: 0 }}>
                  <span className="card-title" style={{ color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Performance Comparison</span>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <MetricComparison geminiValue={geminiStats?.avgTtfa} openaiValue={openaiStats?.avgTtfa} title="Latency (TTFA)" unit="ms" lowerIsBetter={true} />
                  <div style={{ height: 1, background: 'var(--border)', opacity: 0.5 }}></div>
                  <MetricComparison geminiValue={geminiStats?.avgAccuracy} openaiValue={openaiStats?.avgAccuracy} title="Tool-Call Accuracy" unit="%" lowerIsBetter={false} isPercentage={true} />
                </div>
              </div>

              <div className="card metric-group-card">
                <div className="card-header" style={{ border: 'none', background: 'transparent', paddingBottom: 0 }}>
                  <span className="card-title" style={{ color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interaction Quality</span>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <MetricComparison geminiValue={geminiStats?.avgInterruption} openaiValue={openaiStats?.avgInterruption} title="Barge In Latency" unit="ms" lowerIsBetter={true} />
                  <div style={{ height: 1, background: 'var(--border)', opacity: 0.5 }}></div>
                  <MetricComparison
                    geminiValue={geminiStats?.avgCost}
                    openaiValue={openaiStats?.avgCost}
                    title="Average Run Cost"
                    unit=""
                    unitPrefix="$"
                    decimals={4}
                    lowerIsBetter={true}
                  />
                </div>
              </div>
            </div>

            <div className="grid-2" style={{ alignItems: 'start' }}>
              <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="card-title">Fact Hallucinations by Provider</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {geminiStats && openaiStats && (
                      <span style={{
                        fontSize: 9, fontWeight: 800, color: 'var(--success)',
                        background: 'rgba(16, 185, 129, 0.08)', padding: '2px 8px',
                        borderRadius: '10px', textTransform: 'uppercase',
                        letterSpacing: '0.04em', border: '1px solid rgba(16, 185, 129, 0.12)',
                      }}>
                        {(geminiStats.totalHallucinations / geminiStats.runCount) < (openaiStats.totalHallucinations / openaiStats.runCount) ? 'Gemini Leads' : 'OpenAI Leads'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <table className="runs-table" style={{ margin: 0, border: 'none' }}>
                    <thead style={{ background: 'var(--accent-light)' }}>
                      <tr>
                        <th style={{ padding: '12px 16px' }}>Provider</th>
                        <th style={{ padding: '12px 16px' }}>Completed Runs</th>
                        <th style={{ padding: '12px 16px' }}>Total Hallucinations</th>
                        <th style={{ padding: '12px 16px' }}>Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {geminiStats && (
                        <tr>
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>GEMINI</td>
                          <td style={{ padding: '12px 16px' }}>{geminiStats.runCount}</td>
                          <td style={{ padding: '12px 16px' }}>{geminiStats.totalHallucinations}</td>
                          <td style={{ padding: '12px 16px' }}>{(geminiStats.totalHallucinations / geminiStats.runCount).toFixed(2)} / run</td>
                        </tr>
                      )}
                      {openaiStats && (
                        <tr>
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>OPENAI</td>
                          <td style={{ padding: '12px 16px' }}>{openaiStats.runCount}</td>
                          <td style={{ padding: '12px 16px' }}>{openaiStats.totalHallucinations}</td>
                          <td style={{ padding: '12px 16px' }}>{(openaiStats.totalHallucinations / openaiStats.runCount).toFixed(2)} / run</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="card-title">Recent Run Log</span>
                  <button
                    onClick={() => setActiveTab('runs')}
                    style={{ fontSize: 11, background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    View all runs
                  </button>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    <table className="runs-table" style={{ margin: 0, border: 'none' }}>
                      <thead>
                        <tr style={{ background: 'var(--accent-light)' }}>
                          <th style={{ padding: '10px 16px' }}>Run ID</th>
                          <th style={{ padding: '10px 16px' }}>Model</th>
                          <th style={{ padding: '10px 16px' }}>Executed</th>
                          <th style={{ padding: '10px 16px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {runs.slice(0, 8).map((r) => (
                          <tr
                            key={r.run_id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => { window.location.hash = `#/runs/inspect/${r.run_id}`; setSelectedRunId(r.run_id); }}
                          >
                            <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>{r.run_id.slice(0, 8)}...</td>
                            <td style={{ padding: '10px 16px', fontSize: 12 }}>{r.model}</td>
                            <td style={{ padding: '10px 16px', fontSize: 11, color: 'var(--muted)' }}>
                              {r.created_at ? new Date(r.created_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                            </td>
                            <td style={{ padding: '10px 16px' }}>
                              <span className={`status-badge ${r.status}`} style={{ fontSize: 10 }}>{r.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
