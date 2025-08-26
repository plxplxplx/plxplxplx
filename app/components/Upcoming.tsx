'use client'

import useSWR from 'swr'
import { useEffect } from 'react'

export interface UpcomingRow {
  Titel: string
  Kategori: string
  Beskrivning: string
  Medverkande: string
  Startdatum: string
  Slutdatum: string
  Plats: string
  'Länk till event': string
}

type Props = {
  onReady?: () => void
  onClose?: () => void
  onEmpty?: () => void        // ⬅️ NEW
}

const fetcher = async (url: string): Promise<UpcomingRow[]> => {
  const res = await fetch(url)
  const json = await res.json()
  if (!Array.isArray(json)) {
    const msg = json?.error ?? 'Unexpected data format'
    throw new Error(msg)
  }
  return json
}

export default function Upcoming({ onReady, onClose, onEmpty }: Props) {
  const { data, error } = useSWR<UpcomingRow[]>('/api/upcoming', fetcher)

  useEffect(() => {
    if (!data) return
    if (data.length === 0) {
      onEmpty?.()               // ⬅️ tell parent to hide popup
    } else {
      onReady?.()
    }
  }, [data, onEmpty, onReady])

  if (error) {
    return (
      <p className="p-4 text-sm font-mono text-red-400 bg-black">
        Failed to load events: {error.message}
      </p>
    )
  }

  // If empty, render nothing (prevents a blank popup during the close transition)
  if (data && data.length === 0) return null

  if (!data) {
    return (
      <p className="p-4 text-sm font-mono text-[#91A878] bg-black">
        Loading…
      </p>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-2 sm:px-4">
      <div className="relative w-full max-w-screen-sm bg-[#1E1E1E]/80 rounded-lg shadow-lg overflow-hidden p-3 space-y-3">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-[#FDFD96] hover:text-red-400 text-3xl font-bold leading-none"
            aria-label="Stäng"
          >
            ×
          </button>
        )}

        <h2 className="text-center text-[#FDFD96] text-xl sm:text-2xl font-bold font-mono border-b border-[#91A878] pb-2">
          Kommande event
        </h2>

        {data.map((ev, i) => (
          <div
            key={i}
            className="rounded-md border border-[#91A878] p-3 font-mono text-sm text-[#EDEDED] bg-[#1E1E1E]/90 space-y-1"
          >
            <div className="text-base sm:text-lg font-bold mb-1">{ev.Titel}</div>
            <div className="flex justify-between items-center text-xs sm:text-sm text-[#CCCCCC]">
              <div>
                {ev.Startdatum} – {ev.Slutdatum} · {ev.Plats}
              </div>
              {ev['Länk till event'] && (
                <a
                  href={ev['Länk till event']}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FDFD96] hover:underline font-semibold ml-2 whitespace-nowrap"
                >
                  Info →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
