import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Load fonts with CSS variables
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// Enhanced metadata with SEO and social tags
export const metadata: Metadata = {
  title: 'The PLX Society',
  description:
    'PLX is a Malmö-based art and music collective creating immersive cultural experiences—from legendary festivals to experimental art shows.',
  keywords: [
    'PLX',
    'PLX Tjärö',
    'art collective',
    'music collective',
    'Malmö art',
    'immersive culture',
    'Sweden festival',
    'live-action roleplay',
    'experimental media',
    'kulturförening',
  ],
  metadataBase: new URL('https://plxplxplx.com'),
  openGraph: {
    title: 'PLX – Art and Music Collective in Malmö',
    description:
      'Join PLX in creating immersive cultural experiences across art, music, and play. From festivals to experimental media labs and LARP, we blur the lines between artist and audience.',
    url: 'https://plxplxplx.com',
    siteName: 'PLX',
    images: [
      {
        url: 'https://plxplxplx.com/Image.png',
        width: 1200,
        height: 630,
        alt: 'PLX – Tjärö Festival and Cultural Events',
      },
    ],
    type: 'website',
    locale: 'en_SE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PLX – Malmö-Based Art and Music Collective',
    description:
      'Explore immersive cultural experiences from PLX, including the legendary Tjärö festival and experimental live-action events.',
    images: ['https://plxplxplx.com/Image.png'],
  },
  alternates: {
    canonical: 'https://plxplxplx.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable}
          antialiased flex flex-col min-h-screen
          relative bg-black text-white
        `}
      >
        <Navbar />

        <main
          style={{ paddingTop: 'var(--nav-h)' }}
          className="flex-grow w-full max-w-screen-xl mx-auto pb-10 relative z-10"
        >
          {children}
        </main>

        <footer className="relative z-10">
          <Footer />
        </footer>
      </body>
    </html>
  )
}
