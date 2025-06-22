'use client'

import useSWR from 'swr'

/* Sheet columns */
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

/* fetch helper with guard */
const fetcher = async (url: string): Promise<UpcomingRow[]> => {
  const res = await fetch(url)
  const json = await res.json()

  if (!Array.isArray(json)) {
    const msg = json?.error ?? 'Unexpected data format'
    throw new Error(msg)
  }
  return json
}

export default function Upcoming() {
  const { data, error } = useSWR<UpcomingRow[]>('/api/upcoming', fetcher)

  if (error)
    return (
      <p className="p-6 font-mono text-red-400 bg-black">
        Failed to load events: {error.message}
      </p>
    )

  if (!data)
    return <p className="p-6 font-mono text-[#91A878] bg-black">Loading…</p>

  const BORDER = 'border border-[#91A878]'
  const CELL_BASE =
    `${BORDER} px-6 py-4 font-mono text-[#EDEDED] text-base ` +
    'hover:bg-[#91A878]/10 transition-colors'
  const HEADER_CELL =
    `${BORDER} px-6 py-4 bg-[#1E1E1E] text-[#91A878] ` +
    'text-2xl font-bold text-center'

  return (
    <div className="flex items-center justify-center h-full w-full bg-black/90 px-4 md:px-8">
      <table className="table-fixed border-collapse w-full shadow-lg">
        <thead>
          <tr>
            <th colSpan={3} className={HEADER_CELL}>
              Upcoming Events
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((ev, i) => (
            <tr key={i}>
              <td className={`${CELL_BASE} font-bold text-lg`}>{ev.Titel}</td>
              <td className={CELL_BASE}>
                <p><strong>Dates:</strong> {ev.Startdatum} – {ev.Slutdatum}</p>
                <p><strong>Place:</strong> {ev.Plats}</p>
              </td>
              <td className={CELL_BASE}>
                {ev['Länk till event'] ? (
                  <a
                    href={ev['Länk till event']}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FDFD96] hover:underline font-semibold"
                  >
                    Info →
                  </a>
                ) : (
                  <span className="text-gray-500">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
