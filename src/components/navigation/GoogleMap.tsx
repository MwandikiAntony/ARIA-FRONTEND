'use client';

/**
 * src/components/navigation/GoogleMap.tsx
 *
 * WHY THIS FILE EXISTS:
 * Replaces the static Google Maps iframe in NavigationHUD.
 * The iframe only showed a pinned static location — it did not update
 * as the user moved, had no route line, no destination marker, and
 * was frequently blocked by Google's embed restrictions.
 *
 * This component uses the Google Maps JavaScript API directly:
 * - Live blue dot that moves with every GPS fix
 * - Route polyline drawn when a route is active
 * - Destination marker (red pin)
 * - Auto-centers on user position unless user has panned the map
 * - Dark map style to match the ARIA HUD theme
 */

import React, { useEffect, useRef, useCallback } from 'react'
import type { MapsRoute } from '@/hooks/useGoogleMapsRoute'

interface GoogleMapProps {
  position: GeolocationCoordinates | null
  route: MapsRoute | null
  destination: string | null
}

declare global {
  interface Window { google: typeof google }
}

export const GoogleMap: React.FC<GoogleMapProps> = ({ position, route, destination }) => {
  const mapDivRef       = useRef<HTMLDivElement | null>(null)
  const mapRef          = useRef<google.maps.Map | null>(null)
  const userMarkerRef   = useRef<google.maps.Marker | null>(null)
  const destMarkerRef   = useRef<google.maps.Marker | null>(null)
  const polylineRef     = useRef<google.maps.Polyline | null>(null)
  const userPannedRef   = useRef(false)
  const mapReadyRef     = useRef(false)

  // Dark map style matching ARIA HUD theme
  const darkStyle: google.maps.MapTypeStyle[] = [
    { elementType: 'geometry', stylers: [{ color: '#0a0f0a' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#00e5ff' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0f0a' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2e1a' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#00e5ff22' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1f3d1f' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#050d05' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
    { featureType: 'administrative', elementType: 'labels', stylers: [{ color: '#00e5ff88' }] },
  ]

  const initMap = useCallback(() => {
    if (!mapDivRef.current || !window.google || mapReadyRef.current) return

    const center = position
      ? { lat: position.latitude, lng: position.longitude }
      : { lat: 0, lng: 0 }

    mapRef.current = new google.maps.Map(mapDivRef.current, {
      center,
      zoom: 17,
      styles: darkStyle,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'greedy',
    })

    // Blue pulsing dot for user location
    userMarkerRef.current = new google.maps.Marker({
      position: center,
      map: mapRef.current,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: '#00e5ff',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      title: 'Your location',
      zIndex: 10,
    })

    // Track if user manually pans — stop auto-centering if so
    mapRef.current.addListener('dragstart', () => { userPannedRef.current = true })

    mapReadyRef.current = true
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Init map once Google Maps SDK is ready
  useEffect(() => {
    const tryInit = () => {
      if (window.google?.maps) { initMap(); return }
      const interval = setInterval(() => {
        if (window.google?.maps) { clearInterval(interval); initMap() }
      }, 200)
      return () => clearInterval(interval)
    }
    return tryInit()
  }, [initMap])

  // Update user position marker + re-center if not panned
  useEffect(() => {
    if (!position || !mapRef.current || !userMarkerRef.current) return
    const latlng = new google.maps.LatLng(position.latitude, position.longitude)
    userMarkerRef.current.setPosition(latlng)
    if (!userPannedRef.current) {
      mapRef.current.panTo(latlng)
    }
  }, [position])

  // Draw route polyline + destination marker when route changes
  useEffect(() => {
    if (!mapRef.current || !window.google) return

    // Clear old polyline and marker
    polylineRef.current?.setMap(null)
    destMarkerRef.current?.setMap(null)

    if (!route || !destination) return

    // Build path from step start locations
    const path = route.steps.map(s => ({ lat: s.startLat, lng: s.startLng }))

    polylineRef.current = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#00e5ff',
      strokeOpacity: 0.9,
      strokeWeight: 4,
      map: mapRef.current,
    })

    // Destination marker — last step end
    const last = route.steps[route.steps.length - 1]
    if (last) {
      destMarkerRef.current = new google.maps.Marker({
        position: { lat: last.startLat, lng: last.startLng },
        map: mapRef.current,
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#ff4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 1.5,
        },
        title: destination,
        zIndex: 9,
      })
    }

    // Fit map to show full route
    const bounds = new google.maps.LatLngBounds()
    path.forEach(p => bounds.extend(p))
    mapRef.current.fitBounds(bounds, { top: 40, right: 20, bottom: 20, left: 20 })
    userPannedRef.current = false
  }, [route, destination])

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-bg-surface">
      <div ref={mapDivRef} className="w-full h-full" />

      {/* Re-center button */}
      {userPannedRef.current && position && (
        <button
          onClick={() => {
            if (mapRef.current && position) {
              mapRef.current.panTo({ lat: position.latitude, lng: position.longitude })
              userPannedRef.current = false
            }
          }}
          className="absolute bottom-3 right-3 bg-bg-deep/90 border border-cyan/40 text-cyan rounded-full px-2.5 py-1 font-mono text-[10px] hover:bg-cyan/20 transition-colors z-10"
        >
          ◉ Re-center
        </button>
      )}

      {/* LIVE badge */}
      {position && (
        <div className="absolute top-2 left-2 bg-black/70 rounded px-1.5 py-0.5 font-mono text-[9px] text-cyan z-10 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
          LIVE
        </div>
      )}
    </div>
  )
}