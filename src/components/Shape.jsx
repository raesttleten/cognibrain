const PATHS = {
  circle: <circle cx="20" cy="20" r="16" />,
  square: <rect x="5" y="5" width="30" height="30" rx="5" />,
  triangle: <path d="M20 6 35 33H5Z" />,
  diamond: <path d="M20 3 37 20 20 37 3 20Z" />,
  star: (
    <path d="M20 3.8c.5 0 1 .33 1.17.83l4.17 8.67 9.5 1.33c1.16.17 1.5 1.5.66 2.34l-6.83 6.66 1.67 9.34c.16 1.16-1 2-2 1.5L20 29.97l-8.33 4.5c-1 .5-2.17-.34-2-1.5l1.66-9.34-6.83-6.66c-.83-.84-.33-2.17.67-2.34l9.5-1.33 4.16-8.67c.17-.5.67-.83 1.17-.83Z" />
  ),
}

export const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'star']

export default function Shape({ kind, color = 'currentColor', size = 40, className }) {
  const rounded = kind === 'triangle'
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill={color}
      stroke={rounded ? color : 'none'}
      strokeWidth={rounded ? 3 : 0}
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[kind]}
    </svg>
  )
}
