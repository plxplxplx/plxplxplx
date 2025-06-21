// components/ArticleTable.tsx
'use client'

import React from 'react'
import { ArticleRow } from '../types/article'

type Props = { articles: ArticleRow[] }

const TOP_COLUMNS = ['Datum', 'Titel', 'Medium', 'Länk'] as const
type TopKey = typeof TOP_COLUMNS[number]

export default function ArticleTable({ articles }: Props) {
  const BORDER = 'border'
  const BORDER_COLOR = 'border-blue-700'
  const bgCycle = ['bg-pink-100', 'bg-blue-100', 'bg-zinc-50'] as const
  const MOBILE_TEXT_COLOR = 'text-slate-800'

  if (articles.length === 0) {
    return <p className="p-4 text-gray-700">Inga artiklar att visa.</p>
  }

  return (
    <div className="p-4 w-full">
      {/* --- Desktop Table View (with styled header) --- */}
      <div className="hidden md:block overflow-x-auto">
        <table
          className={`
            min-w-full
            table-fixed
            border-collapse
            ${BORDER} ${BORDER_COLOR}
            font-mono text-gray-800
          `}
        >
          {/* The invalid whitespace `{' '}` that was here has been removed 
            to fix the hydration error.
          */}
          <thead className="bg-zinc-100">
            <tr>
              {TOP_COLUMNS.map((col) => (
                <th
                  key={col}
                  className={`
                    ${BORDER} ${BORDER_COLOR}
                    px-4 py-3 text-left font-bold
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

                      if (col === 'Länk' && val.startsWith('http')) {
                        return (
                          <td
                            key={col}
                            className={`${BORDER} ${BORDER_COLOR} px-4 py-2 align-top`}
                          >
                            <a
                              href={val}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline cursor-pointer text-blue-600 hover:text-blue-800"
                            >
                              Läs
                            </a>
                          </td>
                        )
                      }

                      const isTitle = col === 'Titel'
                      return (
                        <td
                          key={col}
                          className={`
                            ${BORDER} ${BORDER_COLOR}
                            px-4 py-2 break-words align-top
                            ${isTitle ? 'text-lg font-bold' : ''}
                          `}
                        >
                          {val}
                        </td>
                      )
                    })}
                  </tr>

                  {/* Sammanfattning row */}
                  {row.Sammanfattning && (
                    <tr className={bg}>
                      <td
                        colSpan={4}
                        className={`${BORDER} ${BORDER_COLOR} px-4 py-4 break-words text-sm`}
                      >
                        {row.Sammanfattning}
                      </td>
                    </tr>
                  )}

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

      {/* --- Mobile Card View (Restyled to match SheetTable) --- */}
      <div className={`md:hidden p-2 space-y-3 ${MOBILE_TEXT_COLOR}`}>
        {articles.map((row, idx) => {
          const bg = bgCycle[idx % bgCycle.length]
          const link = (row['Länk'] || '').trim()

          return (
            <div
              key={idx}
              className={`
                overflow-hidden ${BORDER} ${BORDER_COLOR} ${bg}
              `}
            >
              <div className="p-3">
                <h3 className="text-md font-bold mb-1 break-words">
                  {row.Titel}
                </h3>
                <p className="text-xs mb-2">
                  {row.Datum} / {row.Medium}
                </p>
                <p className="text-sm break-words mb-2">
                  {row.Sammanfattning}
                </p>
                {link.startsWith('http') && (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline cursor-pointer text-blue-600 hover:text-blue-800 text-sm font-semibold"
                  >
                    Läs artikel &#x2197;
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}