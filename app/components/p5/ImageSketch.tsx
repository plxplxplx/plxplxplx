'use client'

import p5 from 'p5'
import P5Wrapper from './P5Wrapper' // Assuming P5Wrapper is in the same directory

const IMAGE_PATH_DESKTOP = '/Image.png'
const IMAGE_PATH_MOBILE = '/ImageSmall.png'

const BreathingImageSketch = (p: p5) => {
  let img: p5.Image | null = null
  let waveBuffer: p5.Graphics
  let isSmallImage = false
  let canvasRenderer: p5.Renderer // ✨ FIX: Variable to hold the canvas

  const getParentSize = () => {
    // ✨ FIX: Access the canvas element via the renderer's .elt property
    const parent = (canvasRenderer?.elt.parentElement)
    return parent ? [parent.clientWidth, parent.clientHeight] : [p.windowWidth, p.windowHeight]
  }

  const setupCanvasAndBuffer = () => {
    const [w, h] = getParentSize()
    p.resizeCanvas(w, h)
    waveBuffer = p.createGraphics(w, h)
    waveBuffer.imageMode(p.CENTER)
    waveBuffer.smooth()
  }

  p.setup = () => {
    const [w, h] = getParentSize()
    // ✨ FIX: Store the canvas renderer when creating it
    canvasRenderer = p.createCanvas(w, h)
    p.imageMode(p.CENTER)
    p.smooth()

    setupCanvasAndBuffer()

    isSmallImage = p.windowWidth < 768
    const path = isSmallImage ? IMAGE_PATH_MOBILE : IMAGE_PATH_DESKTOP

    p.loadImage(path, (loadedImage) => {
      img = loadedImage
    })
  }

  p.draw = () => {
    if (!img) return

    const t = p.frameCount * 0.01
    const scaleBase = isSmallImage ? 0.55 : 1.0
    const scaleAmplitude = isSmallImage ? 0.01 : 0.02
    const scaleFactor = scaleBase + Math.sin(t) * scaleAmplitude

    waveBuffer.push()
    waveBuffer.clear()
    waveBuffer.background(0)
    waveBuffer.translate(waveBuffer.width / 2, waveBuffer.height / 2)
    waveBuffer.scale(scaleFactor)
    waveBuffer.image(img, 0, 0)
    waveBuffer.pop()

    p.background(0)

    const cols = 80
    const sliceW = Math.ceil(p.width / cols)

    for (let i = 0; i < cols; i++) {
      const x = i * sliceW
      const wave = Math.sin(t + i * 0.2) * 5
      const sw = Math.min(sliceW + 1, waveBuffer.width - x)

      if (sw <= 0) continue;

      p.copy(
        waveBuffer,
        x, 0,
        sw, p.height,
        x + wave, 0,
        sw, p.height
      )
    }
  }

  p.windowResized = () => {
    setupCanvasAndBuffer()
    const wasSmall = isSmallImage
    isSmallImage = p.windowWidth < 768

    if (wasSmall !== isSmallImage) {
      const path = isSmallImage ? IMAGE_PATH_MOBILE : IMAGE_PATH_DESKTOP
      p.loadImage(path, (loadedImage) => {
        img = loadedImage
      })
    }
  }
}

// This is the actual component being exported and used in HomePage
export default function ImageSketch() {
  return (
    <P5Wrapper
      sketch={BreathingImageSketch}
      style={{ width: '100%', height: '100%' }}
    />
  )
}