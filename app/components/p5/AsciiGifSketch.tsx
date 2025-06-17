'use client'

import type p5 from 'p5'
import P5Wrapper from './P5Wrapper'

/* darkest → brightest (flipped for contrast) */
const RAMP = '%*$+-=:. '

/* pixel-density grid + font size */
const DESKTOP_PIXELS = { w: 160, h: 120 }
const MOBILE_PIXELS  = { w: 80,  h: 100 }
const DESKTOP_FONT   = 8
const MOBILE_FONT    = 6

/* brand-colour cycle */
const GLYPH_COLORS: [number, number, number][] = [
  [234, 88, 12],   // orange-600
  [30, 58, 138],   // blue-800
  [100, 116, 139], // slate-600
]

/** p5.Image extended with optional GIF metadata */
interface GifImage extends p5.Image {
  gifProperties?: { numFrames: number }
}

const AsciiGifSketch = (p: p5) => {
  let gif: GifImage | null = null
  let gfx!: p5.Graphics
  let cellW = 6, cellH = 6, cols = 0, rows = 0

  /* width helper: half-width desktop, full-width mobile */
  const colWidth = () =>
    p.windowWidth < 768 ? p.windowWidth : p.windowWidth / 2

  const fit = () => {
    if (!gif) return
    const mobile = p.windowWidth < 768
    const target = mobile ? MOBILE_PIXELS : DESKTOP_PIXELS

    gfx?.remove?.()
    gfx = p.createGraphics(target.w, target.h)
    gfx.pixelDensity(1)

    p.textFont('monospace', mobile ? MOBILE_FONT : DESKTOP_FONT)
    p.textAlign(p.CENTER, p.CENTER)

    cols  = gfx.width
    rows  = gfx.height
    cellW = p.width  / cols
    cellH = p.height / rows
  }

  /* p5 lifecycle */
  p.setup = () => {
    p.createCanvas(colWidth(), p.windowHeight)
    p.pixelDensity(1)

    p.loadImage('/anim4.gif', (img) => {
      gif = img as GifImage
      fit()
    })
  }

  p.windowResized = () => {
    p.resizeCanvas(colWidth(), p.windowHeight)
    fit()
  }

  p.draw = () => {
    if (!gif) return

    const frames = gif.gifProperties?.numFrames ?? 1
    if (frames > 1) gif.setFrame(p.frameCount % frames)

    gfx.background(255)
    gfx.image(gif, 0, 0, gfx.width, gfx.height)
    gfx.loadPixels()

    p.background(255)
    p.noStroke()

    const maxI = RAMP.length - 1

    for (let y = 0; y < rows; y++) {
      const [r, g, b] = GLYPH_COLORS[y % GLYPH_COLORS.length] // ← destructure
      p.fill(r, g, b)

      for (let x = 0; x < cols; x++) {
        const idx = 4 * (x + y * cols)
        const lum =
          0.299 * gfx.pixels[idx] +
          0.587 * gfx.pixels[idx + 1] +
          0.114 * gfx.pixels[idx + 2]

        const glyph = RAMP[Math.floor((lum / 255) * maxI)]
        p.text(glyph, (x + 0.5) * cellW, (y + 0.5) * cellH)
      }
    }
  }
}

export default function AsciiGifCanvas() {
  return (
    <P5Wrapper
      sketch={AsciiGifSketch}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
