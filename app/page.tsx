'use client'

import AsciiGifCanvas from './components/p5/AsciiGifSketch'
import Upcoming from './components/Upcoming'

export default function HomePage() {
  return (
    <div className="-mx-4 md:mx-0 flex flex-col md:flex-row w-full
                    md:fixed md:inset-0 md:overflow-hidden z-10">

      {/* ASCII animation */}
      <div className="basis-full md:basis-1/2 h-screen md:h-full overflow-hidden">
        <AsciiGifCanvas />
      </div>

      {/* Upcoming-events list */}
      <div className="basis-full md:basis-1/2 h-screen md:h-full overflow-hidden">
  <Upcoming />
</div>
    </div>
  )
}
