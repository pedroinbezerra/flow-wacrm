"use client"

import { useEffect, useState, type RefObject } from 'react'

/**
 * Tracks an element's rendered width in CSS pixels.
 *
 * Charts here draw into an SVG `viewBox`. When the viewBox aspect ratio
 * doesn't match the container's, the default `preserveAspectRatio`
 * ("xMidYMid meet") scales the drawing down to fit and centres it —
 * which showed up as hundreds of pixels of dead space on either side of
 * a full-width chart card. Feeding the measured width back as the
 * viewBox width makes one SVG unit equal one CSS pixel: no letterboxing,
 * no scaling, and text renders at its true size.
 *
 * Returns 0 until the first measurement lands; callers skip rendering
 * until then rather than drawing at a wrong size and snapping.
 */
export function useElementWidth(ref: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Seed synchronously so the first paint after mount is already
    // correct, instead of waiting a frame for the observer to fire.
    setWidth(el.getBoundingClientRect().width)

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width)
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])

  return width
}
