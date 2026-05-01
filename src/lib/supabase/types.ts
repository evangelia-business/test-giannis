export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      photos: {
        Row: {
          id: string
          user_id: string
          image_url: string
          description: string
          latitude: number | null
          longitude: number | null
          place_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          description?: string
          latitude?: number | null
          longitude?: number | null
          place_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string
          description?: string
          latitude?: number | null
          longitude?: number | null
          place_name?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}

export type Photo = Database['public']['Tables']['photos']['Row']
