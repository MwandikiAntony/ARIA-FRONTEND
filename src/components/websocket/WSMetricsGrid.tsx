 'use client'

import { useEffect, useState } from 'react'
import { WSMetricCard } from './WSMetricCard'

export default function WSMetricsGrid() {
  const [latency, setLatency] = useState(142)

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(130 + Math.floor(Math.random() * 40))
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-4 gap-4">
      <WSMetricCard
        label="Round-Trip Latency"
        value={latency}
        unit="milliseconds"
        color="green"
      />
      <WSMetricCard
        label="Active Connections"
        value={847}
        unit="concurrent users"
        color="cyan"
      />
      <WSMetricCard
        label="Audio Frames/sec"
        value={48}
        unit="frames per second"
        color="amber"
      />
      <WSMetricCard
        label="Cloud Run Instances"
        value={3}
        unit="auto-scaled · healthy"
        color="purple"
      />
    </div>
  )
}
