"use client";

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
  const bgCycle = ['bg-[#1E1E1E]/90', 'bg-[#383838]/90'] as const;
  const TEXT_COLOR = 'text-[#FDFD96]';
  const LINK_COLOR = 'text-white hover:underline';
  const EVENT_LINK = 'text-[#FDFD96] hover:underline text-sm';

  const [sectionsByRow, setSectionsByRow] = useState<Record<number, Section[]>>({});
  const [imagesByRow, setImagesByRow] = useState<Record<number, ImageEntry[]>>({});
  const [loadingImg, setLoadingImg] = useState<Record<string, boolean>>({});
  const [loadingSect, setLoadingSect] = useState<Record<number, boolean>>({});
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  async function toggleSection(
    idx: number,
    section: Section,
    folderUrl?: string
  ) {
    const current = sectionsByRow[idx] || [];
    const open = current.includes(section);
    const next = open
      ? current.filter((s) => s !== section)
      : [section, ...current.filter((s) => s !== section)];

    if (!open && section === 'images' && folderUrl && !imagesByRow[idx]) {
      const match = folderUrl.match(/\/folders\/([A-Za-z0-9_-]+)/);
      if (match?.[1]) {
        setLoadingSect((p) => ({ ...p, [idx]: true }));
        try {
          const res = await fetch(`/api/images?folderId=${match[1]}`);
          const json = await res.json();
          if (Array.isArray(json.images)) {
            setImagesByRow((r) => ({ ...r, [idx]: json.images }));
            setLoadingImg((prev) => {
              const obj = { ...prev };
              json.images.forEach((img: ImageEntry) => {
                obj[`${idx}-${img.id}`] = true;
              });
              return obj;
            });
          }
        } catch {
          setImagesByRow((r) => ({ ...r, [idx]: [] }));
        } finally {
          setLoadingSect((p) => ({ ...p, [idx]: false }));
        }
      }
    }
    setSectionsByRow((p) => ({ ...p, [idx]: next }));
  }

  const doneLoad = (r: number, id: string) =>
    setLoadingImg((p) => ({ ...p, [`${r}-${id}`]: false }));

  function expanded(row: EventRow, idx: number, type: Section) {
    const images = imagesByRow[idx] || [];
    const loading = loadingSect[idx];

    switch (type) {
      case 'images':
        return (
          <>
            {loading ? (
              <div className="flex items-center justify-center h-32 text-[#EDEDED]">
                <div className="w-6 h-6 border-2 border-[#FDFD96] border-t-transparent rounded-full animate-spin" />
                <span className="ml-2">Laddar bilder…</span>
              </div>
            ) : images.length === 0 ? (
              <em className="text-gray-400">Inga bilder hittades.</em>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                {images.map((img) => (
                  <div
                    key={`${idx}-${img.id}`}
                    className="relative aspect-square overflow-hidden cursor-pointer bg-gray-700"
                    onClick={() => setLightboxUrl(img.url)}
                  >
                    {loadingImg[`${idx}-${img.id}`] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                        <div className="w-6 h-6 border-2 border-[#FDFD96] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    <Image
                      src={img.url}
                      alt={img.name || row.Titel}
                      fill
                      className={`object-cover transition-opacity duration-300 ${
                        loadingImg[`${idx}-${img.id}`] ? 'opacity-0' : 'opacity-100'
                      }`}
                      onLoadingComplete={() => doneLoad(idx, img.id)}
                      onError={() => doneLoad(idx, img.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        );
      case 'info':
        return row.Beskrivning ? (
          <div className="whitespace-pre-line text-[#EDEDED]">{row.Beskrivning}</div>
        ) : null;
      case 'participants':
        return row.Medverkande ? (
          <div className="text-[#EDEDED]">
            <ul className="list-disc list-inside space-y-1">
              {row.Medverkande.split(',').map((p, i) => (
                <li key={i}>{p.trim()}</li>
              ))}
            </ul>
          </div>
        ) : null;
    }
  }

  if (!data.length) {
    return <p className={`p-4 ${TEXT_COLOR}`}>Inga evenemang att visa.</p>;
  }

  return (
    <div className="flex flex-col items-center w-full h-full px-2 sm:px-4">
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 cursor-zoom-out"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative w-[90vw] h-[90vh]">
            <Image src={lightboxUrl} alt="Förhandsvisning" fill className="object-contain" />
          </div>
        </div>
      )}

      <div className="w-full max-w-screen-md space-y-4 bg-[#1E1E1E]/80 p-4 shadow-lg">
        {data.map((row, idx) => {
          const bg = bgCycle[idx % bgCycle.length];
          const folder = row['Länk utvalda bilder'] || row['Länk alla bilder'] || '';
          const event = row['Länk till event'] || '';
          const open = sectionsByRow[idx] || [];

          return (
            <div
              key={idx}
              className={`px-4 pt-4 pb-6 font-mono text-base ${bg} ${TEXT_COLOR} ${BORDER}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-[60%_40%] gap-x-6 gap-y-2">
                <div>
                  <div className="text-lg sm:text-xl font-bold mb-1">{row.Titel}</div>
                  <div className="text-sm sm:text-base italic text-[#CCCCCC] mb-1">
                    {row.Startdatum} · {row.Plats} · {row.Kategori}
                  </div>
                  {event && (
                    <div className="mb-2">
                      <a
                        href={event}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${EVENT_LINK}`}
                      >
                        Öppna event →
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <ul className="space-y-1 text-white">
                    {folder && (
                      <li>
                        <button
                          onClick={() => toggleSection(idx, 'images', folder)}
                          className={`underline ${LINK_COLOR}`}
                        >
                          {open.includes('images') ? 'Stäng bilder ↑' : 'Visa bilder ↓'}
                        </button>
                      </li>
                    )}
                    {row.Beskrivning && (
                      <li>
                        <button
                          onClick={() => toggleSection(idx, 'info')}
                          className={`underline ${LINK_COLOR}`}
                        >
                          {open.includes('info') ? 'Stäng info ↑' : 'Mer info ↓'}
                        </button>
                      </li>
                    )}
                    {row.Medverkande && (
                      <li>
                        <button
                          onClick={() => toggleSection(idx, 'participants')}
                          className={`underline ${LINK_COLOR}`}
                        >
                          {open.includes('participants') ? 'Stäng medverkande ↑' : 'Medverkande ↓'}
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {open.map((sec) => (
                <div key={sec} className="-mx-4 mt-4 border-t border-[#91A878]">
                  <div className="px-4 py-4">{expanded(row, idx, sec)}</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
