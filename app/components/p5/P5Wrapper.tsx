'use client'

import React, { useEffect, useRef } from 'react'
import type p5 from 'p5'

interface P5WrapperProps {
  sketch: (p: p5) => void
  style?: React.CSSProperties
}

/** Robust wrapper that loads p5 lazily and cleans up on HMR/unmount. */
const P5Wrapper: React.FC<P5WrapperProps> = ({ sketch, style }) => {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    let instance: p5 | null = null

    import('p5').then(({ default: P5 }) => {
      if (cancelled || !host.current) return
      instance = new P5(sketch, host.current)
    })

    return () => {
      cancelled = true
      instance?.remove()
    }
  }, [sketch])

  return <div ref={host} style={style} />
}

export default React.memo(P5Wrapper)
