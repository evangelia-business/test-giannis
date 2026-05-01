# 📍 SnapPlace

A minimalist photo-capture app built with **Next.js 15**, **Supabase**, and **Tailwind CSS**.

## Features

- 📷 **Camera capture** — take a photo directly in the browser or upload from your gallery
- 📍 **Auto-detected location** — detects your GPS position and reverse-geocodes it to a readable place name (via OpenStreetMap Nominatim)
- 📝 **Description** — add a text description for the place/moment
- 🔗 **Web Share API** — share the photo + location + description to other apps (Viber, WhatsApp, etc.) with one tap
- 🔐 **Authentication** — email/password sign-up & sign-in via Supabase Auth
- 📸 **Photo gallery** — view, browse and delete your saved photo bundles

## Tech Stack

| Layer       | Tech                        |
|-------------|-----------------------------|
| Framework   | Next.js 15 (App Router)     |
| Database    | Supabase (Postgres + Storage)|
| Auth        | Supabase Auth               |
| Styling     | Tailwind CSS                |
| Deployment  | Vercel (recommended)        |

## Getting Started

### 1. Clone & install

```bash
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Copy your project URL and anon key from **Project Settings → API**

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

Deploy to Vercel with one click, and set the two environment variables in your Vercel project settings.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
