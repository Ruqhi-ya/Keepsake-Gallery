// Small hand-drawn-style botanical illustrations, drawn as inline SVG.
// They use currentColor, so the colour comes from CSS (muted burgundy).

const PETAL_ANGLES = [0, 72, 144, 216, 288];

// A tiny five-petal flower centred on (x, y). Champagne gold is used only for its centre.
export function Flower({ x = 0, y = 0, s = 1, r = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      {PETAL_ANGLES.map((angle, index) => (
        <ellipse
          key={angle}
          cx="0"
          cy="-9"
          rx={5 + (index % 3) * 0.4}
          ry={9 - (index % 2) * 0.6}
          transform={`rotate(${angle})`}
          fill="currentColor"
          fillOpacity="0.1"
        />
      ))}
      <circle r="2.8" fill="var(--champagne-gold)" stroke="none" />
    </g>
  );
}

function Leaf({ d }) {
  return <path d={d} fill="currentColor" fillOpacity="0.12" />;
}

// A short sprig used on the envelope letter.
export function MiniSprig({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 24 C30 18 58 22 84 16 C96 13 104 12 112 10" />
      <Leaf d="M30 20 C26 10 32 5 38 4 C40 11 37 17 30 20 Z" />
      <Leaf d="M52 21 C50 31 56 36 63 36 C64 29 60 24 52 21 Z" />
      <Leaf d="M74 17 C72 8 78 3 84 3 C86 10 82 15 74 17 Z" />
      <Flower x={112} y={10} s={0.55} r={20} />
    </svg>
  );
}

// Large corner sprig: grows from the bottom-left towards the top-right.
// CSS flips it for the other corners.
function Sprig() {
  return (
    <>
      <path d="M14 262 C34 208 56 168 92 128 C118 99 138 70 160 22" />
      <path d="M118 98 C134 112 150 118 168 114" />
      <circle cx="170" cy="114" r="2.6" fill="currentColor" fillOpacity="0.3" />
      <Leaf d="M33 224 C14 214 8 192 14 178 C34 182 44 202 33 224 Z" />
      <Leaf d="M52 186 C74 192 90 180 96 164 C76 156 56 164 52 186 Z" />
      <Leaf d="M76 150 C56 142 48 120 54 106 C74 110 86 130 76 150 Z" />
      <Leaf d="M106 118 C128 124 146 110 150 94 C130 86 110 96 106 118 Z" />
      <Leaf d="M130 82 C112 72 106 52 112 40 C130 44 140 62 130 82 Z" />
      <path d="M52 186 C68 180 82 172 96 164" />
      <path d="M106 118 C122 114 138 106 150 94" />
      <Flower x={160} y={22} s={1.15} r={-12} />
    </>
  );
}

// Three little flowers on slender stems.
function Cluster() {
  return (
    <>
      <path d="M60 138 C60 110 58 84 44 56" />
      <path d="M60 138 C64 104 74 82 88 48" />
      <path d="M60 138 C60 100 64 70 62 30" />
      <Leaf d="M59 112 C46 108 40 96 42 86 C54 88 62 98 59 112 Z" />
      <Leaf d="M66 96 C78 94 86 84 86 74 C74 74 66 82 66 96 Z" />
      <Flower x={44} y={56} s={0.8} r={-10} />
      <Flower x={88} y={48} s={0.72} r={14} />
      <Flower x={62} y={30} s={0.9} r={4} />
    </>
  );
}

// A small bow with a champagne-gold knot.
function Bow() {
  return (
    <>
      <path d="M60 42 C40 14 8 12 10 38 C12 62 44 58 60 46 Z" fill="currentColor" fillOpacity="0.08" />
      <path d="M60 42 C80 14 112 12 110 38 C108 62 76 58 60 46 Z" fill="currentColor" fillOpacity="0.08" />
      <path d="M22 30 C30 24 40 28 48 36" />
      <path d="M98 30 C90 24 80 28 72 36" />
      <path d="M56 52 C48 66 44 76 38 86" />
      <path d="M64 52 C72 66 78 76 84 86" />
      <ellipse cx="60" cy="44" rx="7" ry="9" fill="var(--champagne-gold)" fillOpacity="0.85" stroke="currentColor" />
    </>
  );
}

const SVG_PROPS = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  focusable: 'false',
};

export default function DecorativeBotanicals({ subdued = false }) {
  return (
    <div className={`botanicals${subdued ? ' botanicals--subdued' : ''}`} aria-hidden="true">
      <svg className="botanicals__tl" viewBox="0 0 200 270" {...SVG_PROPS}>
        <Sprig />
      </svg>
      <svg className="botanicals__br" viewBox="0 0 200 270" {...SVG_PROPS}>
        <Sprig />
      </svg>
      <svg className="botanicals__tr" viewBox="0 0 120 140" {...SVG_PROPS}>
        <Cluster />
      </svg>
      <svg className="botanicals__bl" viewBox="0 0 120 100" {...SVG_PROPS}>
        <Bow />
      </svg>
    </div>
  );
}