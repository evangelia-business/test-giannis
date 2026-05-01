'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CameraCapture from '@/components/CameraCapture'
import LocationDetector, { type LocationData } from '@/components/LocationDetector'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

export default function NewPhotoPage() {
  const router = useRouter()

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [location, setLocation] = useState<LocationData | null>(null)
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCapture = useCallback((_dataUrl: string, file: File) => {
    setPhotoFile(file)
  }, [])

  const handleLocation = useCallback((data: LocationData) => {
    setLocation(data)
  }, [])

  async function handleSave() {
    if (!photoFile) {
      setError('Please take or upload a photo first.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Upload image to Supabase Storage
      const fileName = `${user.id}/${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, photoFile, { contentType: 'image/jpeg', upsert: false })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName)
      const imageUrl = urlData.publicUrl

      // Insert record
      const { error: insertError } = await supabase.from('photos').insert({
        user_id: user.id,
        image_url: imageUrl,
        description,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        place_name: location?.placeName ?? null,
      })

      if (insertError) throw insertError

      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save photo.')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-stone-50/80 backdrop-blur border-b border-stone-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-stone-500 hover:text-stone-900 transition">
            ← Back
          </Link>
          <span className="font-semibold tracking-tight">New Photo</span>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Camera */}
        <section>
          <label className="block text-sm font-medium mb-2">Photo</label>
          <CameraCapture onCapture={handleCapture} />
        </section>

        {/* Location */}
        <section>
          <label className="block text-sm font-medium mb-2">Location</label>
          <LocationDetector onLocation={handleLocation} value={location} />
        </section>

        {/* Description */}
        <section>
          <label className="block text-sm font-medium mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What's special about this place?"
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-900 transition resize-none"
          />
        </section>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !photoFile}
          className="w-full rounded-lg bg-stone-900 text-white py-3 text-sm font-semibold hover:bg-stone-700 active:scale-95 transition disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save Photo'}
        </button>
      </main>
    </div>
  )
}
