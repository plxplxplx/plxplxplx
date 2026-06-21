'use client'

import { useEffect, useState } from 'react'
import { FaRegCalendar, FaTv, FaSailboat, FaPlay } from 'react-icons/fa6'

// Sändningen startar fredag 17 juli 2026, 10.30 svensk tid (CEST = UTC+2)
const BROADCAST_START = new Date('2026-07-17T10:30:00+02:00')

type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
}

function getTimeLeft(): TimeLeft {
  const diff = BROADCAST_START.getTime() - Date.now()
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  }
  const seconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    done: false,
  }
}

/* ──────────────────────────────────────────────────────────
   Vågor — deterministisk "slump" (seedad PRNG) så att SSR och
   klient ger exakt samma värden → ingen hydration-mismatch.
   Varje våg morphar sin egen s-kurva och bobbar i egen takt.
   ────────────────────────────────────────────────────────── */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const r1 = (n: number) => Number(n.toFixed(1))
const r2 = (n: number) => Number(n.toFixed(2))

type Wave = {
  x: number
  y: number
  sc: number
  values: string
  dur: number
  begin: number
  bobDur: number
  bobBegin: number
}

const HORIZON = 206 // havets horisontlinje

const WAVES: Wave[] = (() => {
  const rng = mulberry32(20260717)
  const cols = [10, 100, 190, 280, 370, 460, 550, 640, 730]
  const rows = [222, 250, 285, 325, 372, 422]
  const out: Wave[] = []
  rows.forEach((y, ri) => {
    // Perspektiv: vågor närmast horisonten är små, växer mot förgrunden
    const depth = (y - HORIZON) / (445 - HORIZON)
    const sc = r2(0.45 + depth * 0.75)
    cols.forEach((x0) => {
      const x = x0 + (ri % 2 === 0 ? 0 : 45)
      if (x > 800) return
      // Lucka åt båtflottiljen vid horisonten
      if (x > 185 && x < 352 && y < 255) return
      const amp = r1(3 + depth * 7) // vågens höjd
      const amp2 = r1(1 + depth * 4) // morfad höjd
      const up = `M0,0 q 11,${-amp} 22,0 t 22,0`
      const down = `M0,0 q 11,${amp2} 22,0 t 22,0`
      out.push({
        x,
        y,
        sc,
        values: `${up};${down};${up}`,
        dur: r2(2.6 + rng() * 3),
        begin: r2(rng() * 5),
        bobDur: r2(3 + rng() * 3),
        bobBegin: r2(rng() * 4),
      })
    })
  })
  return out
})()

/* ──────────────────────────────────────────────────────────
   Båt — blekingeeka med lutande spri-/råsegel.
   Segelkoordinater (lokala, båtens centrum = 0,0).
   ────────────────────────────────────────────────────────── */
// Båten ritad med fören åt höger (seglar mot solen).
// Storsegel (sprisegel) akter om masten, fock fram mot bogspröt.
const MAST_TOP = -182

// Storseglets hörn
const M_TACK = [-2, -2] // hals vid mastfot
const M_HEAD = [2, MAST_TOP] // strut vid masttopp
const M_PEAK = [-176, -150] // pik (akter, högt upp)
const M_CLEW = [-150, -6] // skothorn (akter, nere)

// Fockens hörn
const J_HEAD = [6, -172] // topp vid masttopp
const J_TACK = [152, 6] // hals ute på bogsprötet
const J_CLEW = [72, -2] // skothorn vid fören

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const pt = (p: number[], q: number[], t: number): [number, number] => [
  r1(lerp(p[0], q[0], t)),
  r1(lerp(p[1], q[1], t)),
]

// Vertikala vådsömmar i storseglet (överkant H→P mot underkant T→C)
const MAIN_SEAMS = [0.25, 0.5, 0.75].map((s) => ({
  t: pt(M_HEAD, M_PEAK, s),
  b: pt(M_TACK, M_CLEW, s),
}))

const poly = (...pts: number[][]) =>
  pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + ' Z'

const INK = '#1a1a1a'
const PAPER = '#f7f4ea'

// En blekingeeka. Liten variation via x/y/skala/lutning/bob-takt.
function Boat({
  x,
  y,
  scale,
  xs = 1,
  rot = 0,
  delay = 0,
  dur = 4.5,
}: {
  x: number
  y: number
  scale: number
  xs?: number // horisontell foreskortning → svagt olika perspektiv
  rot?: number
  delay?: number
  dur?: number
}) {
  return (
    <g
      className="boat-g"
      style={{ animationDelay: `${delay}s`, animationDuration: `${dur}s` }}
    >
      <g
        transform={`translate(${x} ${y}) scale(${r2(scale * xs)} ${scale}) rotate(${rot})`}
      >
        {/* Storsegel (sprisegel) */}
        <path
          d={poly(M_TACK, M_HEAD, M_PEAK, M_CLEW)}
          fill={PAPER}
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        {/* Vertikala vådsömmar */}
        <g stroke={INK} strokeWidth={1.4} strokeLinecap="round">
          {MAIN_SEAMS.map((s, i) => (
            <line key={`s${i}`} x1={s.t[0]} y1={s.t[1]} x2={s.b[0]} y2={s.b[1]} />
          ))}
        </g>
        {/* Spri-spira (diagonal upp mot piken) */}
        <line
          x1={2}
          y1={-28}
          x2={M_PEAK[0]}
          y2={M_PEAK[1]}
          stroke={INK}
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* Fock (försegel) */}
        <path
          d={poly(J_HEAD, J_TACK, J_CLEW)}
          fill={PAPER}
          stroke={INK}
          strokeWidth={3}
          strokeLinejoin="round"
        />

        {/* Bogspröt */}
        <line
          x1={88}
          y1={8}
          x2={J_TACK[0]}
          y2={J_TACK[1]}
          stroke={INK}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Mast */}
        <line
          x1={0}
          y1={14}
          x2={M_HEAD[0]}
          y2={M_HEAD[1]}
          stroke={INK}
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* Skrov — slank klinkeka med hög, böjd förstäv (höger) */}
        <path
          d="M-176,-20 C -120,-2 -40,7 30,6 C 90,5 130,-1 150,-9 C 164,-16 176,-23 174,-27 C 172,-30 166,-27 160,-18 C 165,-7 162,1 156,8 C 116,22 40,28 -42,27 C -92,26 -140,23 -150,16 C -164,10 -172,-7 -176,-20 Z"
          fill={INK}
        />
        {/* Bordläggning (klinkbord) + vattenlinje */}
        <g stroke={PAPER} strokeWidth={2} fill="none" strokeLinecap="round">
          <path d="M-158,-9 C -95,7 -15,15 52,14 C 102,13 134,7 154,-3" />
          <path d="M-148,3 C -85,18 -8,24 55,23 C 103,22 136,16 156,6" />
        </g>
      </g>
    </g>
  )
}

function CountdownCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-1 min-w-0 flex-col items-center justify-center border border-[#91A878] bg-[#1E1E1E] px-1 py-3 sm:px-2 sm:py-4">
      <span className="text-2xl sm:text-4xl font-bold tabular-nums text-[#FDFD96]">
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-1 text-[9px] sm:text-xs uppercase tracking-normal sm:tracking-widest text-[#EDEDED]">
        {label}
      </span>
    </div>
  )
}

export default function ArtsoppeseglingPage() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    setTimeLeft(getTimeLeft())
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="px-4 sm:px-8">
      <section className="max-w-screen-md mx-auto py-12 my-8 font-mono space-y-10">
        {/* ─────────── Rubrik ─────────── */}
        <header className="text-center space-y-3">
          <h1 className="text-2xl sm:text-5xl font-bold leading-tight text-[#FDFD96] break-words">
            Ärtsoppeseglingen
          </h1>
          <p className="text-sm sm:text-lg text-[#EDEDED]">
            Live — fredag 17 juli, sändningen startar 10.30
          </p>
        </header>

        {/* ─────────── Livestream-fönster (platshållare) ─────────── */}
        <div className="relative w-full aspect-video border border-[#91A878] bg-[#f7f4ea] overflow-hidden">
          {/* Animerad havsscen i teckningsstil */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 800 450"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            {/* Himmel: svart sol + fåglar */}
            <circle cx={548} cy={120} r={58} fill={INK} />
            <g fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round">
              <path d="M120,78 q 9,-8 18,0 q 9,-8 18,0" />
              <path d="M185,104 q 8,-7 16,0 q 8,-7 16,0" />
              <path d="M150,150 q 8,-7 16,0 q 8,-7 16,0" />
            </g>

            {/* Horisont — skissad linje */}
            <path
              d={`M0,${HORIZON} C 150,${HORIZON - 4} 300,${HORIZON + 3} 450,${HORIZON - 1} C 600,${HORIZON - 5} 720,${HORIZON + 2} 800,${HORIZON - 1}`}
              fill="none"
              stroke={INK}
              strokeWidth={2.5}
              strokeLinecap="round"
            />

            {/* Vågor — varje våg morphar sin egen s-kurva */}
            <g fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round">
              {WAVES.map((w, i) => (
                <g key={i} transform={`translate(${w.x} ${w.y}) scale(${w.sc})`}>
                  <path d={w.values.split(';')[0]}>
                    <animate
                      attributeName="d"
                      values={w.values}
                      dur={`${w.dur}s`}
                      begin={`-${w.begin}s`}
                      repeatCount="indefinite"
                      calcMode="spline"
                      keyTimes="0;0.5;1"
                      keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
                    />
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      values="0 0;0 -3;0 0"
                      dur={`${w.bobDur}s`}
                      begin={`-${w.bobBegin}s`}
                      repeatCount="indefinite"
                      additive="sum"
                    />
                  </path>
                </g>
              ))}
            </g>

            {/* Båtar — en liten flottilj i fjärran strax under horisonten */}
            <Boat x={212} y={244} scale={0.13} xs={0.78} rot={-3} delay={-1.7} dur={5.4} />
            <Boat x={318} y={247} scale={0.15} xs={1.05} rot={4} delay={-2.9} dur={4.1} />
            <Boat x={266} y={252} scale={0.19} xs={0.9} rot={1} delay={0} dur={4.7} />
          </svg>

          {/* Liten kanal-logga */}
          <div className="absolute top-3 left-3 bg-[#1E1E1E] text-[#FDFD96] text-[10px] sm:text-xs font-bold uppercase tracking-widest px-2 py-1 border border-[#91A878]">
            Ärtsoppe-TV
          </div>

          {/* Status-banner */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-[#1E1E1E]/95 border-t border-[#91A878] px-3 sm:px-4 py-2">
            <span className="live-dot shrink-0" />
            <span className="min-w-0 truncate text-[#FDFD96] text-[11px] sm:text-sm font-bold uppercase tracking-wide sm:tracking-widest">
              Sändningen är inte igång ännu
            </span>
            <span className="hidden sm:inline ml-auto shrink-0 text-xs text-[#EDEDED]/70">
              Livestreamen visas här när sändningen börjar
            </span>
          </div>
        </div>

        {/* ─────────── Nedräkning ─────────── */}
        <div className="text-center space-y-4">
          {timeLeft?.done ? (
            <p className="flex items-center justify-center gap-2 text-lg sm:text-xl font-bold text-[#FDFD96]">
              <FaPlay aria-hidden className="shrink-0" />
              Vi sänder live nu!
            </p>
          ) : (
            <>
              <p className="text-sm uppercase tracking-widest text-[#91A878]">
                Nedräkning till sändning
              </p>
              <div className="mx-auto flex w-full max-w-sm items-stretch justify-center gap-1.5 sm:gap-3">
                <CountdownCell value={timeLeft?.days ?? 0} label="Dagar" />
                <CountdownCell value={timeLeft?.hours ?? 0} label="Timmar" />
                <CountdownCell value={timeLeft?.minutes ?? 0} label="Minuter" />
                <CountdownCell value={timeLeft?.seconds ?? 0} label="Sekunder" />
              </div>
            </>
          )}
        </div>

        {/* ─────────── Information ─────────── */}
        <div className="border border-[#91A878] bg-[#1E1E1E]/90 px-6 sm:px-10 py-8 space-y-6 text-[#EDEDED]">
          <p className="text-lg leading-relaxed">
            Sedan sjuttonhundratalet har blekingeekan skurit vattnet i Hanöbukten.
            Sedan 1983 har soppa, punsch och tävling samlat ekorna i Näsviken varje
            sommar. I år kan du för första gången följa alltihop hemifrån, när{' '}
            <strong className="text-[#FDFD96]">Ärtsoppe-TV</strong> sänder
            Ärtsoppeseglingen live — en produktion av{' '}
            <strong className="text-[#FDFD96]">PLX</strong>.
          </p>

          <p className="text-lg leading-relaxed">
            Förvänta dig segling, reportage, studio och framträdanden.
          </p>

          <div className="border-t border-[#91A878]/40 pt-6 space-y-3 text-base">
            <p className="flex items-start gap-3">
              <FaRegCalendar aria-hidden className="mt-1 shrink-0 text-[#91A878]" />
              <span>
                <span className="text-[#91A878] font-semibold">När:</span> Fredag
                17 juli, kl 10.30
              </span>
            </p>
            <p className="flex items-start gap-3">
              <FaTv aria-hidden className="mt-1 shrink-0 text-[#91A878]" />
              <span>
                <span className="text-[#91A878] font-semibold">Var:</span> Här på
                sidan — kostnadsfritt och online
              </span>
            </p>
            <p className="flex items-start gap-3">
              <FaSailboat aria-hidden className="mt-1 shrink-0 text-[#91A878]" />
              <span>
                <span className="text-[#91A878] font-semibold">Arrangör:</span>{' '}
                Matviks Segelsällskap tillsammans med PLX, under Östersjöfestivalen
              </span>
            </p>
          </div>

          <p className="text-sm text-[#EDEDED]/70">Sätt alarmet redan nu.</p>
        </div>
      </section>

      <style jsx>{`
        .boat-g {
          transform-box: fill-box;
          transform-origin: center;
          animation: bob 4.5s ease-in-out infinite;
        }

        @keyframes bob {
          0%,
          100% {
            transform: translateY(0) rotate(-1deg);
          }
          50% {
            transform: translateY(-2px) rotate(1deg);
          }
        }

        .live-dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ff5252;
          animation: pulse 1.4s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.6);
          }
          50% {
            opacity: 0.5;
            box-shadow: 0 0 0 8px rgba(255, 82, 82, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .boat-g,
          .live-dot {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
