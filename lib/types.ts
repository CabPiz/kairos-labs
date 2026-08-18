// =============================================
// Kairos Labs — Tipos TypeScript (Supabase)
// =============================================

export type ProductId = 'devprint' | 'ai-saas' | 'audio-tech' | 'blockchain'

export interface IssueDraftJson {
  classification: 'bug' | 'improvement' | 'feature' | 'out-of-scope'
  title: string
  body: string
  labels: string[]
  milestone?: string
}

/** Linha de feedback enriquecida com contagem de anexos (retornada pela RPC get_dashboard_kpis) */
export type FeedbackWithMeta = Database['public']['Tables']['feedback']['Row'] & {
  attachment_count: number
}

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
          notify_on_completion: boolean
          notify_email: string | null
          analysis_status: 'pending' | 'analyzing' | 'done' | 'error' | null
          issue_draft: IssueDraftJson | null
          github_issue_number: number | null
          github_issue_url: string | null
          analyzed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          nome?: string | null
          email?: string | null
          mensagem: string
          mensagem_locale?: string | null
          notify_on_completion?: boolean
          notify_email?: string | null
          analysis_status?: 'pending' | 'analyzing' | 'done' | 'error' | null
          issue_draft?: IssueDraftJson | null
          github_issue_number?: number | null
          github_issue_url?: string | null
          analyzed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          nome?: string | null
          email?: string | null
          mensagem?: string
          mensagem_locale?: string | null
          notify_on_completion?: boolean
          notify_email?: string | null
          analysis_status?: 'pending' | 'analyzing' | 'done' | 'error' | null
          issue_draft?: IssueDraftJson | null
          github_issue_number?: number | null
          github_issue_url?: string | null
          analyzed_at?: string | null
          created_at?: string
        }
      }
      feedback_attachments: {
        Row: {
          id: string
          feedback_id: string
          filename: string
          storage_path: string
          mime_type: string
          size_bytes: number
          created_at: string
        }
        Insert: {
          id?: string
          feedback_id: string
          filename: string
          storage_path: string
          mime_type: string
          size_bytes: number
          created_at?: string
        }
        Update: {
          id?: string
          feedback_id?: string
          filename?: string
          storage_path?: string
          mime_type?: string
          size_bytes?: number
          created_at?: string
        }
      }
      feedback_notifications: {
        Row: {
          id: string
          feedback_id: string
          github_issue_number: number
          sent_at: string | null
          status: 'pending' | 'sent' | 'failed'
          product_launched: boolean
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          feedback_id: string
          github_issue_number: number
          sent_at?: string | null
          status?: 'pending' | 'sent' | 'failed'
          product_launched?: boolean
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          feedback_id?: string
          github_issue_number?: number
          sent_at?: string | null
          status?: 'pending' | 'sent' | 'failed'
          product_launched?: boolean
          error_message?: string | null
          created_at?: string
        }
      }
      settings: {
        Row: { key: string; value: unknown; updated_at: string }
        Insert: { key: string; value: unknown; updated_at?: string }
        Update: { key?: string; value?: unknown; updated_at?: string }
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
