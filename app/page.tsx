'use client'

import { useState } from 'react'
import ImageSketch from './components/p5/ImageSketch'
import Upcoming from './components/Upcoming'
import GifOverlay from './components/GifOverlay'

export default function HomePage() {
  const [showUpcoming, setShowUpcoming] = useState(true)

  return (
    <div className="flex flex-col md:fixed md:inset-0 md:flex-row bg-black md:overflow-hidden">

      {/* ─────────── Top (Mobile) / Left (Desktop): Canvas ─────────── */}
      <div className="relative w-full h-[85vh] md:h-full md:w-2/3 flex-shrink-0 min-w-0">

        {/* background sketch */}
        <ImageSketch />

        {/* Upcoming overlay */}
        {showUpcoming && (
          <div className="absolute inset-0 z-10 overflow-y-auto p-4">
            <div className="h-full flex items-center justify-center">
              <Upcoming
                onClose={() => setShowUpcoming(false)}
                // Hide popup automatically when there are no events
                onEmpty={() => setShowUpcoming(false)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ────────── Bottom (Mobile) / Right (Desktop): GIF ─────────── */}
      <div className="relative w-full h-auto md:h-full md:w-1/3 flex-shrink-0">
        <GifOverlay />
      </div>
    </div>
  )
}
