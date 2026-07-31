// =============================================
// Kairos Labs — Tipos TypeScript (Supabase)
// =============================================

export type ProductId = 'devprint' | 'ai-saas' | 'audio-tech' | 'blockchain'

export type Database = {
  public: {
    Tables: {
      waitlist: {
        Row: {
          id: string
          email: string
          product_id: ProductId
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          product_id: ProductId
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          product_id?: ProductId
          created_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          nome: string | null
          email: string | null
          mensagem: string
          created_at: string
        }
        Insert: {
          id?: string
          nome?: string | null
          email?: string | null
          mensagem: string
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string | null
          email?: string | null
          mensagem?: string
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}