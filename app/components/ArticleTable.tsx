// components/ArticleTable.tsx
'use client'

import React from 'react'
import { ArticleRow } from '../types/article'

type Props = { articles: ArticleRow[] }

// top‐row columns & typings
const TOP_COLUMNS = ['Datum','Titel','Medium','Länk'] as const
type TopKey = typeof TOP_COLUMNS[number]

export default function ArticleTable({ articles }: Props) {
  const BORDER = 'border'
  const BORDER_COLOR = 'border-blue-700'
  const bgCycle = ['bg-blue-50','bg-pink-50','bg-gray-100'] as const

  if (articles.length === 0) {
    return <p className="p-4 text-gray-700">Inga artiklar att visa.</p>
  }

  return (
    <div className="hidden md:block overflow-x-auto p-4 w-full">
      <table
        className={`
          min-w-full
          table-fixed
          border-collapse
          ${BORDER} ${BORDER_COLOR}
          font-mono text-gray-800
        `}
      >
        <thead>
          <tr>
            {TOP_COLUMNS.map((col) => (
              <th
                key={col}
                className={`
                  ${BORDER} ${BORDER_COLOR}
                  px-4 py-2 text-left
                  w-1/4
                `}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {articles.map((row, idx) => {
            const bg = bgCycle[idx % bgCycle.length]

            return (
              <React.Fragment key={idx}>
                {/* Top row */}
                <tr className={bg}>
                  {TOP_COLUMNS.map((col) => {
                    const val = (row[col as TopKey] || '').trim()

                    // render "Länk" as a clickable Läs
                    if (col === 'Länk' && val.startsWith('http')) {
                      return (
                        <td
                          key={col}
                          className={`${BORDER} ${BORDER_COLOR} px-4 py-2`}
                        >
                          <a
                            href={val}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline cursor-pointer text-blue-600"
                          >
                            Läs
                          </a>
                        </td>
                      )
                    }

                    // Datum, Titel, Medium as text
                    const isTitle = col === 'Titel'
                    return (
                      <td
                        key={col}
                        className={`
                          ${BORDER} ${BORDER_COLOR}
                          px-4 py-2 break-words
                          ${isTitle ? 'text-lg font-bold' : ''}
                        `}
                      >
                        {val}
                      </td>
                    )
                  })}
                </tr>

                {/* Sammanfattning row */}
                <tr className={bg}>
                  <td
                    colSpan={4}
                    className={`${BORDER} ${BORDER_COLOR} px-4 py-4 break-words`}
                  >
                    {row.Sammanfattning}
                  </td>
                </tr>

                {/* Spacer */}
                {idx < articles.length - 1 && (
                  <tr>
                    <td colSpan={4} className="h-4 bg-white border-none p-0" />
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
