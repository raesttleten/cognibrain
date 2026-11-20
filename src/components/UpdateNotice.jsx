export default function UpdateNotice({ onReload, onDismiss }) {
  return (
    <div className="update-notice" role="status">
      <p className="update-text">
        <strong>Hay una versión nueva de CogniBrain.</strong> Recarga para usarla.
      </p>
      <div className="update-actions">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onDismiss}>
          Después
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={onReload}>
          Actualizar
        </button>
      </div>
    </div>
  )
}
