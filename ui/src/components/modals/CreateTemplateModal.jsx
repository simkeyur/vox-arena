export default function CreateTemplateModal({
  isOpen,
  onClose,
  templates,
  backendConfig,
  name, setName,
  description, setDescription,
  firstMessage, setFirstMessage,
  mode, setMode,
  systemPrompt, setSystemPrompt,
  toolsJson, setToolsJson,
  onSubmit,
}) {
  if (!isOpen) return null;

  const activeTemplate = templates.find((t) => t.id === backendConfig?.active_template);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card glass-card" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Create New Template</span>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body" style={{ color: 'var(--fg)', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '75vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: 8, padding: 4, background: 'var(--bg-subtle, rgba(255,255,255,0.04))', borderRadius: 6 }}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setMode('scratch');
                setSystemPrompt('You are a helpful assistant. Be concise and respond conversationally.');
                setToolsJson('[]');
              }}
              style={{
                flex: 1, fontSize: 13,
                background: mode === 'scratch' ? 'var(--color-primary)' : 'transparent',
                color: mode === 'scratch' ? 'white' : 'var(--fg)',
                border: 'none',
              }}
            >
              Start from scratch
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setMode('clone');
                setSystemPrompt(activeTemplate?.system_prompt || '');
                setToolsJson(JSON.stringify(activeTemplate?.tools || [], null, 2));
              }}
              style={{
                flex: 1, fontSize: 13,
                background: mode === 'clone' ? 'var(--color-primary)' : 'transparent',
                color: mode === 'clone' ? 'white' : 'var(--fg)',
                border: 'none',
              }}
            >
              Clone current template
            </button>
          </div>

          <p style={{ fontSize: 12, opacity: 0.7, margin: 0 }}>
            {mode === 'scratch'
              ? 'Define a brand-new agent. The system prompt and tools below are what the agent will see — defaults are starter placeholders.'
              : `Copy the system prompt and tools of "${activeTemplate?.name || 'the active template'}", then tweak below.`}
          </p>

          <div className="form-group">
            <label className="form-label">Template Name</label>
            <input
              type="text"
              className="text-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hotel Booking Concierge"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              className="text-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this test suite verify?"
              style={{ minHeight: 60, resize: 'vertical', fontSize: 13 }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">System Prompt</label>
            <textarea
              className="text-input"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are a helpful hotel concierge for The Grand Plaza..."
              style={{ minHeight: 120, resize: 'vertical', fontSize: 13, fontFamily: 'var(--font-mono)' }}
            />
            <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
              This is the agent's persona and instructions. The bug you saw earlier came from silently inheriting Saffron Leaf — edit this to define your own agent.
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tools (JSON array)</label>
            <textarea
              className="text-input"
              value={toolsJson}
              onChange={(e) => setToolsJson(e.target.value)}
              placeholder="[]"
              style={{ minHeight: 100, resize: 'vertical', fontSize: 12, fontFamily: 'var(--font-mono)' }}
            />
            <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
              Use <code>[]</code> for no tools. Each tool needs <code>name</code>, <code>description</code>, and JSON-schema <code>parameters</code>.
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">First Test Utterance</label>
            <input
              type="text"
              className="text-input"
              value={firstMessage}
              onChange={(e) => setFirstMessage(e.target.value)}
              placeholder="e.g. Hi, I'd like to book a king-sized room for next week."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <button className="btn" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" type="button" onClick={onSubmit}>
              Create Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
