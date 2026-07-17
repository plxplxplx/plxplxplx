'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  FaRegCalendar,
  FaTv,
  FaSailboat,
  FaPlay,
  FaLocationDot,
} from 'react-icons/fa6'

// Live-sändning (qcnl.tv / screen9)
const LIVE_URL = 'https://qcnl.tv/p/4twkt8Aq69t88KzOkd-EZg'
const EMBED_URL = 'https://qcnl.tv/e/RYELeLUJw1H1ptGpTYMmGLbCWJPhPUb6WKPvBGfRoOY'
const AFTERSAIL_EMBED_URL =
  'https://qcnl.tv/e/njT2lZdBn20wk0pyxhZqMmJu19XIB3OplifraJd2Jws'

// Strukturdata för sändningarna (schema.org VideoObject)
const VIDEO_LD = {
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name: 'Ärtsopps-TV',
  description:
    'En produktion av PLX och AB Svenska Baljväxter Produktion\nEn långsam-tv-hyllning till segling, sällskap, soppa – och sommaren i Karlshamn.\n',
  thumbnailUrl: [
    'https://cfcdn.screen9.com/img/a/P/aP8O87I_zm0t0XzIMkAVTA_image/thumb.jpg?v=0',
    'https://cfcdn.screen9.com/img/a/P/aP8O87I_zm0t0XzIMkAVTA_image/144p.jpg?v=0',
    'https://cfcdn.screen9.com/img/a/P/aP8O87I_zm0t0XzIMkAVTA_image/240p.jpg?v=0',
    'https://cfcdn.screen9.com/img/a/P/aP8O87I_zm0t0XzIMkAVTA_image/360p.jpg?v=0',
    'https://cfcdn.screen9.com/img/a/P/aP8O87I_zm0t0XzIMkAVTA_image/480p.jpg?v=0',
    'https://cfcdn.screen9.com/img/a/P/aP8O87I_zm0t0XzIMkAVTA_image/720p.jpg?v=0',
    'https://cfcdn.screen9.com/img/a/P/aP8O87I_zm0t0XzIMkAVTA_image/image.jpg?v=0',
  ],
  uploadDate: '2026-07-17T08:30:00Z',
  publication: {
    '@type': 'BroadcastEvent',
    startDate: '2026-07-17T08:30:00',
    endDate: '2026-07-17T19:00:00',
    isLiveBroadcast: true,
  },
  embedUrl: EMBED_URL,
}

const VIDEO_LD_AFTERSAIL = {
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name: 'After Sail TV Ärtsopps-TV 2026',
  description: 'After Sail TV Ärtsopps-TV 2026',
  thumbnailUrl: [
    'https://cfcdn.screen9.com/img/s/a/sa1vb-Z7ml_VQp3wgnqjXQ_image/thumb.jpg?v=0',
    'https://cfcdn.screen9.com/img/s/a/sa1vb-Z7ml_VQp3wgnqjXQ_image/144p.jpg?v=0',
    'https://cfcdn.screen9.com/img/s/a/sa1vb-Z7ml_VQp3wgnqjXQ_image/240p.jpg?v=0',
    'https://cfcdn.screen9.com/img/s/a/sa1vb-Z7ml_VQp3wgnqjXQ_image/360p.jpg?v=0',
    'https://cfcdn.screen9.com/img/s/a/sa1vb-Z7ml_VQp3wgnqjXQ_image/480p.jpg?v=0',
    'https://cfcdn.screen9.com/img/s/a/sa1vb-Z7ml_VQp3wgnqjXQ_image/720p.jpg?v=0',
    'https://cfcdn.screen9.com/img/s/a/sa1vb-Z7ml_VQp3wgnqjXQ_image/image.jpg?v=0',
  ],
  uploadDate: '2026-07-17T17:00:00Z',
  publication: {
    '@type': 'BroadcastEvent',
    startDate: '2026-07-17T17:00:00',
    endDate: '2026-07-17T20:00:00',
    isLiveBroadcast: true,
  },
  embedUrl: AFTERSAIL_EMBED_URL,
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

// Responsiv qcnl.tv-spelare — justerar bildförhållandet via postMessage
function LivePlayer({ src, title }: { src: string; title: string }) {
  const [pad, setPad] = useState('56.25%') // 16:9 tills spelaren justerar
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const iframe = iframeRef.current
      if (
        iframe &&
        iframe.contentWindow === e.source &&
        e.data &&
        e.data.event === 'setAspectRatio' &&
        e.data.data?.ratio
      ) {
        setPad(`${100 / e.data.data.ratio}%`)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <div className="w-full border border-[#91A878] bg-black overflow-hidden">
      <div className="relative w-full" style={{ paddingBottom: pad }}>
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          allow="autoplay; fullscreen"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    </div>
  )
}

function LiveLinkButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center justify-center gap-3 rounded border border-[#91A878] bg-[#FDFD96] px-6 py-4 text-base sm:text-lg font-bold uppercase tracking-widest text-black transition-opacity hover:opacity-90"
    >
      <FaPlay aria-hidden className="shrink-0" />
      Öppna livesändningen i ny flik
    </a>
  )
}

export default function TvPage() {
  return (
    <div className="px-4 sm:px-8">
      <section className="max-w-screen-md mx-auto py-12 my-8 font-mono space-y-8">
        {/* ─────────── Rubrik ─────────── */}
        <header className="text-center">
          <p className="text-sm sm:text-lg text-[#EDEDED]">
            Live — fredag 17 juli, sändningen startar 10.30
          </p>
        </header>

        {/* ─────────── After Sail TV ─────────── */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-[#91A878]">
            After Sail TV
          </p>
          <LivePlayer
            src={AFTERSAIL_EMBED_URL}
            title="After Sail TV Ärtsopps-TV 2026"
          />
          <LiveLinkButton href={AFTERSAIL_EMBED_URL} />
        </div>

        {/* ─────────── Ärtsopps-TV ─────────── */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-[#91A878]">
            Ärtsopps-TV
          </p>
          <LivePlayer src={EMBED_URL} title="Ärtsopps-TV" />
          <LiveLinkButton href={LIVE_URL} />
        </div>

        {/* Strukturdata för sändningarna */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(VIDEO_LD_AFTERSAIL) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(VIDEO_LD) }}
        />

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
    </div>
  )
}
