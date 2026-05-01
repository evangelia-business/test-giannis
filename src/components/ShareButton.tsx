'use client'

import { useState } from 'react'
import type { Photo } from '@/lib/supabase/types'

interface ShareButtonProps {
  photo: Photo
}

export default function ShareButton({ photo }: ShareButtonProps) {
  const [shared, setShared] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const shareText = [
    photo.description ? `📝 ${photo.description}` : '',
    photo.place_name ? `📍 ${photo.place_name}` : '',
    photo.latitude && photo.longitude
      ? `🗺️ https://maps.google.com/?q=${photo.latitude},${photo.longitude}`
      : '',
  ]
    .filter(Boolean)
    .join('\n')

  async function handleShare() {
    setError(null)
    if (navigator.share) {
      try {
        const shareData: ShareData = {
          title: 'SnapPlace photo',
          text: shareText,
          url: photo.image_url,
        }

        // Try to share with files if supported
        if (navigator.canShare) {
          try {
            const blob = await fetch(photo.image_url).then(r => r.blob())
            const file = new File([blob], 'snapplace.jpg', { type: 'image/jpeg' })
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({ ...shareData, files: [file] })
              setShared(true)
              return
            }
          } catch {
            // Fall through to text-only share
          }
        }

        await navigator.share(shareData)
        setShared(true)
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError('Could not share. Try copying the link manually.')
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n${photo.image_url}`)
        setShared(true)
        setTimeout(() => setShared(false), 2000)
      } catch {
        setError('Sharing is not supported in this browser.')
      }
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 text-white px-4 py-2 text-sm font-medium hover:bg-stone-700 active:scale-95 transition"
      >
        {shared ? '✓ Shared!' : '↑ Share'}
      </button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
