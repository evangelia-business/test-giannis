'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PhotoCard from './PhotoCard'
import { createClient } from '@/lib/supabase/client'
import type { Photo } from '@/lib/supabase/types'

interface PhotoGridProps {
  photos: Photo[]
}

export default function PhotoGrid({ photos: initialPhotos }: PhotoGridProps) {
  const router = useRouter()
  const supabase = createClient()
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)

  async function handleDelete(id: string) {
    if (!confirm('Delete this photo?')) return

    const photo = photos.find(p => p.id === id)
    if (!photo) return

    // Delete from storage
    const urlParts = photo.image_url.split('/photos/')
    if (urlParts.length > 1) {
      await supabase.storage.from('photos').remove([urlParts[1]])
    }

    // Delete record
    await supabase.from('photos').delete().eq('id', id)
    setPhotos(prev => prev.filter(p => p.id !== id))
    router.refresh()
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {photos.map(photo => (
        <PhotoCard key={photo.id} photo={photo} onDelete={handleDelete} />
      ))}
    </div>
  )
}
