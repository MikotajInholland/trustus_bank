// Canvas particle field — slow drift, soft connections, mouse pull.
// @author Wesley, Darlington, Mikotaj (shared)
import { useEffect, useRef } from 'react'

const COLORS = [
  'rgba(168, 85, 247, 0.55)',
  'rgba(34, 211, 238, 0.45)',
  'rgba(251, 191, 36, 0.4)',
  'rgba(236, 72, 153, 0.35)',
]

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

export default function AmbientField() {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: null, y: null, active: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    const ctx = canvas.getContext('2d')
    let animationId
    let particles = []
    let width = 0
    let height = 0

    function createParticles(count) {
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: randomBetween(-0.18, 0.18),
        vy: randomBetween(-0.18, 0.18),
        radius: randomBetween(1, 2.2),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        pulse: Math.random() * Math.PI * 2,
      }))
    }

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      const count = width < 768 ? 36 : Math.min(72, Math.floor((width * height) / 18000))
      createParticles(count)
    }

    function draw() {
      ctx.fillStyle = 'rgba(7, 11, 20, 0.18)'
      ctx.fillRect(0, 0, width, height)

      const mouse = mouseRef.current
      const linkDistance = width < 768 ? 90 : 130

      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i]

        if (mouse.active && mouse.x != null) {
          const dx = mouse.x - a.x
          const dy = mouse.y - a.y
          const dist = Math.hypot(dx, dy) || 1
          if (dist < 220) {
            const force = (220 - dist) / 32000
            a.vx += (dx / dist) * force
            a.vy += (dy / dist) * force
          }
        }

        a.vx *= 0.995
        a.vy *= 0.995
        a.x += a.vx
        a.y += a.vy
        a.pulse += 0.015

        if (a.x < -20) a.x = width + 20
        if (a.x > width + 20) a.x = -20
        if (a.y < -20) a.y = height + 20
        if (a.y > height + 20) a.y = -20

        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist < linkDistance) {
            const alpha = (1 - dist / linkDistance) * 0.18
            ctx.strokeStyle = `rgba(196, 181, 253, ${alpha})`
            ctx.lineWidth = 0.6
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }

        const glow = 0.55 + Math.sin(a.pulse) * 0.25
        ctx.beginPath()
        ctx.arc(a.x, a.y, a.radius * glow, 0, Math.PI * 2)
        ctx.fillStyle = a.color
        ctx.fill()
      }

      animationId = requestAnimationFrame(draw)
    }

    function onMove(event) {
      mouseRef.current = { x: event.clientX, y: event.clientY, active: true }
    }

    function onLeave() {
      mouseRef.current = { x: null, y: null, active: false }
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="ambient-field" aria-hidden="true" />
}
