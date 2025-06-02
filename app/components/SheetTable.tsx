'use client'
import React, { useState, useEffect } from 'react'
import { EventRow } from '../types/event' // Assuming EventWithImages is not used directly here
                                         // and images are fetched on demand.
                                         // If EventRow should be EventWithImages and pre-populated,
                                         // this logic would change.

type Props = { data: EventRow[] }
// Define ImageEntry more robustly, matching what your API returns
type ImageEntry = { 
  id: string; 
  name: string;
  url: string; // This should be the URL like /api/images/${id}
}
type Section = 'images' | 'info' | 'participants'

export default function SheetTable({ data }: Props) {
  const BORDER = 'border border-blue-700'
  const bgCycle = ['bg-blue-50', 'bg-pink-50', 'bg-gray-100']

  // Stores an array of currently open section types for each row index
  const [sectionsByRow, setSectionsByRow] = useState<Record<number, Section[]>>({})
  // Stores the fetched images for each row index
  const [imagesByRow, setImagesByRow] = useState<Record<number, ImageEntry[]>>({})
  // Stores loading state for individual images (keyed by rowIdx-img.id for uniqueness)
  const [loadingImagePlaceholders, setLoadingImagePlaceholders] = useState<Record<string, boolean>>({})
  // Stores loading state for the entire image section of a row (keyed by rowIdx)
  const [loadingImageSection, setLoadingImageSection] = useState<Record<number, boolean>>({})
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  const toggleSection = async (
    rowIdx: number,
    section: Section,
    folderUrl?: string
  ) => {
    const currentSections = sectionsByRow[rowIdx] || []
    const isSectionOpen = currentSections.includes(section)
    let nextSections: Section[]

    if (isSectionOpen) {
      // Close the section
      nextSections = currentSections.filter(s => s !== section)
    } else {
      // Open the section - make it the first (topmost)
      nextSections = [section, ...currentSections.filter(s => s !== section)]
      
      // If opening 'images' section and it hasn't been fetched yet for this row
      if (section === 'images' && folderUrl && !imagesByRow[rowIdx]) {
        const match = folderUrl.match(/\/folders\/([A-Za-z0-9_-]+)/)
        if (match && match[1]) {
          const folderId = match[1]
          setLoadingImageSection(prev => ({ ...prev, [rowIdx]: true })) // Show loading for the whole section
          try {
            const res = await fetch(`/api/images?folderId=${folderId}`)
            if (!res.ok) {
              throw new Error(`Failed to fetch images: ${res.status} ${res.statusText}`)
            }
            const json = await res.json()
            if (json.images && Array.isArray(json.images)) {
              setImagesByRow(r => ({ ...r, [rowIdx]: json.images }))
              // Initialize placeholder loading state for each new image
              setLoadingImagePlaceholders(prev => {
                const newStates = { ...prev }
                json.images.forEach((img: ImageEntry) => {
                  newStates[`${rowIdx}-${img.id}`] = true;
                });
                return newStates;
              });
            } else {
              console.error('Fetched data does not contain an images array:', json)
              setImagesByRow(r => ({ ...r, [rowIdx]: [] })) // Set to empty if malformed
            }
          } catch (e) {
            console.error('Image fetch error for row', rowIdx, ':', e)
            setImagesByRow(r => ({ ...r, [rowIdx]: [] })) // Set to empty on error to prevent broken state
          } finally {
            setLoadingImageSection(prev => ({ ...prev, [rowIdx]: false }))
          }
        } else {
          console.warn("Could not extract folderId from URL:", folderUrl);
          setImagesByRow(r => ({ ...r, [rowIdx]: [] })); // No valid folder URL
        }
      }
    }
    // Update UI immediately to open/close the section
    setSectionsByRow(prev => ({ ...prev, [rowIdx]: nextSections }))
  }

  const handleImageLoad = (rowIdx: number, imgId: string) => {
    setLoadingImagePlaceholders(prev => ({ ...prev, [`${rowIdx}-${imgId}`]: false }));
  };

  const handleImageError = (rowIdx: number, imgId: string) => {
    console.error(`Failed to load image: row ${rowIdx}, id ${imgId}`);
    setLoadingImagePlaceholders(prev => ({ ...prev, [`${rowIdx}-${imgId}`]: false })); // Stop showing loader even on error
    // Optionally, you could set a "broken image" placeholder here
  };


  if (!data.length) {
    return <p className="p-4 text-gray-700">Inga evenemang att visa.</p>
  }

  return (
    <>
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 cursor-zoom-out"
        >
          <img
            src={lightboxUrl}
            alt="Förhandsvisning"
            className="max-w-full max-h-full rounded shadow-lg object-contain"
            onClick={(e) => e.stopPropagation()} // Prevent closing lightbox when clicking on image itself
          />
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto p-4 w-full max-w-screen-xl mx-auto">
        <table className={`w-full table-fixed border-collapse ${BORDER} font-mono text-gray-800`}>
          {/* Table Head */}
          <thead>
            <tr>
              <th className={`${BORDER} px-4 py-2 text-left w-1/3`}>Titel</th>
              <th className={`${BORDER} px-4 py-2 text-left w-1/3`}>Info</th>
              <th className={`${BORDER} px-4 py-2 text-left w-1/3`}>Startdatum</th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {data.map((row, idx) => {
              const bg = bgCycle[idx % bgCycle.length];
              const folderUrl = row['Länk utvalda bilder'] || row['Länk alla bilder'] || '';
              const eventUrl = row['Länk till event'] || '';
              const openSectionsForRow = sectionsByRow[idx] || [];
              const imagesForRow = imagesByRow[idx] || [];
              const isLoadingThisImageSection = loadingImageSection[idx];

              return (
                <React.Fragment key={`event-${idx}`}>
                  <tr className={bg}>
                    <td className={`${BORDER} px-4 py-2 text-lg font-bold align-top`}>{row.Titel}</td>
                    <td className={`${BORDER} px-4 py-2 align-top`}>
                      <ul className="list-none m-0 p-0 space-y-1">
                        <li><strong>Kategori:</strong> {row.Kategori}</li>
                        <li><strong>Plats:</strong> {row.Plats}</li>
                        {folderUrl && (
                          <li>
                            <button
                              onClick={() => toggleSection(idx, 'images', folderUrl)}
                              className="underline cursor-pointer text-blue-600 hover:text-blue-800"
                              aria-expanded={openSectionsForRow.includes('images')}
                            >
                              {openSectionsForRow.includes('images') ? 'Stäng bilder ↑' : 'Öppna bilder ↓'}
                            </button>
                          </li>
                        )}
                        {row.Beskrivning && (
                          <li>
                            <button
                              onClick={() => toggleSection(idx, 'info')}
                              className="underline cursor-pointer text-blue-600 hover:text-blue-800"
                              aria-expanded={openSectionsForRow.includes('info')}
                            >
                              {openSectionsForRow.includes('info') ? 'Stäng info ↑' : 'Mer info ↓'}
                            </button>
                          </li>
                        )}
                        {row.Medverkande && (
                           <li>
                            <button
                              onClick={() => toggleSection(idx, 'participants')}
                              className="underline cursor-pointer text-blue-600 hover:text-blue-800"
                              aria-expanded={openSectionsForRow.includes('participants')}
                            >
                              {openSectionsForRow.includes('participants') ? 'Stäng medverkande ↑' : 'Medverkande ↓'}
                            </button>
                          </li>
                        )}
                        {eventUrl && (
                          <li>
                            <a
                              href={eventUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline cursor-pointer text-blue-600 hover:text-blue-800"
                            >
                              Öppna event &#x2197; {/* External link icon */}
                            </a>
                          </li>
                        )}
                      </ul>
                    </td>
                    <td className={`${BORDER} px-4 py-2 align-top`}>{row.Startdatum}</td>
                  </tr>

                  {/* Expanded Sections - Render based on the order in openSectionsForRow */}
                  {openSectionsForRow.map(sectionType => {
                    if (sectionType === 'images') {
                      return (
                        <tr key={`${idx}-images-section`} className={bg}>
                          <td colSpan={3} className={`${BORDER} px-4 py-4`}>
                            {isLoadingThisImageSection && (
                              <div className="flex items-center justify-center h-32">
                                <div className={`h-8 w-8 animate-spin rounded-full ${BORDER} border-t-transparent`} />
                                <span className="ml-2">Laddar bilder...</span>
                              </div>
                            )}
                            {!isLoadingThisImageSection && imagesForRow.length === 0 && (
                                <em className="text-gray-500">Inga bilder hittades eller kunde inte laddas.</em>
                            )}
                            {!isLoadingThisImageSection && imagesForRow.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                {imagesForRow.map(img => (
                                  <div
                                    key={`${idx}-${img.id}`}
                                    className={`relative aspect-square overflow-hidden cursor-pointer ${BORDER} bg-gray-200`}
                                    onClick={() => setLightboxUrl(img.url)} // Use img.url which is /api/images/${img.id}
                                  >
                                    {loadingImagePlaceholders[`${idx}-${img.id}`] && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50">
                                        <div className={`h-6 w-6 animate-spin rounded-full ${BORDER} border-t-transparent`} />
                                      </div>
                                    )}
                                    {/* Using next/image is highly recommended here instead of <img> */}
                                    <img
                                      src={img.url} // This URL should be like /api/images/${img.id}
                                      alt={img.name || row.Titel}
                                      onLoad={() => handleImageLoad(idx, img.id)}
                                      onError={() => handleImageError(idx, img.id)}
                                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${loadingImagePlaceholders[`${idx}-${img.id}`] ? 'opacity-0' : 'opacity-100'}`}
                                      loading="lazy" // Basic browser lazy loading
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    }
                    if (sectionType === 'info' && row.Beskrivning) {
                      return (
                        <tr key={`${idx}-info-section`} className={bg}>
                          <td colSpan={3} className={`${BORDER} px-4 py-4 break-words whitespace-pre-line`}>
                            {row.Beskrivning}
                          </td>
                        </tr>
                      );
                    }
                    if (sectionType === 'participants' && row.Medverkande) {
                      return (
                        <tr key={`${idx}-participants-section`} className={bg}>
                          <td colSpan={3} className={`${BORDER} px-4 py-4 break-words`}>
                            <ul className="list-disc list-inside space-y-1">
                              {row.Medverkande.split(',').map((p, i) => (
                                <li key={`${idx}-participant-${i}`}>{p.trim()}</li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      );
                    }
                    return null; // Should not happen if sectionType is valid
                  })}

                  {/* Separator Row */}
                  {idx < data.length - 1 && (
                    <tr>
                      <td colSpan={3} className="h-4 bg-white border-none p-0" />
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* TODO: Add mobile-friendly view here if needed */}
    </>
  );
}