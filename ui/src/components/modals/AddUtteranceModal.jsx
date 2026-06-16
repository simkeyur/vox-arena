export default function AddUtteranceModal({
  isOpen,
  onClose,
  templates,
  backendConfig,
  editingIdx,
  id,
  text, setText,
  expectType, setExpectType,
  phrases, setPhrases,
  tool, setTool,
  args, setArgs,
  behaviorType, setBehaviorType,
  bargeInDelay, setBargeInDelay,
  expectInterrupted, setExpectInterrupted,
  onSubmit,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">
            {editingIdx !== null ? 'Edit Utterance' : 'Add Utterance'}
          </span>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body" style={{ color: 'var(--fg)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: -8 }}>
            Template: <strong style={{ color: 'var(--color-primary)' }}>
              {templates.find((t) => t.id === backendConfig?.active_template)?.name || 'Current Evaluation Script'}
            </strong>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Turn ID</label>
              <input
                type="text"
                className="text-input"
                value={id}
                disabled
                style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)', opacity: 0.6, cursor: 'not-allowed' }}
                placeholder="ID"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Prompt Text</label>
              <input
                type="text"
                className="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the phrase the user should say..."
                autoFocus
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Expectation Validation</label>
              <select
                className="select-input"
                value={expectType}
                onChange={(e) => setExpectType(e.target.value)}
              >
                <option value="none">None (No check)</option>
                <option value="phrases">Response contains (any of)</option>
                <option value="tool">Expected Tool Call</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Turn Behavior</label>
              <select
                className="select-input"
                value={behaviorType}
                onChange={(e) => setBehaviorType(e.target.value)}
              >
                <option value="sequential">Sequential (default)</option>
                <option value="barge_in">Barge-in (interrupt)</option>
              </select>
            </div>
          </div>

          {expectType === 'phrases' && (
            <div className="form-group">
              <label className="form-label">
                Phrases the response must contain (comma-separated)
              </label>
              <input
                type="text"
                className="text-input"
                value={phrases}
                onChange={(e) => setPhrases(e.target.value)}
                placeholder="e.g. verify, identity"
              />
            </div>
          )}

          {expectType === 'tool' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Expected Tool Name</label>
                <input
                  type="text"
                  className="text-input"
                  value={tool}
                  onChange={(e) => setTool(e.target.value)}
                  placeholder="e.g. get_hours"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Expected Arguments (JSON)</label>
                <input
                  type="text"
                  className="text-input"
                  value={args}
                  onChange={(e) => setArgs(e.target.value)}
                  placeholder='e.g. {"guests": 2}'
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 16 }}>
            {behaviorType === 'barge_in' && (
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Barge-in Delay (ms)</label>
                <input
                  type="number"
                  className="text-input"
                  value={bargeInDelay}
                  onChange={(e) => setBargeInDelay(parseInt(e.target.value, 10) || 0)}
                />
              </div>
            )}
            <div className="form-group" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, marginTop: behaviorType === 'barge_in' ? 24 : 0 }}>
              <input
                type="checkbox"
                id="new-expect-interrupted"
                checked={expectInterrupted}
                onChange={(e) => setExpectInterrupted(e.target.checked)}
              />
              <label className="form-label" htmlFor="new-expect-interrupted" style={{ margin: 0, fontSize: 13 }}>
                Expect Interrupted
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <button className="btn" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" type="button" onClick={onSubmit}>
              {editingIdx !== null ? 'Save Changes' : 'Add Utterance'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
