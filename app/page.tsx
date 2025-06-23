'use client'

import { useState } from 'react'
import ImageSketch from './components/p5/ImageSketch'
import Upcoming from './components/Upcoming'

export default function HomePage() {
  const [showUpcoming, setShowUpcoming] = useState(true)

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
      {/* Background Sketch */}
      <div className="fixed inset-0 z-0">
        <ImageSketch />
      </div>

      {/* Toggle button (only visible when Upcoming is closed) */}
      {!showUpcoming && (
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={() => setShowUpcoming(true)}
            className="px-4 py-2 bg-[#91A878] text-black font-bold rounded hover:bg-[#A4C57C] transition"
          >
            Visa Evenemang
          </button>
        </div>
      )}

      {/* Upcoming Events */}
      {showUpcoming && (
        <div className="relative z-10 w-full h-full overflow-y-auto p-4">
          <div className="max-w-screen-lg mx-auto h-full flex items-center justify-center">
            <Upcoming onClose={() => setShowUpcoming(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
