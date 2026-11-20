import Shape from '../components/Shape.jsx'
import ATodoFoco from './ATodoFoco.jsx'
import RepiteElPatron, { PATTERN_COLORS } from './RepiteElPatron.jsx'
import SigueElPunto from './SigueElPunto.jsx'
import EncuentraElPar from './EncuentraElPar.jsx'
import SemaforoAtento from './SemaforoAtento.jsx'
import CazaFiguras, { HUNT_COLOR } from './CazaFiguras.jsx'

const PURPLE = '#5e50a1'
const SOFT = '#cfc6e8'
const MID = '#9a8fc4'

function LetterTiles({ letters, big }) {
  return (
    <div className={`art-letters${big ? ' is-big' : ''}`}>
      {letters.map((l) => (
        <span key={l} className={`art-letter${l === 'X' ? ' is-target' : ''}`}>
          {l}
        </span>
      ))}
    </div>
  )
}

function PatternPreview() {
  return (
    <div className="art-row">
      <div className="art-squares">
        {[PURPLE, MID, SOFT, '#7466b3'].map((c, i) => (
          <span key={i} style={{ background: c }} />
        ))}
      </div>
      <span className="art-sequence">1 · 3 · 2 · 4</span>
    </div>
  )
}

function PatternArt() {
  return (
    <div className="art-squares is-big">
      {PATTERN_COLORS.map((c, i) => (
        <span key={c} style={{ background: c, opacity: i === 1 ? 1 : 0.6 }} />
      ))}
    </div>
  )
}

function TrackArt({ width = 250, height = 75 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 250 75" fill="none">
      <path
        d="M4 58C40 40 60 30 98 40s70 6 92-12 40-26 56-4"
        stroke="#b9b1d6"
        strokeWidth="1.6"
        strokeDasharray="4 5"
        strokeLinecap="round"
      />
      <circle cx="18" cy="20" r="6" fill="#c9c2e2" />
      <circle cx="108" cy="58" r="6" fill="#c9c2e2" />
      <circle cx="120" cy="16" r="6" fill="#c9c2e2" />
      <circle cx="210" cy="60" r="6" fill="#c9c2e2" />
      <circle cx="166" cy="20" r="8" fill={PURPLE} />
    </svg>
  )
}

const PAIR_PREVIEW = [
  ['circle', SOFT], ['square', SOFT], ['triangle', PURPLE], ['circle', SOFT], ['square', SOFT], ['diamond', SOFT],
  ['triangle', PURPLE], ['square', SOFT], ['diamond', SOFT], ['circle', SOFT], ['triangle', SOFT], ['diamond', SOFT],
]

function PairPreview() {
  return (
    <div className="art-shapes">
      {PAIR_PREVIEW.map(([kind, color], i) => (
        <Shape key={i} kind={kind} color={color} size={20} />
      ))}
    </div>
  )
}

const PAIR_ART = [
  ['circle', PURPLE], ['square', MID], ['triangle', SOFT], ['diamond', PURPLE],
  ['square', PURPLE], ['circle', SOFT], ['triangle', PURPLE], ['diamond', MID],
]

function PairArt() {
  return (
    <div className="art-shapes is-big">
      {PAIR_ART.map(([kind, color], i) => (
        <Shape key={i} kind={kind} color={color} size={40} />
      ))}
    </div>
  )
}

function LightsPreview() {
  return (
    <div className="art-lights">
      <span style={{ background: '#b5d9c1', width: 34, height: 34 }} />
      <span style={{ background: '#5fae7a', width: 54, height: 54 }} />
      <span style={{ background: '#ecbcc4', width: 34, height: 34 }} />
    </div>
  )
}

function LightsArt() {
  return (
    <div className="art-lights is-big">
      <span style={{ background: '#5fae7a' }} />
      <span style={{ background: '#d9707f' }} />
    </div>
  )
}

function HuntPreview() {
  return (
    <div className="art-shapes is-line">
      {['star', 'circle', 'star', 'triangle', 'square', 'star', 'circle'].map((kind, i) => (
        <Shape key={i} kind={kind} color={kind === 'star' ? PURPLE : '#b4abd8'} size={kind === 'square' ? 26 : 24} />
      ))}
    </div>
  )
}

function HuntArt() {
  return (
    <div className="art-cells">
      {['circle', 'star', 'triangle'].map((kind) => (
        <span key={kind} className="tile">
          <Shape kind={kind} color={kind === 'star' ? '#d9a441' : HUNT_COLOR} size={34} />
        </span>
      ))}
    </div>
  )
}

export const GAMES = [
  {
    id: 'a-todo-foco',
    title: 'A Todo Foco',
    skill: 'Atención sostenida',
    blurb: 'Toca solo cuando aparezca la letra X.',
    how: 'Verás letras una por una. Toca el recuadro o presiona la barra espaciadora solo cuando aparezca la X. Si sale otra letra, no toques nada.',
    meta: '36 letras, cerca de 1 minuto',
    preview: () => <LetterTiles letters={['K', 'M', 'X', 'P', 'R']} />,
    art: () => <LetterTiles letters={['K', 'X', 'P']} big />,
    Component: ATodoFoco,
  },
  {
    id: 'repite-el-patron',
    title: 'Repite el Patrón',
    skill: 'Memoria de trabajo',
    blurb: 'Mira los cuadros que se iluminan y repite el orden.',
    how: 'Se iluminarán los cuadros en un orden. Cuando terminen, tócalos en el mismo orden. Cada ronda suma un cuadro más.',
    meta: 'Termina al primer error, hasta 3 minutos',
    preview: PatternPreview,
    art: PatternArt,
    Component: RepiteElPatron,
  },
  {
    id: 'sigue-el-punto',
    title: 'Sigue el Punto',
    skill: 'Seguimiento visual',
    blurb: 'Sigue con la mirada el punto marcado mientras se mueve.',
    how: 'Un punto se pintará de color por un momento. Luego todos se mueven. No le quites la mirada y, cuando se detengan, tócalo.',
    meta: '5 rondas, cerca de 1 minuto',
    preview: () => <TrackArt />,
    art: () => <TrackArt width={220} height={100} />,
    Component: SigueElPunto,
  },
  {
    id: 'encuentra-el-par',
    title: 'Encuentra el Par',
    skill: 'Atención selectiva',
    blurb: 'Busca las dos figuras que son exactamente iguales.',
    how: 'Entre todas las figuras hay solo dos exactamente iguales: misma forma y mismo tono. Toca las dos.',
    meta: '6 rondas, unos 2 minutos',
    preview: PairPreview,
    art: PairArt,
    Component: EncuentraElPar,
  },
  {
    id: 'semaforo-atento',
    title: 'Semáforo Atento',
    skill: 'Atención e inhibición',
    blurb: 'Toca solo cuando la luz esté verde.',
    how: 'Verás una luz que cambia de color. Toca el botón o presiona la barra espaciadora solo cuando la luz esté verde. Si está roja, espera sin tocar.',
    meta: '10 luces, menos de 1 minuto',
    preview: LightsPreview,
    art: LightsArt,
    Component: SemaforoAtento,
  },
  {
    id: 'caza-figuras',
    title: 'Caza Figuras',
    skill: 'Atención selectiva',
    blurb: 'Encuentra todas las estrellas escondidas.',
    how: 'Verás muchas figuras juntas. Busca y toca solo las estrellas. Si tocas otra figura, se marca en rosado y puedes seguir.',
    meta: '12 estrellas escondidas, unos 2 minutos',
    preview: HuntPreview,
    art: HuntArt,
    Component: CazaFiguras,
  },
]
