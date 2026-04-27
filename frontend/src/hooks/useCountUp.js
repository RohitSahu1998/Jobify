import { useEffect, useRef, useState } from 'react'

export function useCountUp(target, duration = 1800, inView = false) {
  const [count, setCount] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (!inView || started.current) return
    started.current = true

    const isFloat = String(target).includes('.')
    const numeric = parseFloat(target)
    const start = performance.now()

    const tick = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = eased * numeric
      setCount(isFloat ? parseFloat(current.toFixed(1)) : Math.floor(current))
      if (progress < 1) requestAnimationFrame(tick)
      else setCount(numeric)
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration])

  return count
}
