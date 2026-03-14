'use client';

/**
 * src/components/navigation/DestinationSearch.tsx
 *
 * WHY THIS FILE EXISTS:
 * The destination input with Google Places Autocomplete.
 * User types a destination, selects from dropdown, and the route
 * is calculated. Also shows transport mode selector and route summary
 * (distance + ETA) once a route is active.
 *
 * ARIA integration:
 * When a route is calculated the parent passes it to useNavigationSession
 * which sends the first step instruction to Gemini so ARIA speaks it.
 */

import React, { useEffect, useRef, useState } from 'react'
import type { TravelMode, MapsRoute } from '@/hooks/useGoogleMapsRoute'

interface DestinationSearchProps {
  onSearch: (destination: string) => void
  onClear: () => void
  onModeChange: (mode: TravelMode) => void
  travelMode: TravelMode
  route: MapsRoute | null
  isLoading: boolean
  error: string | null
}

const MODE_OPTIONS: { mode: TravelMode; label: string; icon: string }[] = [
  { mode: 'WALKING',   label: 'Walk',    icon: '🚶' },
  { mode: 'DRIVING',   label: 'Drive',   icon: '🚗' },
  { mode: 'TRANSIT',   label: 'Transit', icon: '🚌' },
  { mode: 'BICYCLING', label: 'Cycle',   icon: '🚴' },
]

export const DestinationSearch: React.FC<DestinationSearchProps> = ({
  onSearch,
  onClear,
  onModeChange,
  travelMode,
  route,
  isLoading,
  error,
}) => {
  const inputRef       = useRef<HTMLInputElement | null>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [autocompleteReady, setAutocompleteReady] = useState(false)

  // Init Places Autocomplete once Maps SDK is available
  useEffect(() => {
    const tryInit = () => {
      if (!window.google?.maps?.places || !inputRef.current) return
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode', 'establishment'],
        fields: ['formatted_address', 'geometry', 'name'],
      })
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current!.getPlace()
        const dest = place.formatted_address || place.name || inputValue
        if (dest) { setInputValue(dest); onSearch(dest) }
      })
      setAutocompleteReady(true)
    }

    if (window.google?.maps?.places) { tryInit(); return }
    const interval = setInterval(() => {
      if (window.google?.maps?.places) { clearInterval(interval); tryInit() }
    }, 300)
    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) onSearch(inputValue.trim())
  }

  const handleClear = () => {
    setInputValue('')
    onClear()
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Search input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Where to? Say a destination…"
            className="w-full bg-bg-surface border border-border rounded-md px-3 py-2 text-xs text-text-primary placeholder:text-text-muted font-mono focus:outline-none focus:border-cyan/60 transition-colors"
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary text-xs"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="px-3 py-2 rounded-md bg-cyan/20 border border-cyan/40 text-cyan text-xs font-semibold hover:bg-cyan/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-mono"
        >
          {isLoading ? '…' : 'Go'}
        </button>
      </form>

      {/* Travel mode selector */}
      <div className="flex gap-1.5">
        {MODE_OPTIONS.map(({ mode, label, icon }) => (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-md border text-[10px] font-mono transition-colors ${
              travelMode === mode
                ? 'border-cyan bg-cyan/15 text-cyan'
                : 'border-border bg-bg-surface text-text-muted hover:border-cyan/30 hover:text-text-secondary'
            }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="font-mono text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 rounded px-2 py-1.5">
          {error}
        </div>
      )}

      {/* Route summary */}
      {route && (
        <div className="bg-cyan/5 border border-cyan/20 rounded-md px-3 py-2.5 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Route</span>
            <span className="text-xs text-text-primary font-medium">{route.summary || 'Via suggested route'}</span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-mono text-xs text-cyan font-bold">{route.totalDuration}</span>
            <span className="font-mono text-[10px] text-text-muted">{route.totalDistance}</span>
          </div>
        </div>
      )}
    </div>
  )
}