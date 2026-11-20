import { useEffect, useId, useRef } from 'react'

function consequence(count) {
  if (count === 0) return 'Se borrará este perfil de este dispositivo. No se puede recuperar.'
  if (count === 1) return 'Se borrará su partida guardada en este dispositivo. No se puede recuperar.'
  return `Se borrarán sus ${count} partidas guardadas en este dispositivo. No se pueden recuperar.`
}

export default function DeleteProfileDialog({ name, count, onCancel, onConfirm }) {
  const titleId = useId()
  const textId = useId()
  const cancelRef = useRef(null)
  const cancelAction = useRef(onCancel)
  cancelAction.current = onCancel

  useEffect(() => {
    const previous = document.activeElement
    cancelRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') cancelAction.current()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [])

  return (
    <div className="dialog-backdrop" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={textId}>
        <h2 className="dialog-title" id={titleId}>¿Borrar el perfil {name}?</h2>
        <p className="dialog-text" id={textId}>{consequence(count)}</p>
        <div className="dialog-actions">
          <button type="button" ref={cancelRef} className="dialog-btn dialog-btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="dialog-btn dialog-btn-danger" onClick={onConfirm}>
            Sí, borrar
          </button>
        </div>
      </div>
    </div>
  )
}
