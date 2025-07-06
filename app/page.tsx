'use client'

import { useState } from 'react'
import ImageSketch from './components/p5/ImageSketch'
import Upcoming from './components/Upcoming'
import GifOverlay from './components/GifOverlay' // Import the component

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
              <Upcoming onClose={() => setShowUpcoming(false)} />
            </div>
          </div>
        )}

        {/* Toggle button (only when Upcoming hidden) */}
        {!showUpcoming && (
          <button
            onClick={() => setShowUpcoming(true)}
            className="absolute top-4 left-4 z-20
                       px-4 py-2 bg-[#91A878] text-black font-bold rounded
                       hover:bg-[#A4C57C] transition"
          >
            Visa&nbsp;Evenemang
          </button>
        )}
      </div>

      {/* ────────── Bottom (Mobile) / Right (Desktop): GIF ─────────── */}
      {/*
        ✨ FIX: Re-added a height class (`h-auto`) for mobile so the container
        grows to fit the entire GifOverlay component, making the bottom visible.
      */}
      <div className="relative w-full h-auto md:h-full md:w-1/3 flex-shrink-0">
        <GifOverlay />
      </div>
    </div>
  )
}