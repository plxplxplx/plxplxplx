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
  const res  = await fetch(url)
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
      <p className="p-6 font-mono text-red-600">
        Failed&nbsp;to&nbsp;load&nbsp;events: {error.message}
      </p>
    )

  if (!data)
    return <p className="p-6 font-mono">Loading…</p>

  /* shared Tailwind pieces */
  const BORDER      = 'border border-blue-700'
  const CELL_BASE   =
    `${BORDER} px-6 py-4 font-mono text-gray-800 text-xl ` +
    'hover:bg-blue-100 transition-colors'
  const HEADER_CELL =
    `${BORDER} px-6 py-4 bg-pink-100 text-blue-800 ` +   // ← light-pink header
    'text-2xl font-bold text-center'

  return (
    <div className="flex items-center justify-center h-full w-full bg-blue-50 px-4 md:px-8">
      <table className="table-fixed border-collapse w-full">
        <thead>
          <tr>
            <th colSpan={3} className={HEADER_CELL}>
              Upcoming events
            </th>
          </tr>
        </thead>

        <tbody>
          {data.map((ev, i) => (
            <tr key={i}>
              {/* Title */}
              <td className={`${CELL_BASE} font-bold`}>{ev.Titel}</td>

              {/* Dates & Place */}
              <td className={CELL_BASE}>
                <p>
                  <strong>Dates:</strong> {ev.Startdatum} – {ev.Slutdatum}
                </p>
                <p>
                  <strong>Place:</strong> {ev.Plats}
                </p>
              </td>

              {/* Link */}
              <td className={CELL_BASE}>
                {ev['Länk till event'] ? (
                  <a
                    href={ev['Länk till event']}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-800 hover:underline"
                  >
                    Info&nbsp;&rarr;
                  </a>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
