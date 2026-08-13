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
          product_id: string
          nome: string | null
          email: string | null
          mensagem: string
          mensagem_locale: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          nome?: string | null
          email?: string | null
          mensagem: string
          mensagem_locale?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          nome?: string | null
          email?: string | null
          mensagem?: string
          mensagem_locale?: string | null
          created_at?: string
        }
      }
      contact_requests: {
        Row: {
          id: string
          name: string
          email: string
          project_type: string
          description: string
          phone: string | null
          whatsapp_preferred: boolean
          status: 'novo' | 'visualizado' | 'respondido'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          project_type: string
          description: string
          phone?: string | null
          whatsapp_preferred?: boolean
          status?: 'novo' | 'visualizado' | 'respondido'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          project_type?: string
          description?: string
          phone?: string | null
          whatsapp_preferred?: boolean
          status?: 'novo' | 'visualizado' | 'respondido'
          created_at?: string
        }
      }
      contact_attachments: {
        Row: {
          id: string
          contact_request_id: string
          filename: string
          storage_path: string
          mime_type: string
          size_bytes: number
          created_at: string
        }
        Insert: {
          id?: string
          contact_request_id: string
          filename: string
          storage_path: string
          mime_type: string
          size_bytes: number
          created_at?: string
        }
        Update: {
          id?: string
          contact_request_id?: string
          filename?: string
          storage_path?: string
          mime_type?: string
          size_bytes?: number
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
