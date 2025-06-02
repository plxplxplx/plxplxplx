'use client'
import React, { useState } from 'react' 
import Image from 'next/image'
import { EventRow } from '../types/event'

type Props = { data: EventRow[] }
type ImageEntry = { 
  id: string; 
  name: string;
  url: string; 
}
type Section = 'images' | 'info' | 'participants'

export default function SheetTable({ data }: Props) {
  const BORDER = 'border border-blue-700'
  // Using lighter backgrounds for better contrast with dark text
  const bgCycle = ['bg-slate-50', 'bg-stone-50', 'bg-zinc-50'] 
  // Base text color for mobile cards, ensuring readability
  const MOBILE_TEXT_COLOR = 'text-slate-800' 

  const [sectionsByRow, setSectionsByRow] = useState<Record<number, Section[]>>({})
  const [imagesByRow, setImagesByRow] = useState<Record<number, ImageEntry[]>>({})
  const [loadingImagePlaceholders, setLoadingImagePlaceholders] = useState<Record<string, boolean>>({})
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
      nextSections = currentSections.filter(s => s !== section)
    } else {
      nextSections = [section, ...currentSections.filter(s => s !== section)]
      
      if (section === 'images' && folderUrl && !imagesByRow[rowIdx]) {
        const match = folderUrl.match(/\/folders\/([A-Za-z0-9_-]+)/)
        if (match && match[1]) {
          const folderId = match[1]
          setLoadingImageSection(prev => ({ ...prev, [rowIdx]: true }))
          try {
            const res = await fetch(`/api/images?folderId=${folderId}`)
            if (!res.ok) {
              throw new Error(`Failed to fetch images: ${res.status} ${res.statusText}`)
            }
            const json = await res.json()
            if (json.images && Array.isArray(json.images)) {
              setImagesByRow(r => ({ ...r, [rowIdx]: json.images }))
              setLoadingImagePlaceholders(prev => {
                const newStates = { ...prev }
                json.images.forEach((img: ImageEntry) => {
                  newStates[`${rowIdx}-${img.id}`] = true;
                });
                return newStates;
              });
            } else {
              console.error('Fetched data does not contain an images array:', json)
              setImagesByRow(r => ({ ...r, [rowIdx]: [] }))
            }
          } catch (e) {
            console.error('Image fetch error for row', rowIdx, ':', e)
            setImagesByRow(r => ({ ...r, [rowIdx]: [] }))
          } finally {
            setLoadingImageSection(prev => ({ ...prev, [rowIdx]: false }))
          }
        } else {
          console.warn("Could not extract folderId from URL for images:", folderUrl);
          setImagesByRow(r => ({ ...r, [rowIdx]: [] }));
        }
      }
    }
    setSectionsByRow(prev => ({ ...prev, [rowIdx]: nextSections }))
  }

  const handleImageLoad = (rowIdx: number, imgId: string) => {
    setLoadingImagePlaceholders(prev => ({ ...prev, [`${rowIdx}-${imgId}`]: false }));
  };

  const handleImageError = (rowIdx: number, imgId: string) => {
    console.error(`Failed to load image: row ${rowIdx}, id ${imgId}`);
    setLoadingImagePlaceholders(prev => ({ ...prev, [`${rowIdx}-${imgId}`]: false }));
  };

  if (!data.length) {
    return <p className="p-4 text-gray-700">Inga evenemang att visa.</p>
  }

  const renderExpandedContent = (row: EventRow, idx: number, sectionType: Section) => {
    const imagesForRow = imagesByRow[idx] || [];
    const isLoadingThisImageSection = loadingImageSection[idx];

    switch (sectionType) {
      case 'images':
        return (
          <div className={`px-4 py-4 ${MOBILE_TEXT_COLOR}`}>
            {isLoadingThisImageSection && (
              <div className="flex items-center justify-center h-32">
                <div className={`h-8 w-8 animate-spin border-4 ${BORDER} border-t-transparent`} /> {/* Spinner not rounded */}
                <span className="ml-2">Laddar bilder...</span>
              </div>
            )}
            {!isLoadingThisImageSection && imagesForRow.length === 0 && (
                <em className="text-gray-500">Inga bilder hittades eller kunde inte laddas.</em>
            )}
            {!isLoadingThisImageSection && imagesForRow.length > 0 && (
              // Adjusted grid for desktop image sizes - more columns on larger screens
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2"> 
                {imagesForRow.map(img => (
                  <div
                    key={`${idx}-${img.id}-gallery`}
                    className={`relative aspect-square overflow-hidden cursor-pointer bg-gray-200`}
                    onClick={() => setLightboxUrl(img.url)}
                  >
                    {loadingImagePlaceholders[`${idx}-${img.id}`] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 z-10">
                        <div className={`h-6 w-6 animate-spin border-4 ${BORDER} border-t-transparent`} /> {/* Spinner not rounded */}
                      </div>
                    )}
                    <Image
                      src={img.url} 
                      alt={img.name || row.Titel}
                      layout="fill"
                      objectFit="cover"
                      className={`transition-opacity duration-300 ${loadingImagePlaceholders[`${idx}-${img.id}`] ? 'opacity-0' : 'opacity-100'}`}
                      onLoadingComplete={() => handleImageLoad(idx, img.id)}
                      onError={() => handleImageError(idx, img.id)}
                      sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 16vw, (max-width: 1280px) 12.5vw, 10vw" // Example sizes
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'info':
        return row.Beskrivning ? (
          <div className={`px-4 py-4 break-words whitespace-pre-line ${MOBILE_TEXT_COLOR}`}>{row.Beskrivning}</div>
        ) : null;
      case 'participants':
        return row.Medverkande ? (
          <div className={`px-4 py-4 break-words ${MOBILE_TEXT_COLOR}`}>
            <ul className="list-disc list-inside space-y-1">
              {row.Medverkande.split(',').map((p, i) => (
                <li key={`${idx}-participant-${i}`}>{p.trim()}</li>
              ))}
            </ul>
          </div>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <>
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 cursor-zoom-out"
        >
          <div 
            className="relative max-w-full max-h-full shadow-lg"  // Removed 'rounded' from lightbox container
            onClick={(e) => e.stopPropagation()}
            style={{width: '90vw', height: '90vh'}}
          >
            <Image
              src={lightboxUrl}
              alt="Förhandsvisning"
              layout="fill"
              objectFit="contain"
              className="" // Removed 'rounded' from lightbox Image
            />
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto p-4 w-full max-w-screen-xl mx-auto">
        <table className={`w-full table-fixed border-collapse ${BORDER} font-mono text-gray-800`}>
          <thead>
            <tr>
              <th className={`${BORDER} px-4 py-2 text-left w-1/3`}>Titel</th>
              <th className={`${BORDER} px-4 py-2 text-left w-1/3`}>Info</th>
              <th className={`${BORDER} px-4 py-2 text-left w-1/3`}>Startdatum</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const bg = bgCycle[idx % bgCycle.length];
              const folderUrl = row['Länk utvalda bilder'] || row['Länk alla bilder'] || '';
              const eventUrl = row['Länk till event'] || '';
              const openSectionsForRow = sectionsByRow[idx] || [];
             
              return (
                <React.Fragment key={`event-desktop-${idx}`}>
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
                              Öppna event &#x2197;
                            </a>
                          </li>
                        )}
                      </ul>
                    </td>
                    <td className={`${BORDER} px-4 py-2 align-top`}>{row.Startdatum}</td>
                  </tr>

                  {openSectionsForRow.map(sectionType => (
                    <tr key={`${idx}-${sectionType}-section-desktop`} className={bg}>
                      <td colSpan={3} className={`${BORDER} px-4 py-4`}> {/* Added BORDER here for consistency */}
                        {renderExpandedContent(row, idx, sectionType)} {/* Removed bg from here, it's on <tr> */}
                      </td>
                    </tr>
                  ))}
                  
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

      {/* Mobile Card View */}
      <div className={`md:hidden p-2 space-y-3 ${MOBILE_TEXT_COLOR}`}> {/* Apply base mobile text color */}
        {data.map((row, idx) => {
          const bg = bgCycle[idx % bgCycle.length];
          const folderUrl = row['Länk utvalda bilder'] || row['Länk alla bilder'] || '';
          const eventUrl = row['Länk till event'] || '';
          const openSectionsForRow = sectionsByRow[idx] || [];

          return (
            <div key={`event-mobile-${idx}`} className={`shadow-md overflow-hidden ${bg} ${BORDER}`}> {/* Removed rounded-lg */}
              <div className="p-3">
                <h3 className="text-md font-bold mb-1">{row.Titel}</h3> {/* Inherits MOBILE_TEXT_COLOR */}
                <p className="text-xs"><strong>Start:</strong> {row.Startdatum}</p> {/* Inherits MOBILE_TEXT_COLOR */}
                <p className="text-xs"><strong>Kategori:</strong> {row.Kategori}</p> {/* Inherits MOBILE_TEXT_COLOR */}
                <p className="text-xs mb-2"><strong>Plats:</strong> {row.Plats}</p> {/* Inherits MOBILE_TEXT_COLOR */}
                
                <div className="space-y-1 text-sm">
                    {folderUrl && (
                        <button
                          onClick={() => toggleSection(idx, 'images', folderUrl)}
                          className="block w-full text-left underline cursor-pointer text-blue-600 hover:text-blue-800 py-1"
                          aria-expanded={openSectionsForRow.includes('images')}
                        >
                          {openSectionsForRow.includes('images') ? 'Stäng bilder ↑' : 'Visa bilder ↓'}
                        </button>
                    )}
                    {row.Beskrivning && (
                        <button
                          onClick={() => toggleSection(idx, 'info')}
                          className="block w-full text-left underline cursor-pointer text-blue-600 hover:text-blue-800 py-1"
                          aria-expanded={openSectionsForRow.includes('info')}
                        >
                          {openSectionsForRow.includes('info') ? 'Stäng info ↑' : 'Mer info ↓'}
                        </button>
                    )}
                    {row.Medverkande && (
                        <button
                          onClick={() => toggleSection(idx, 'participants')}
                          className="block w-full text-left underline cursor-pointer text-blue-600 hover:text-blue-800 py-1"
                          aria-expanded={openSectionsForRow.includes('participants')}
                        >
                          {openSectionsForRow.includes('participants') ? 'Stäng medverkande ↑' : 'Medverkande ↓'}
                        </button>
                    )}
                    {eventUrl && (
                        <a
                            href={eventUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-left underline cursor-pointer text-blue-600 hover:text-blue-800 py-1"
                        >
                            Öppna event &#x2197;
                        </a>
                    )}
                </div>
              </div>
              {openSectionsForRow.map(sectionType => 
                <div key={`${idx}-${sectionType}-section-mobile`} className={`${BORDER_MOBILE_SECTION} ${bg}`}>
                  {renderExpandedContent(row, idx, sectionType)} {/* Removed bg from here */}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

const BORDER_MOBILE_SECTION = 'border-t border-blue-600';