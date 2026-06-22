import type { Metadata } from 'next'

const title = 'Ärtsopps-TV – Ärtsoppeseglingen live'
const description =
  'Följ Ärtsoppeseglingen live från Näsviken fredag 17 juli kl 09.30 — segling, reportage, studio och framträdanden. En produktion av PLX, kostnadsfritt online.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: 'https://plxplxplx.com/tv',
    siteName: 'PLX',
    images: [
      {
        url: '/og-tv.jpg',
        width: 1200,
        height: 630,
        alt: 'Ärtsopps-TV',
      },
    ],
    type: 'website',
    locale: 'sv_SE',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og-tv.jpg'],
  },
  alternates: {
    canonical: 'https://plxplxplx.com/tv',
  },
}

export default function TvLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
