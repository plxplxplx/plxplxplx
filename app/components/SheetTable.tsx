// app/components/SheetTable.tsx
'use client'
import React, { useState } from 'react'
import { EventRow } from '../types/event'

type Props = { data: EventRow[] }
type ImageEntry = { id: string; name: string }
type Section = 'images' | 'info' | 'participants'

export default function SheetTable({ data }: Props) {
  const BORDER_WIDTH_CLASS = 'border'
  const BORDER_COLOR_CLASS = 'border-blue-700'

  const [sectionsByRow, setSectionsByRow] = useState<Record<number, Section[]>>({})
  const [imagesByRow, setImagesByRow] = useState<Record<number, ImageEntry[]>>({})
  const [loadingRows, setLoadingRows] = useState<Set<number>>(new Set())
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({})
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  const bgCycle = ['bg-blue-50', 'bg-pink-50', 'bg-gray-100']

  const toggleSection = async (
    rowIdx: number,
    section: Section,
    folderUrl?: string
  ) => {
    const current = sectionsByRow[rowIdx] || []
    const isOpen = current.includes(section)
    let next = current.filter(s => s !== section)
    if (!isOpen) {
      next = [section, ...next]
      if (section === 'images' && folderUrl && !imagesByRow[rowIdx]) {
        const m = folderUrl.match(/\/folders\/([A-Za-z0-9_-]+)/)
        if (m) {
          setLoadingRows(r => new Set(r).add(rowIdx))
          try {
            const res = await fetch(`/api/images?folderId=${m[1]}`)
            const json = await res.json()
            if (json.images) {
              setImagesByRow(r => ({ ...r, [rowIdx]: json.images }))
              setLoadingImages(prev =>
                json.images.reduce((acc: any, img: ImageEntry) => ({ ...acc, [img.id]: true }), {})
              )
            }
          } finally {
            setLoadingRows(r => {
              const c = new Set(r)
              c.delete(rowIdx)
              return c
            })
          }
        }
      }
    }
    setSectionsByRow(prev => ({ ...prev, [rowIdx]: next }))
  }

  if (!data.length) {
    return <p className="p-4 text-gray-700">Inga evenemang att visa.</p>
  }

  return (
    <>
      {/* Lightbox */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 cursor-zoom-out"
        >
          <img
            src={lightboxUrl}
            alt="Förhandsvisning"
            className="max-w-full max-h-full rounded shadow-lg"
          />
        </div>
      )}

      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto p-4 max-w-screen-xl mx-auto">
        <table
          className={`
            w-full table-fixed border-collapse
            ${BORDER_WIDTH_CLASS} ${BORDER_COLOR_CLASS}
            font-mono text-gray-800
          `}
        >
          <thead>
            <tr>
              <th
                className={`${BORDER_WIDTH_CLASS} ${BORDER_COLOR_CLASS} px-4 py-2 text-left w-1/3`}
              >
                Titel
              </th>
              <th
                className={`${BORDER_WIDTH_CLASS} ${BORDER_COLOR_CLASS} px-4 py-2 text-left w-1/3`}
              >
                Info
              </th>
              <th
                className={`${BORDER_WIDTH_CLASS} ${BORDER_COLOR_CLASS} px-4 py-2 text-left w-1/3`}
              >
                Startdatum
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const bg = bgCycle[idx % bgCycle.length]
              const folderUrl = row['Länk utvalda bilder'] || ''
              const eventUrl = row['Länk till event'] || ''
              const sections = sectionsByRow[idx] || []
              const imgs = imagesByRow[idx] || []

              return (
                <React.Fragment key={idx}>
                  {/* Main row */}
                  <tr className={bg}>
                    <td
                      className={`${BORDER_WIDTH_CLASS} ${BORDER_COLOR_CLASS} px-4 py-2 text-lg font-bold`}
                    >
                      {row.Titel}
                    </td>
                    <td
                      className={`${BORDER_WIDTH_CLASS} ${BORDER_COLOR_CLASS} px-4 py-2 align-top`}
                    >
                      <ul className="list-none m-0 p-0 space-y-1">
                        <li>
                          <strong>Kategori:</strong> {row.Kategori}
                        </li>
                        <li>
                          <strong>Plats:</strong> {row.Plats}
                        </li>
                        {folderUrl && (
                          <li>
                            <span
                              onClick={() =>
                                toggleSection(idx, 'images', folderUrl)
                              }
                              className="underline cursor-pointer"
                            >
                              {sections.includes('images')
                                ? 'Stäng bilder ↑'
                                : 'Öppna bilder ↓'}
                            </span>
                          </li>
                        )}
                        {row.Beskrivning && (
                          <li>
                            <span
                              onClick={() => toggleSection(idx, 'info')}
                              className="underline cursor-pointer"
                            >
                              {sections.includes('info')
                                ? 'Stäng info ↑'
                                : 'Mer info ↓'}
                            </span>
                          </li>
                        )}
                        {row.Medverkande && (
                          <li>
                            <span
                              onClick={() =>
                                toggleSection(idx, 'participants')
                              }
                              className="underline cursor-pointer"
                            >
                              {sections.includes('participants')
                                ? 'Stäng medverkande ↑'
                                : 'Medverkande ↓'}
                            </span>
                          </li>
                        )}
                        {eventUrl && (
                          <li>
                            <a
                              href={eventUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline cursor-pointer"
                            >
                              Öppna event
                            </a>
                          </li>
                        )}
                      </ul>
                    </td>
                    <td
                      className={`${BORDER_WIDTH_CLASS} ${BORDER_COLOR_CLASS} px-4 py-2`}
                    >
                      {row.Startdatum}
                    </td>
                  </tr>

                  {/* Sections */}
                  {sections.map(section => {
                    if (section === 'images') {
                      return (
                        <tr key="images" className={bg}>
                          <td
                            colSpan={3}
                            className={`${BORDER_WIDTH_CLASS} ${BORDER_COLOR_CLASS} px-4 py-4`}
                          >
                            <div className="flex flex-wrap gap-2">
                              {imgs.length ? (
                                imgs.map(img => (
                                  <div
                                    key={img.id}
                                    className={`
                                      relative h-32 w-32 overflow-hidden cursor-pointer
                                      ${BORDER_WIDTH_CLASS} ${BORDER_COLOR_CLASS}
                                    `}
                                    onClick={() =>
                                      setLightboxUrl(`/api/images/${img.id}`)
                                    }
                                  >
                                    {loadingImages[img.id] && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                        <div
                                          className={`
                                            h-6 w-6 animate-spin rounded-full
                                            ${BORDER_WIDTH_CLASS} ${BORDER_COLOR_CLASS}
                                            border-t-transparent
                                          `}
                                        />
                                      </div>
                                    )}
                                    <img
                                      src={`/api/images/${img.id}`}
                                      alt={img.name}
                                      onLoad={() =>
                                        setLoadingImages(prev => ({
                                          ...prev,
                                          [img.id]: false,
                                        }))
                                      }
                                      className={`h-full w-full object-cover ${
                                        loadingImages[img.id] ? 'hidden' : ''
                                      }`}
                                    />
                                  </div>
                                ))
                              ) : (
                                <em className="text-gray-500">Inga bilder</em>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    }
                    if (section === 'info') {
                      return (
                        <tr key="info" className={bg}>
                          <td
                            colSpan={3}
                            className={`${BORDER_WIDTH_CLASS} ${BORDER_COLOR_CLASS} px-4 py-4 break-words`}
                          >
                            {row.Beskrivning}
                          </td>
                        </tr>
                      )
                    }
                    if (section === 'participants') {
                      return (
                        <tr key="participants" className={bg}>
                          <td
                            colSpan={3}
                            className={`${BORDER_WIDTH_CLASS} ${BORDER_COLOR_CLASS} px-4 py-4 break-words`}
                          >
                            <ul className="list-disc list-inside space-y-1">
                              {row.Medverkande.split(',').map((p, i) => (
                                <li key={i}>{p.trim()}</li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      )
                    }
                    return null
                  })}

                  {/* Spacer */}
                  {idx < data.length - 1 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="h-4 bg-white p-0 border-none"
                      />
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden px-2 space-y-4">
        {data.map((row, idx) => {
          const bg = bgCycle[idx % bgCycle.length]
          const folderUrl = row['Länk utvalda bilder'] || ''
          const eventUrl = row['Länk till event'] || ''
          const sections = sectionsByRow[idx] || []
          const imgs = imagesByRow[idx] || []

          return (
            <React.Fragment key={idx}>
              <div
                className={`
                  ${bg} p-4 rounded-lg font-mono text-gray-800
                  ${BORDER_WIDTH_CLASS} ${BORDER_COLOR_CLASS}
                `}
              >
                <p className="text-lg font-bold">{row.Titel}</p>
                <p><strong>Kategori:</strong> {row.Kategori}</p>
                <p><strong>Plats:</strong> {row.Plats}</p>
                {folderUrl && (
                  <span
                    onClick={() => toggleSection(idx, 'images', folderUrl)}
                    className="underline cursor-pointer block"
                  >
                    {sections.includes('images')
                      ? 'Stäng bilder ↑'
                      : 'Öppna bilder ↓'}
                  </span>
                )}
                {row.Beskrivning && (
                  <span
                    onClick={() => toggleSection(idx, 'info')}
                    className="underline cursor-pointer block"
                  >
                    {sections.includes('info') ? 'Stäng info ↑' : 'Mer info ↓'}
                  </span>
                )}
                {row.Medverkande && (
                  <span
                    onClick={() => toggleSection(idx, 'participants')}
                    className="underline cursor-pointer block"
                  >
                    {sections.includes('participants')
                      ? 'Stäng medverkande ↑'
                      : 'Medverkande ↓'}
                  </span>
                )}
                {eventUrl && (
                  <a
                    href={eventUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline cursor-pointer block"
                  >
                    Öppna event
                  </a>
                )}
                <p className="mt-2"><strong>Startdatum:</strong> {row.Startdatum}</p>

                {/* Render sections */}
                {sections.map(section => {
                  if (section === 'images') {
                    return (
                      <div key="images" className="mt-2 flex flex-wrap gap-2">
                        {imgs.length ? (
                          imgs.map(img => (
                            <div
                              key={img.id}
                              className={`
                                relative h-32 w-32 overflow-hidden cursor-pointer
                                ${BORDER_WIDTH_CLASS} ${BORDER_COLOR_CLASS}
                              `}
                              onClick={() =>
                                setLightboxUrl(`/api-images/${img.id}`)
                              }
                            >
                              {loadingImages[img.id] && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                  <div
                                    className={`
                                      h-6 w-6 animate-spin rounded-full
                                      ${BORDER_WIDTH_CLASS} ${BORDER_COLOR_CLASS}
                                      border-t-transparent
                                    `}
                                  />
                                </div>
                              )}
                              <img
                                src={`/api/images/${img.id}`}
                                alt={img.name}
                                onLoad={() =>
                                  setLoadingImages(prev => ({
                                    ...prev,
                                    [img.id]: false,
                                  }))
                                }
                                className={`
                                  h-full w-full object-cover
                                  ${loadingImages[img.id] ? 'hidden' : ''}
                                `}
                              />
                            </div>
                          ))
                        ) : (
                          <em className="text-gray-500">Inga bilder</em>
                        )}
                      </div>
                    )
                  }
                  if (section === 'info') {
                    return (
                      <p key="info" className="mt-2 break-words">
                        {row.Beskrivning}
                      </p>
                    )
                  }
                  if (section === 'participants') {
                    return (
                      <ul key="participants" className="mt-2 list-disc list-inside space-y-1">
                        {row.Medverkande.split(',').map((p, i) => (
                          <li key={i}>{p.trim()}</li>
                        ))}
                      </ul>
                    )
                  }
                  return null
                })}
              </div>
              {idx < data.length - 1 && <div className="h-4 bg-white" />}
            </React.Fragment>
          )
        })}
      </div>
    </>
  )
}
