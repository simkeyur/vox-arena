export default function ConfirmModal({ config, onClose }) {
  if (!config) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card glass-card" style={{ maxWidth: 450 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{config.title}</span>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body" style={{ color: 'var(--fg)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
            {config.message}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <button className="btn" type="button" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                config.onConfirm();
                onClose();
              }}
              style={config.isDanger ? { backgroundColor: 'var(--error)', borderColor: 'var(--error)', color: '#fff' } : {}}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
