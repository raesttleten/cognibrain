import { useState } from 'react'
import { downloadHistoryCsv } from '../csv.js'

const PAGE = 10

const dateFormat = new Intl.DateTimeFormat('es', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

function formatDate(iso) {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : dateFormat.format(date)
}

export default function History({ entries, available, onClear }) {
  const [confirming, setConfirming] = useState(false)
  const [visible, setVisible] = useState(PAGE)
  const shown = entries.slice(0, visible)

  const clear = () => {
    onClear()
    setConfirming(false)
    setVisible(PAGE)
  }

  return (
    <section className="history" aria-labelledby="history-title">
      <div className="history-head">
        <div>
          <h2 className="history-title" id="history-title">Mis resultados</h2>
          <p className="history-note">
            {available
              ? 'Se guardan solo en este dispositivo y en este navegador. No se guarda tu nombre ni otros datos personales.'
              : 'Este navegador no permite guardar resultados, así que no quedarán en el historial.'}
          </p>
        </div>
        {entries.length > 0 && !confirming && (
          <div className="history-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => downloadHistoryCsv(entries)}>
              Descargar CSV
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConfirming(true)}>
              Borrar historial
            </button>
          </div>
        )}
      </div>

      {confirming && (
        <div className="history-confirm" role="alertdialog" aria-labelledby="history-confirm-text">
          <p id="history-confirm-text">
            ¿Borrar las {entries.length} partidas guardadas? No se pueden recuperar.
          </p>
          <div className="history-confirm-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConfirming(false)}>
              Cancelar
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={clear}>
              Sí, borrar
            </button>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <p className="history-empty">Aún no has jugado. Cuando termines una partida, aparecerá aquí.</p>
      ) : (
        <>
          <ul className="history-list">
            {shown.map((entry) => (
              <li className="history-item" key={`${entry.date}-${entry.gameId}`}>
                <div className="history-item-head">
                  <span className="history-game">{entry.gameTitle}</span>
                  <time className="history-date" dateTime={entry.date}>
                    {formatDate(entry.date)}
                  </time>
                </div>
                <ul className="history-metrics">
                  {entry.items.map((item) => (
                    <li className="history-metric" key={item.label}>
                      <strong>{item.value}</strong> {item.label}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <div className="history-foot">
            <span className="history-count">
              {entries.length === 1 ? '1 partida guardada' : `${entries.length} partidas guardadas`}
            </span>
            {entries.length > visible && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setVisible((v) => v + PAGE)}>
                Ver más
              </button>
            )}
          </div>
        </>
      )}
    </section>
  )
}
