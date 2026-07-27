"use client"

import { useEffect, useRef, useState } from "react"

interface CountUpProps {
  value: string
  durationMs?: number
  className?: string
}

// "248명", "2,400+", "₩15,000"처럼 숫자를 포함한 문자열의 숫자 부분만 0에서 실제 값까지 카운트업한다.
// 숫자가 전혀 없으면(예: "별도 문의") 그대로 표시한다.
export default function CountUp({ value, durationMs = 900, className }: CountUpProps) {
  const match = value.match(/^(\D*)([\d,]+)(.*)$/)
  const prefix = match ? match[1] : ""
  const target = match ? Number(match[2].replace(/,/g, "")) : null
  const suffix = match ? match[3] : ""
  const hasComma = match ? match[2].includes(",") : false

  const [display, setDisplay] = useState(target === null ? "" : "0")
  const spanRef = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (target === null) return
    const el = spanRef.current
    if (!el) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(hasComma ? target.toLocaleString("ko-KR") : String(target))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || hasAnimated.current) return
          hasAnimated.current = true
          const start = performance.now()

          const step = (now: number) => {
            const progress = Math.min((now - start) / durationMs, 1)
            const eased = 1 - (1 - progress) ** 3
            const current = Math.round(target * eased)
            setDisplay(hasComma ? current.toLocaleString("ko-KR") : String(current))
            if (progress < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        })
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, durationMs, hasComma])

  if (target === null) {
    return <span className={className}>{value}</span>
  }

  return (
    <span ref={spanRef} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}
