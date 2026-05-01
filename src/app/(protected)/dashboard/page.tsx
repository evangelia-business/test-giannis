import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PhotoGrid from '@/components/PhotoGrid'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-10 bg-stone-50/80 backdrop-blur border-b border-stone-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold tracking-tight">📍 SnapPlace</span>
          <div className="flex items-center gap-3">
            <Link
              href="/new"
              className="rounded-lg bg-stone-900 text-white px-3 py-1.5 text-sm font-medium hover:bg-stone-700 transition"
            >
              + New
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {(!photos || photos.length === 0) ? (
          <div className="text-center py-20 space-y-3">
            <span className="text-5xl block">📷</span>
            <h2 className="text-lg font-medium">No photos yet</h2>
            <p className="text-sm text-stone-500">Tap &quot;+ New&quot; to capture your first moment.</p>
            <Link
              href="/new"
              className="inline-block mt-4 rounded-lg bg-stone-900 text-white px-5 py-2 text-sm font-medium hover:bg-stone-700 transition"
            >
              Take a photo
            </Link>
          </div>
        ) : (
          <PhotoGrid photos={photos} />
        )}
      </main>
    </div>
  )
}

// Sign out action is client-side
function SignOutButton() {
  return (
    <form action="/api/auth/signout" method="POST">
      <button
        type="submit"
        className="text-sm text-stone-500 hover:text-stone-900 transition"
      >
        Sign out
      </button>
    </form>
  )
}
