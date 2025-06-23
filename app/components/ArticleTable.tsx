'use client'

import { ArticleRow } from '../types/article'

type Props = {
  articles: ArticleRow[]
}

export default function ArticleTable({ articles }: Props) {
  if (!articles.length) {
    return (
      <p className="p-4 text-sm font-mono text-[#91A878] bg-black">
        Inga artiklar att visa.
      </p>
    )
  }

  const bgCycle = ['bg-[#1E1E1E]/90', 'bg-[#383838]/90'] // Strong contrast

  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-2 sm:px-4">
      <div className="relative w-full max-w-screen-lg bg-[#1E1E1E]/80 shadow-lg overflow-hidden p-6 space-y-4">
        {articles.map((article, i) => (
          <div
            key={i}
            className={`border border-[#91A878] p-4 font-mono text-base text-[#FDFD96] space-y-2 ${bgCycle[i % bgCycle.length]}`}
          >
            <div className="text-lg sm:text-xl font-bold">{article.Titel}</div>

            <div className="text-sm sm:text-base text-[#CCCCCC] italic">
              {article.Datum} · {article.Medium}
            </div>

            {article.Sammanfattning && (
              <p className="text-sm sm:text-base text-[#EDEDED] whitespace-pre-line">
                {article.Sammanfattning}
              </p>
            )}

            {article.Länk?.startsWith('http') && (
              <div className="pt-1">
                <a
                  href={article.Länk}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FDFD96] hover:underline font-semibold text-sm sm:text-base"
                >
                  Läs artikel →
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
