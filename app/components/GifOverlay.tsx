'use client'

/**
 * A component that displays the PLX GIF with a border and photo credit overlaid on top.
 */
export default function GifOverlay() {
  return (
    // This container is set to relative so we can position the text inside it.
    <div className="relative w-full h-full">

      {/* A small black border is applied directly to the image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/PLX_GIF.gif"
        alt="PLX animation"
        className="w-full h-full object-cover border-4 border-black"
      />

      {/* ✨ FIX: Positioned the credit at the bottom-right with sufficient spacing. */}
      <div className="absolute md:bottom-20 bottom-8 right-4 text-xs text-[#FDFD96] font-sans z-10">
        photo:{" "}
        <a
          href="https://www.instagram.com/david_neman/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white transition-colors"
        >
          David Neman
        </a>
      </div>

    </div>
  )
}