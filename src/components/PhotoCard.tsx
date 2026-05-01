import Image from 'next/image'
import Link from 'next/link'
import type { Photo } from '@/lib/supabase/types'
import ShareButton from './ShareButton'

interface PhotoCardProps {
  photo: Photo
  onDelete?: (id: string) => void
}

export default function PhotoCard({ photo, onDelete }: PhotoCardProps) {
  const date = new Date(photo.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="rounded-xl overflow-hidden border border-stone-200 bg-white shadow-sm">
      <Link href={`/photo/${photo.id}`}>
        <div className="relative aspect-[4/3] bg-stone-100">
          <Image
            src={photo.image_url}
            alt={photo.description || 'Photo'}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      </Link>

      <div className="p-3 space-y-2">
        {photo.description && (
          <p className="text-sm text-stone-800 line-clamp-2">{photo.description}</p>
        )}

        {photo.place_name && (
          <div className="flex items-center gap-1 text-xs text-stone-500">
            <span>📍</span>
            <span className="line-clamp-1">{photo.place_name}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-stone-400">{date}</span>
          <div className="flex items-center gap-2">
            <ShareButton photo={photo} />
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(photo.id)}
                className="text-xs text-stone-400 hover:text-red-500 transition"
                aria-label="Delete photo"
              >
                🗑
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
