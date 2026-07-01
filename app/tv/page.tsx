'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  FaRegCalendar,
  FaTv,
  FaSailboat,
  FaPlay,
  FaLocationDot,
} from 'react-icons/fa6'

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

type ScheduleItem = { time: string; text: string; note?: string }
type ScheduleBlock = { time: string; title: string; items?: ScheduleItem[] }

const SCHEDULE: ScheduleBlock[] = [
  { time: '10:30–11:00', title: 'Uppladdning – studio Näsviken' },
  {
    time: '11:00–12:30',
    title: 'Start segling',
    items: [
      { time: '11:00', text: 'Stora dacron', note: 'dacron = polyestersegel' },
      { time: '11:05', text: 'Lilla dacron' },
      { time: '11:10', text: 'Bomullsklassen' },
      { time: '12:00–12:30', text: 'Målgång' },
    ],
  },
  { time: '12:30–13:30', title: 'Lunch för besättningar' },
  { time: '13:30–14:00', title: 'Prisutdelning' },
  { time: '14:00–15:00', title: 'Studion' },
  { time: '16:00–20:00', title: 'Paus' },
  { time: '20:00–21:00', title: 'Sändning från Villa Utsikten' },
]

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

export default function TvPage() {
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
        <header className="text-center">
          <p className="text-sm sm:text-lg text-[#EDEDED]">
            Live — fredag 17 juli, sändningen startar 10.30
          </p>
        </header>

        {/* ─────────── Livestream-fönster (platshållare) ─────────── */}
        <div className="w-full border border-[#91A878] bg-black overflow-hidden">
          {/* Bildyta — får bildens egna proportioner */}
          <div className="relative">
            <Image
              src="/soppa.png"
              alt="Ärtsopps-TV"
              width={1618}
              height={972}
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="block w-full h-auto"
            />

            {/* TV-flimmer ovanpå bilden */}
            <div className="tv-noise" aria-hidden />
            <div className="tv-scanlines" aria-hidden />
            <div className="tv-roll" aria-hidden />
            <div className="tv-flicker" aria-hidden />

            {/* Liten kanal-logga */}
            <div className="absolute top-3 left-3 z-10 bg-[#1E1E1E] text-[#FDFD96] text-[10px] sm:text-xs font-bold uppercase tracking-widest px-2 py-1 border border-[#91A878]">
              Ärtsopps-TV
            </div>
          </div>

          {/* Status-banner under bilden */}
          <div className="flex items-center gap-2 bg-[#1E1E1E]/95 border-t border-[#91A878] px-3 sm:px-4 py-2">
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
            <strong className="text-[#FDFD96]">Ärtsopps-TV</strong> sänder
            Ärtsoppeseglingen live — en produktion av{' '}
            <strong className="text-[#FDFD96]">PLX</strong>.
          </p>

          <p className="text-lg leading-relaxed">
            Förvänta dig segling, reportage, studio och framträdanden.
          </p>

          <p className="text-lg leading-relaxed">
            Ärtsopps-TV kan upplevas live från{' '}
            <strong className="text-[#FDFD96]">Villa Utsikten</strong> i Karlshamn.
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
              <FaLocationDot aria-hidden className="mt-1 shrink-0 text-[#91A878]" />
              <span>
                <span className="text-[#91A878] font-semibold">På plats:</span>{' '}
                Upplev sändningen live från Villa Utsikten i Karlshamn
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

        {/* ─────────── Program ─────────── */}
        <div className="border border-[#91A878] bg-[#1E1E1E]/90 px-6 sm:px-10 py-8 text-[#EDEDED]">
          <h2 className="mb-6 text-sm uppercase tracking-widest text-[#91A878]">
            Program
          </h2>
          <ul className="space-y-4">
            {SCHEDULE.map((block) => (
              <li key={block.time}>
                <div className="flex gap-3 sm:gap-4">
                  <span className="w-24 sm:w-28 shrink-0 tabular-nums text-[#FDFD96]">
                    {block.time}
                  </span>
                  <span className="flex-1 font-semibold">{block.title}</span>
                </div>

                {block.items && (
                  <ul className="mt-2 space-y-1 border-l border-[#91A878]/40 pl-3 sm:pl-4">
                    {block.items.map((item) => (
                      <li
                        key={item.time}
                        className="flex gap-3 sm:gap-4 text-sm text-[#EDEDED]/80"
                      >
                        <span className="w-24 sm:w-28 shrink-0 tabular-nums text-[#91A878]">
                          {item.time}
                        </span>
                        <span className="flex-1">
                          {item.text}
                          {item.note && (
                            <span className="text-[#EDEDED]/50">
                              {' '}
                              ({item.note})
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* ─────────── Stöd / partners ─────────── */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3 pt-2 text-sm text-[#EDEDED]/80">
          <span>Med stöd av</span>
          <a
            href="https://www.konstframjandet.se"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Konstfrämjandet"
            className="inline-flex items-center rounded bg-white px-2.5 py-1.5 transition-opacity hover:opacity-80"
          >
            <Image
              src="/konstframjandet.png"
              alt="Konstfrämjandet"
              width={668}
              height={454}
              className="h-9 w-auto"
            />
          </a>
          <span>och</span>
          <a
            href="https://www.storegate.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Storegate"
            className="inline-flex items-center rounded bg-white px-2.5 py-1.5 transition-opacity hover:opacity-80"
          >
            <Image
              src="/storegate.png"
              alt="Storegate"
              width={940}
              height={531}
              className="h-9 w-auto"
            />
          </a>
        </div>
      </section>

      <style jsx>{`
        .tv-noise,
        .tv-scanlines,
        .tv-roll,
        .tv-flicker {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        /* TV-brus */
        .tv-noise {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px 180px;
          opacity: 0.2;
          mix-blend-mode: overlay;
          animation: noise 0.28s steps(4) infinite;
        }

        @keyframes noise {
          0% {
            background-position: 0 0;
          }
          25% {
            background-position: -40px 25px;
          }
          50% {
            background-position: 35px -30px;
          }
          75% {
            background-position: -25px 40px;
          }
          100% {
            background-position: 20px 10px;
          }
        }

        /* Scanlines */
        .tv-scanlines {
          background: repeating-linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.18) 0px,
            rgba(0, 0, 0, 0.18) 1px,
            transparent 1px,
            transparent 3px
          );
          opacity: 0.65;
          animation: scan 0.9s linear infinite;
        }

        @keyframes scan {
          from {
            background-position-y: 0;
          }
          to {
            background-position-y: 12px;
          }
        }

        /* Rullande ljusband */
        .tv-roll {
          height: 35%;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(255, 255, 255, 0.14),
            transparent
          );
          animation: roll 2.6s linear infinite;
        }

        @keyframes roll {
          from {
            transform: translateY(-120%);
          }
          to {
            transform: translateY(260%);
          }
        }

        /* Ljusstyrke-flimmer */
        .tv-flicker {
          background: rgba(255, 255, 255, 0.03);
          animation: flicker 0.16s steps(3) infinite;
        }

        @keyframes flicker {
          0% {
            opacity: 0.12;
          }
          20% {
            opacity: 0.02;
          }
          40% {
            opacity: 0.16;
          }
          60% {
            opacity: 0.04;
          }
          80% {
            opacity: 0.11;
          }
          100% {
            opacity: 0.06;
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
          .tv-noise,
          .tv-roll,
          .tv-flicker,
          .live-dot {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
