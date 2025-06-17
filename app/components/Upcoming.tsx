'use client'

import useSWR from 'swr'

/* Sheet column names */
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

const fetcher = (u: string) => fetch(u).then(r => r.json())

export default function Upcoming() {
  const { data, error } = useSWR<UpcomingRow[]>('/api/upcoming', fetcher)

  if (error) return <p className="p-6">Kunde inte ladda.</p>
  if (!data)  return <p className="p-6">Laddar…</p>

  /* shared Tailwind pieces */
  const BORDER      = 'border border-blue-700'
  const CELL_BASE   = `${BORDER} px-6 py-4 font-mono text-gray-800 text-xl
                        hover:bg-blue-100 transition-colors`
  const HEADER_CELL = `${BORDER} px-6 py-4 bg-pink-200 text-blue-800
                        text-2xl font-bold text-center`

  return (
    <div className="flex items-center justify-center h-full w-full bg-blue-50">
      <table className="table-fixed border-collapse">
        <thead>
          <tr>
            <th colSpan={3} className={HEADER_CELL}>Upcoming events</th>
          </tr>
        </thead>

        <tbody>
          {data.map((ev, i) => (
            <tr key={i}>
              {/* Title */}
              <td className={`${CELL_BASE} font-bold`}>{ev.Titel}</td>

              {/* Dates & Place */}
              <td className={CELL_BASE}>
                <p><strong>Dates:</strong> {ev.Startdatum} – {ev.Slutdatum}</p>
                <p><strong>Place:</strong> {ev.Plats}</p>
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
                    Info →
                  </a>
                ) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
