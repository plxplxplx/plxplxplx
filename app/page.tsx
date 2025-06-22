'use client'

import { useEffect, useState } from 'react'
import Upcoming from './components/Upcoming'
import ImageSketch from './components/p5/ImageSketch'

export default function HomePage() {
  const [showOverlay, setShowOverlay] = useState(true)

  useEffect(() => {
    // Optional: Auto-close after delay (e.g., 10 seconds)
    // const timer = setTimeout(() => setShowOverlay(false), 10000)
    // return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col md:flex-row w-full md:fixed md:inset-0 md:overflow-hidden z-10">
      <div className="basis-full h-screen md:h-full overflow-hidden pointer-events-none md:pointer-events-auto">
        <ImageSketch />
      </div>

      {showOverlay && (
        <div className="fixed inset-0 bg-black/90 text-[#FDFD96] z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-full overflow-y-auto bg-[#1E1E1E] border border-[#91A878] shadow-xl rounded-lg p-6">
            <button
              onClick={() => setShowOverlay(false)}
              className="absolute top-4 right-4 text-[#FDFD96] text-2xl font-bold hover:text-[#ffffff]"
              aria-label="Stäng"
            >
              &times;
            </button>
            <Upcoming />
          </div>
        </div>
      )}
    </div>
  )
}
