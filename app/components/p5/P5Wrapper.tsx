'use client'

import React, { useEffect, useRef } from 'react'
import type p5 from 'p5'

interface P5WrapperProps {
  sketch: (p: p5) => void
  style?: React.CSSProperties
}

const P5Wrapper: React.FC<P5WrapperProps> = ({ sketch, style }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const p5InstanceRef = useRef<p5 | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadP5 = async () => {
      const { default: P5 } = await import('p5')

      if (!cancelled && containerRef.current) {
        p5InstanceRef.current = new P5(sketch, containerRef.current)
      }
    }

    loadP5()

    return () => {
      cancelled = true
      p5InstanceRef.current?.remove()
      p5InstanceRef.current = null
    }
  }, [sketch])

  return <div ref={containerRef} style={style} />
}

export default React.memo(P5Wrapper)
