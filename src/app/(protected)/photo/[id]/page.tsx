import { redirect, notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ShareButton from '@/components/ShareButton'

export const dynamic = 'force-dynamic'

interface Props {
  params: { id: string }
}

export default async function PhotoDetailPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: photo } = await supabase
    .from('photos')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!photo) notFound()

  const date = new Date(photo.created_at).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-stone-50/80 backdrop-blur border-b border-stone-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-stone-500 hover:text-stone-900 transition">
            ← Back
          </Link>
          <span className="font-semibold tracking-tight">Photo</span>
          <ShareButton photo={photo} />
        </div>
      </header>

      <main className="max-w-lg mx-auto">
        {/* Full-width image */}
        <div className="relative aspect-[4/3] bg-stone-100">
          <Image
            src={photo.image_url}
            alt={photo.description || 'Photo'}
            fill
            className="object-cover"
            sizes="(max-width: 512px) 100vw, 512px"
            priority
          />
        </div>

        <div className="px-4 py-5 space-y-4">
          {photo.description && (
            <p className="text-base text-stone-800">{photo.description}</p>
          )}

          {photo.place_name && (
            <div className="flex items-start gap-2 rounded-lg bg-stone-100 px-3 py-2.5">
              <span className="text-lg">📍</span>
              <div>
                <p className="text-sm font-medium text-stone-800">{photo.place_name}</p>
                {photo.latitude && photo.longitude && (
                  <a
                    href={`https://maps.google.com/?q=${photo.latitude},${photo.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-stone-500 hover:text-stone-800 transition"
                  >
                    {photo.latitude.toFixed(5)}, {photo.longitude.toFixed(5)} ↗
                  </a>
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-stone-400">{date}</p>
        </div>
      </main>
    </div>
  )
}
