export default function EditTemplateModal({
  isOpen,
  onClose,
  name, setName,
  description, setDescription,
  systemPrompt, setSystemPrompt,
  toolsJson, setToolsJson,
  isBuiltin,
  onSave,
  onDelete,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card glass-card" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Edit Template</span>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body" style={{ color: 'var(--fg)', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '75vh', overflowY: 'auto' }}>
          {isBuiltin && (
            <div style={{ padding: 10, fontSize: 12, background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 4, color: 'var(--fg)' }}>
              This is a built-in template. Your edits persist across restarts.
              Use <strong>Reset All Data</strong> in the Danger Zone to restore the original.
            </div>
          )}

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
              style={{ minHeight: 140, resize: 'vertical', fontSize: 13, fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tools (JSON array)</label>
            <textarea
              className="text-input"
              value={toolsJson}
              onChange={(e) => setToolsJson(e.target.value)}
              style={{ minHeight: 140, resize: 'vertical', fontSize: 12, fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <div>
              <button
                className="btn"
                type="button"
                onClick={onDelete}
                style={{ color: '#e25656', borderColor: 'rgba(226, 86, 86, 0.4)' }}
              >
                Delete Template
              </button>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn" type="button" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-primary" type="button" onClick={onSave}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
