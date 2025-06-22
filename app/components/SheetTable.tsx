'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { EventRow } from '../types/event';

type Props = { data: EventRow[] };
type ImageEntry = {
  id: string;
  name: string;
  url: string;
};
type Section = 'images' | 'info' | 'participants';

export default function SheetTable({ data }: Props) {
  const BORDER = 'border border-[#91A878]';
  const bgCycle = ['bg-[#2A2A2A]', 'bg-[#3A3A3A]'];
  const TEXT_COLOR = 'text-[#FDFD96]';
  const LINK_COLOR = 'text-[#A7E6A7] hover:text-[#C9F4C9]';

  const [sectionsByRow, setSectionsByRow] = useState<Record<number, Section[]>>({});
  const [imagesByRow, setImagesByRow] = useState<Record<number, ImageEntry[]>>({});
  const [loadingImagePlaceholders, setLoadingImagePlaceholders] = useState<Record<string, boolean>>({});
  const [loadingImageSection, setLoadingImageSection] = useState<Record<number, boolean>>({});
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const toggleSection = async (rowIdx: number, section: Section, folderUrl?: string) => {
    const currentSections = sectionsByRow[rowIdx] || [];
    const isSectionOpen = currentSections.includes(section);

    const nextSections: Section[] = isSectionOpen
      ? currentSections.filter(s => s !== section)
      : [section, ...currentSections.filter(s => s !== section)];

    if (!isSectionOpen && section === 'images' && folderUrl && !imagesByRow[rowIdx]) {
      const match = folderUrl.match(/\/folders\/([A-Za-z0-9_-]+)/);
      if (match && match[1]) {
        const folderId = match[1];
        setLoadingImageSection(prev => ({ ...prev, [rowIdx]: true }));
        try {
          const res = await fetch(`/api/images?folderId=${folderId}`);
          const json = await res.json();
          if (json.images && Array.isArray(json.images)) {
            setImagesByRow(r => ({ ...r, [rowIdx]: json.images }));
            setLoadingImagePlaceholders(prev => {
              const newStates = { ...prev };
              json.images.forEach((img: ImageEntry) => {
                newStates[`${rowIdx}-${img.id}`] = true;
              });
              return newStates;
            });
          } else {
            setImagesByRow(r => ({ ...r, [rowIdx]: [] }));
          }
        } catch {
          setImagesByRow(r => ({ ...r, [rowIdx]: [] }));
        } finally {
          setLoadingImageSection(prev => ({ ...prev, [rowIdx]: false }));
        }
      }
    }
    setSectionsByRow(prev => ({ ...prev, [rowIdx]: nextSections }));
  };

  const handleImageLoad = (rowIdx: number, imgId: string) => {
    setLoadingImagePlaceholders(prev => ({ ...prev, [`${rowIdx}-${imgId}`]: false }));
  };

  const handleImageError = (rowIdx: number, imgId: string) => {
    setLoadingImagePlaceholders(prev => ({ ...prev, [`${rowIdx}-${imgId}`]: false }));
  };

  if (!data.length) return <p className={`p-4 ${TEXT_COLOR}`}>Inga evenemang att visa.</p>;

  const renderExpandedContent = (row: EventRow, idx: number, sectionType: Section) => {
    const imagesForRow = imagesByRow[idx] || [];
    const isLoading = loadingImageSection[idx];

    switch (sectionType) {
      case 'images':
        return (
          <div className={`px-4 py-4 ${TEXT_COLOR}`}>
            {isLoading && <div className="flex items-center justify-center h-32">
              <div className={`h-8 w-8 animate-spin border-4 ${BORDER} border-t-transparent`} />
              <span className="ml-2">Laddar bilder...</span>
            </div>}
            {!isLoading && imagesForRow.length === 0 && <em className="text-gray-400">Inga bilder hittades eller kunde inte laddas.</em>}
            {!isLoading && imagesForRow.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                {imagesForRow.map(img => (
                  <div
                    key={`${idx}-${img.id}-gallery`}
                    className="relative aspect-square overflow-hidden cursor-pointer bg-gray-700"
                    onClick={() => setLightboxUrl(img.url)}
                  >
                    {loadingImagePlaceholders[`${idx}-${img.id}`] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                        <div className={`h-6 w-6 animate-spin border-4 ${BORDER} border-t-transparent`} />
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
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'info':
        return row.Beskrivning ? <div className={`px-4 py-4 break-words whitespace-pre-line ${TEXT_COLOR}`}>{row.Beskrivning}</div> : null;
      case 'participants':
        return row.Medverkande ? <div className={`px-4 py-4 break-words ${TEXT_COLOR}`}>
          <ul className="list-disc list-inside space-y-1">
            {row.Medverkande.split(',').map((p, i) => <li key={`${idx}-participant-${i}`}>{p.trim()}</li>)}
          </ul>
        </div> : null;
      default:
        return null;
    }
  };

  return (
    <>
      {lightboxUrl && (
        <div onClick={() => setLightboxUrl(null)} className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 cursor-zoom-out">
          <div className="relative max-w-full max-h-full shadow-lg" style={{ width: '90vw', height: '90vh' }}>
            <Image src={lightboxUrl} alt="Förhandsvisning" layout="fill" objectFit="contain" />
          </div>
        </div>
      )}

      <div className="hidden md:block overflow-x-auto p-4 w-full max-w-screen-xl mx-auto">
        <table className={`w-full table-fixed border-collapse ${BORDER} font-mono ${TEXT_COLOR}`}>
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
                        {folderUrl && <li><button onClick={() => toggleSection(idx, 'images', folderUrl)} className={`underline cursor-pointer ${LINK_COLOR}`}>{openSectionsForRow.includes('images') ? 'Stäng bilder ↑' : 'Visa bilder ↓'}</button></li>}
                        {row.Beskrivning && <li><button onClick={() => toggleSection(idx, 'info')} className={`underline cursor-pointer ${LINK_COLOR}`}>{openSectionsForRow.includes('info') ? 'Stäng info ↑' : 'Mer info ↓'}</button></li>}
                        {row.Medverkande && <li><button onClick={() => toggleSection(idx, 'participants')} className={`underline cursor-pointer ${LINK_COLOR}`}>{openSectionsForRow.includes('participants') ? 'Stäng medverkande ↑' : 'Medverkande ↓'}</button></li>}
                        {eventUrl && <li><a href={eventUrl} target="_blank" rel="noopener noreferrer" className={`underline cursor-pointer ${LINK_COLOR}`}>Öppna event ↗</a></li>}
                      </ul>
                    </td>
                    <td className={`${BORDER} px-4 py-2 align-top`}>{row.Startdatum}</td>
                  </tr>
                  {openSectionsForRow.map(sectionType => (
                    <tr key={`${idx}-${sectionType}-section-desktop`} className={bg}>
                      <td colSpan={3} className={`${BORDER} px-4 py-4`}>
                        {renderExpandedContent(row, idx, sectionType)}
                      </td>
                    </tr>
                  ))}
                  {idx < data.length - 1 && <tr><td colSpan={3} className="h-4 bg-black border-none p-0" /></tr>}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
