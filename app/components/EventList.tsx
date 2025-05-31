// app/components/EventTable.tsx
'use client'
import React from 'react'
import { EventWithImages } from '../../types/event'

type Props = { events: EventWithImages[] }

// List only the columns you want, in order
const COLUMNS = [
  'Startdatum',
  'Titel',
  'Kategori',
  'Kort beskrivning',
  'Plats',
  'Länk till event',
] as const

type ColKey = typeof COLUMNS[number]

export default function EventTable({ events }: Props) {
  if (!events.length) return <p>Inga evenemang att visa.</p>

  return (
    <table className="w-full border-collapse">
      <thead className="bg-gray-800 text-white">
        <tr>
          {COLUMNS.map(col => (
            <th key={col} className="border px-2 py-1 text-left">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {events.map((row, i) => (
          <tr
            key={i}
            className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
          >
            {COLUMNS.map(col => {
              const value = row[col as ColKey] as string

              // Render the event link as an <a>
              if (col === 'Länk till event' && value.startsWith('http')) {
                return (
                  <td key={col} className="border px-2 py-1">
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-600"
                    >
                      Öppna
                    </a>
                  </td>
                )
              }

              // Otherwise just text
              return (
                <td key={col} className="border px-2 py-1">
                  {value}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
