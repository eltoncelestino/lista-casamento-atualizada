"use client"

import { useEffect, useState } from "react"

export default function Countdown() {
  const targetDate = new Date("2026-05-09T16:00:00").getTime()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate - now

      if (distance < 0) {
        clearInterval(timer)
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  const TimeUnit = ({ value, label }: { value: number, label: string }) => (
    <div className="flex flex-col items-center px-4">
      <span className="text-3xl md:text-5xl font-serif text-[#C65D3B]">{value}</span>
      <span className="text-[10px] uppercase tracking-widest text-stone-400 mt-1">{label}</span>
    </div>
  )

  return (
    <div className="flex justify-center items-center divide-x divide-stone-200 mt-12 bg-white/40 py-8 px-4 rounded-3xl border border-white/50 shadow-sm backdrop-blur-sm">
      <TimeUnit value={timeLeft.days} label="Dias" />
      <TimeUnit value={timeLeft.hours} label="Horas" />
      <TimeUnit value={timeLeft.minutes} label="Minutos" />
      <TimeUnit value={timeLeft.seconds} label="Segundos" />
    </div>
  )
}
