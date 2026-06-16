export default function NewRunModal({
  isOpen,
  onClose,
  templates,
  backendConfig,
  settingsUtterances,
  runBothInParallel, setRunBothInParallel,
  selectedProvider, setSelectedProvider,
  selectedModel, setSelectedModel,
  selectedTransport, setSelectedTransport,
  numTurns, setNumTurns,
  runningId,
  compareRunIds,
  executeLoadTemplate,
  handleStartRun,
  handleStopRun,
}) {
  if (!isOpen) return null;

  const activeTemplateId = backendConfig?.active_template || 'restaurant';
  const activeTemplate = templates.find((t) => t.id === activeTemplateId);
  const maxTurns = settingsUtterances.length || 10;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Launch New Benchmark Run</span>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body" style={{ color: 'var(--fg)' }}>
          <div style={{ marginBottom: 20 }}>
            <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Benchmarking Scenario</label>
            <select
              className="select-input"
              value={activeTemplateId}
              onChange={(e) => executeLoadTemplate(e.target.value)}
              style={{ width: '100%', marginBottom: 6, height: 36 }}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
              {activeTemplateId === 'custom' && (
                <option value="custom">Custom Usecase</option>
              )}
            </select>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              fontSize: 11,
              color: 'var(--muted)',
              padding: '0 4px',
            }}>
              <span style={{ flex: 1, paddingRight: 12 }}>
                {activeTemplate?.description || 'Manually edited test script and system prompt.'}
              </span>
              <span style={{ fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--color-primary)' }}>
                {maxTurns} scripted turns
              </span>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="checkbox-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={runBothInParallel}
                onChange={(e) => setRunBothInParallel(e.target.checked)}
              />
              Compare Gemini &amp; OpenAI in parallel
            </label>
          </div>

          {!runBothInParallel && (
            <div className="form-row" style={{ marginBottom: 12 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Active Provider</label>
                <select
                  className="select-input"
                  value={selectedProvider}
                  onChange={(e) => {
                    const prov = e.target.value;
                    setSelectedProvider(prov);
                    if (prov === 'gemini') {
                      setSelectedModel(backendConfig?.gemini_model || 'gemini-3.1-flash-live-preview');
                    } else {
                      setSelectedModel(backendConfig?.openai_model || 'gpt-realtime-2');
                    }
                  }}
                >
                  {backendConfig?.providers?.map((p) => (
                    <option key={p} value={p}>{p.toUpperCase()}</option>
                  )) || (
                    <>
                      <option value="gemini">GEMINI</option>
                      <option value="openai">OPENAI</option>
                    </>
                  )}
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Model Version</label>
                <select
                  className="select-input"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  {selectedProvider === 'gemini' ? (
                    <>
                      <option value={backendConfig?.gemini_model || 'gemini-3.1-flash-live-preview'}>
                        {backendConfig?.gemini_model || 'gemini-3.1-flash-live-preview'} (Default)
                      </option>
                      {backendConfig?.gemini_model !== 'gemini-3.1-flash-live-preview' && (
                        <option value="gemini-3.1-flash-live-preview">gemini-3.1-flash-live-preview</option>
                      )}
                    </>
                  ) : (
                    <>
                      <option value={backendConfig?.openai_model || 'gpt-realtime-2'}>
                        {backendConfig?.openai_model || 'gpt-realtime-2'} (Default)
                      </option>
                      {backendConfig?.openai_model !== 'gpt-realtime-2' && (
                        <option value="gpt-realtime-2">gpt-realtime-2</option>
                      )}
                    </>
                  )}
                </select>
              </div>
            </div>
          )}

          <div className="form-row" style={{ marginBottom: 16 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Transport Layer</label>
              <select
                className="select-input"
                value={selectedTransport}
                onChange={(e) => setSelectedTransport(e.target.value)}
              >
                {backendConfig?.transports?.map((t) => (
                  <option key={t} value={t}>{t}</option>
                )) || (
                  <>
                    <option value="direct-injection">direct-injection</option>
                    <option value="webrtc-local">webrtc-local</option>
                  </>
                )}
              </select>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Conversation Turns (Max: {maxTurns})</label>
              <input
                type="number"
                className="text-input"
                min={1}
                max={maxTurns}
                value={numTurns}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setNumTurns(Number.isNaN(val) ? 1 : Math.min(maxTurns, Math.max(1, val)));
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            <button className="btn" type="button" onClick={onClose}>
              Cancel
            </button>
            {runningId || compareRunIds ? (
              <button
                className="btn"
                type="button"
                style={{ backgroundColor: '#ea4335', color: '#fff', border: 'none', fontWeight: 'bold' }}
                onClick={() => {
                  handleStopRun();
                  onClose();
                }}
              >
                Stop Current Run
              </button>
            ) : (
              <button className="btn btn-primary" type="button" onClick={handleStartRun}>
                {runBothInParallel ? 'Start Parallel Run' : 'Start Run'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
