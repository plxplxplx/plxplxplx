import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

import Navbar from './components/Navbar'
import Footer from './components/Footer'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'PLX Site',
  description: 'Home / Media / Event',
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

        {/* This is the corrected <main> element. 
          The horizontal padding 'px-4' has been removed.
          'w-full' has been added to ensure it correctly fills the available width.
        */}
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
