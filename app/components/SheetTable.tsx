'use client'
// Removed useEffect from here as it was unused
import React, { useState } from 'react' 
import Image from 'next/image' // Import next/image
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
  const bgCycle = ['bg-blue-50', 'bg-pink-50', 'bg-gray-100']

  const [sectionsByRow, setSectionsByRow] = useState<Record<number, Section[]>>({})
  const [imagesByRow, setImagesByRow] = useState<Record<number, ImageEntry[]>>({})
  const [loadingImagePlaceholders, setLoadingImagePlaceholders] = useState<Record<string, boolean>>({})
  const [loadingImageSection, setLoadingImageSection] = useState<Record<number, boolean>>({})
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  // State for lightbox image dimensions - useful for next/image with layout="responsive" or "intrinsic"
  // For layout="fill" this is less critical if parent constrains size.
  // const [lightboxImageSize, setLightboxImageSize] = useState<{width: number, height: number} | null>(null);


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
          console.warn("Could not extract folderId from URL:", folderUrl);
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

  return (
    <>
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 cursor-zoom-out"
        >
          {/* Using a container for next/image with layout="fill" or for intrinsic sizing */}
          <div 
            className="relative max-w-full max-h-full" 
            onClick={(e) => e.stopPropagation()} // Prevent closing lightbox when clicking on image itself
            style={{width: '90vw', height: '90vh'}} // Example constraint, adjust as needed
          >
            <Image
              src={lightboxUrl}
              alt="Förhandsvisning"
              layout="fill" // Fills the parent container
              objectFit="contain" // Ensures aspect ratio is maintained within the bounds
              className="rounded shadow-lg" // Apply styling to the Image component
              // To get width/height for other layouts, you might need to load the image first
              // or have them in your data. For now, layout="fill" is good for a lightbox.
            />
          </div>
        </div>
      )}

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
                              Öppna event &#x2197;
                            </a>
                          </li>
                        )}
                      </ul>
                    </td>
                    <td className={`${BORDER} px-4 py-2 align-top`}>{row.Startdatum}</td>
                  </tr>

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
                                    className={`relative aspect-square overflow-hidden cursor-pointer bg-gray-200`} // Removed BORDER for cleaner image look
                                    onClick={() => setLightboxUrl(img.url)}
                                  >
                                    {loadingImagePlaceholders[`${idx}-${img.id}`] && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 z-10">
                                        <div className={`h-6 w-6 animate-spin rounded-full ${BORDER} border-t-transparent`} />
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
                                      // sizes attribute can optimize image selection if you have different layouts
                                      // e.g., sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16.6vw"
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
                    return null;
                  })}

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
    </>
  );
}