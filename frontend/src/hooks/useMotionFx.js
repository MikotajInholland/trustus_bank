/**
 * @summary Lightweight tilt and magnetic hover hooks for dashboard micro-interactions.
 * @author Wesley, Darlington, Mikotaj (shared)
 */
import { useEffect, useRef } from 'react'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Subtle 3D tilt toward the cursor (max ~7°). */
export function useCardTilt(maxTilt = 7) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node || prefersReducedMotion()) return undefined

    function onMove(event) {
      const rect = node.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      const rotateY = x * maxTilt * 2
      const rotateX = -y * maxTilt * 2
      node.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`
    }

    function onLeave() {
      node.style.transform = ''
    }

    node.addEventListener('mousemove', onMove)
    node.addEventListener('mouseleave', onLeave)
    return () => {
      node.removeEventListener('mousemove', onMove)
      node.removeEventListener('mouseleave', onLeave)
      node.style.transform = ''
    }
  }, [maxTilt])

  return ref
}

/** Gently pulls an element toward the cursor within a radius. */
export function useMagnetic(strength = 0.22, radius = 96) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node || prefersReducedMotion()) return undefined

    function onMove(event) {
      const rect = node.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = event.clientX - cx
      const dy = event.clientY - cy
      const dist = Math.hypot(dx, dy)

      if (dist < radius) {
        const pull = (1 - dist / radius) * strength
        node.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`
      } else {
        node.style.transform = ''
      }
    }

    function onLeave() {
      node.style.transform = ''
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      node.style.transform = ''
    }
  }, [strength, radius])

  return ref
}
