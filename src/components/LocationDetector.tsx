'use client'

import { useState, useCallback } from 'react'

export interface LocationData {
  latitude: number
  longitude: number
  placeName: string
}

interface LocationDetectorProps {
  onLocation: (data: LocationData) => void
  value?: LocationData | null
}

export default function LocationDetector({ onLocation, value }: LocationDetectorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const detect = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }
    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        let placeName = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          )
          if (res.ok) {
            const data = await res.json()
            if (data.display_name) {
              // Shorten: city, country
              const parts = data.display_name.split(', ')
              placeName = parts.length > 3
                ? parts.slice(-3).join(', ')
                : data.display_name
            }
          }
        } catch {
          // Use coordinates as fallback
        }

        onLocation({ latitude, longitude, placeName })
        setLoading(false)
      },
      (err) => {
        setError(
          err.code === 1
            ? 'Location access denied. Please allow location access.'
            : 'Unable to retrieve your location.'
        )
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [onLocation])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={detect}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50 active:scale-95 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="animate-spin inline-block w-3 h-3 border-2 border-stone-400 border-t-stone-900 rounded-full" />
              Detecting…
            </>
          ) : (
            <>📍 Detect Location</>
          )}
        </button>
        {value && (
          <span className="text-xs text-stone-500">{value.latitude.toFixed(4)}, {value.longitude.toFixed(4)}</span>
        )}
      </div>

      {value && (
        <div className="flex items-start gap-2 rounded-lg bg-stone-100 px-3 py-2 text-sm">
          <span className="mt-0.5">📍</span>
          <span className="text-stone-700">{value.placeName}</span>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}
    </div>
  )
}
