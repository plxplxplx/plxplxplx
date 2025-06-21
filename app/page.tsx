'use client'

import AsciiGifCanvas from './components/p5/AsciiGifSketch'
import Upcoming from './components/Upcoming'

export default function HomePage() {
  return (
    // This is the corrected root div for the homepage.
    // The negative margins '-mx-4' and 'md:mx-0' have been removed.
    <div
      className="flex flex-col md:flex-row w-full
                 md:fixed md:inset-0 md:overflow-hidden z-10"
    >
      {/* ASCII animation */}
      <div className="basis-full md:basis-1/2 h-screen md:h-full overflow-hidden pointer-events-none md:pointer-events-auto">
        <AsciiGifCanvas />
      </div>

      {/* Upcoming-events list */}
      {/* - 'py-8' adds vertical padding (top and bottom) on mobile.
        - 'md:py-0' removes that padding on medium screens and larger, 
          restoring the full-height scrollable container for the desktop layout.
      */}
      <div className="basis-full md:basis-1/2 h-auto md:h-full overflow-y-auto py-8 md:py-0">
        <Upcoming />
      </div>
    </div>
  )
}
