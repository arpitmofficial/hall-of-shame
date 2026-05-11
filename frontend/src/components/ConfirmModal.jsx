/**
 * ConfirmModal — drop-in replacement for window.confirm()
 * Usage:
 *   <ConfirmModal
 *     title="Delete Match?"
 *     message="This will permanently remove the match and update stats."
 *     confirmLabel="Delete"
 *     danger
 *     onConfirm={() => doDelete()}
 *     onCancel={() => setConfirm(null)}
 *   />
 */
export default function ConfirmModal({ title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) {
  return (
    <div className="overlay" onClick={onCancel}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '400px', textAlign: 'center' }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>
          {danger ? '🗑️' : '⚠️'}
        </div>
        <div className="modal-title" style={{ justifyContent: 'center', textAlign: 'center' }}>
          {title}
        </div>
        {message && (
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.6, marginTop: '-0.5rem' }}>
            {message}
          </p>
        )}
        <div className="modal-actions" style={{ justifyContent: 'center', gap: '0.75rem' }}>
          <button className="btn btn-ghost" onClick={onCancel} autoFocus>
            Cancel
          </button>
          <button
            className={`btn ${danger ? 'btn-red' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
