'use client'

import ImageSketch from './components/p5/ImageSketch'

export default function HomePage() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Background Sketch */}
      <div className="absolute inset-0 z-0">
        <ImageSketch />
      </div>
    </div>
  )
}
