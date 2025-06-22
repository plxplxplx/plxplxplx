'use client'

import p5 from 'p5'
import P5Wrapper from './P5Wrapper'

const IMAGE_PATH = '/Image.png'

const BreathingImageSketch = (p: p5) => {
  let img: p5.Image | null = null
  let waveBuffer: p5.Graphics

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    p.imageMode(p.CENTER)
    p.smooth()

    waveBuffer = p.createGraphics(p.windowWidth, p.windowHeight)
    waveBuffer.imageMode(p.CENTER)
    waveBuffer.smooth()

    p.loadImage(IMAGE_PATH, (loadedImage) => {
      img = loadedImage
    })
  }

  p.draw = () => {
    if (!img) return

    const t = p.frameCount * 0.01
    const scaleFactor = 1 + Math.sin(t) * 0.02

    // Draw scaled image to buffer with black background
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
    p.resizeCanvas(p.windowWidth, p.windowHeight)
    waveBuffer = p.createGraphics(p.windowWidth, p.windowHeight)
    waveBuffer.imageMode(p.CENTER)
    waveBuffer.smooth()
  }
}

export default function BreathingImageCanvas() {
  return (
    <P5Wrapper
      sketch={BreathingImageSketch}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
