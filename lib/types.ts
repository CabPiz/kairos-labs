// =============================================
// Kairos Labs — Tipos TypeScript (Supabase)
// =============================================

export type ProductId = 'devprint' | 'ai-saas' | 'audio-tech' | 'blockchain'

export interface IssueDraftJson {
  classification?: 'bug' | 'improvement' | 'feature' | 'out-of-scope'
  title: string
  body: string
  labels: string[]
  milestone?: string
}

export interface NichoJson {
  publico: string
  justificativa: string
}

/** Linha de feedback enriquecida com contagem de anexos (retornada pela RPC get_dashboard_kpis) */
export type FeedbackWithMeta = Database['public']['Tables']['feedback']['Row'] & {
  attachment_count: number
}

type Rel = {
  foreignKeyName: string
  columns: string[]
  isOneToOne?: boolean
  referencedRelation: string
  referencedColumns: string[]
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
        Relationships: Rel[]
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
        Relationships: Rel[]
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
        Relationships: Rel[]
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
        Relationships: Rel[]
      }
      settings: {
        Row: { key: string; value: unknown; updated_at: string }
        Insert: { key: string; value: unknown; updated_at?: string }
        Update: { key?: string; value?: unknown; updated_at?: string }
        Relationships: Rel[]
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
        Relationships: Rel[]
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
        Relationships: Rel[]
      }
      contact_analysis: {
        Row: {
          id: string
          contact_request_id: string
          status: 'pending' | 'analyzing' | 'done' | 'error'
          current_step: string | null
          problema: string | null
          solucao_tipo: 'novo_produto' | 'aprimoramento' | null
          solucao_titulo: string | null
          solucao_descricao: string | null
          nichos: NichoJson[]
          draft_issues: IssueDraftJson[]
          attachments_used: string[]
          github_issue_url: string | null
          github_issue_number: number | null
          error_message: string | null
          current_step: string | null
          created_at: string
        }
        Insert: {
          id?: string
          contact_request_id: string
          status?: 'pending' | 'analyzing' | 'done' | 'error'
          current_step?: string | null
          problema?: string | null
          solucao_tipo?: 'novo_produto' | 'aprimoramento' | null
          solucao_titulo?: string | null
          solucao_descricao?: string | null
          nichos?: NichoJson[]
          draft_issues?: IssueDraftJson[]
          attachments_used?: string[]
          github_issue_url?: string | null
          github_issue_number?: number | null
          error_message?: string | null
          current_step?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          contact_request_id?: string
          status?: 'pending' | 'analyzing' | 'done' | 'error'
          current_step?: string | null
          problema?: string | null
          solucao_tipo?: 'novo_produto' | 'aprimoramento' | null
          solucao_titulo?: string | null
          solucao_descricao?: string | null
          nichos?: NichoJson[]
          draft_issues?: IssueDraftJson[]
          attachments_used?: string[]
          github_issue_url?: string | null
          github_issue_number?: number | null
          error_message?: string | null
          current_step?: string | null
          created_at?: string
        }
        Relationships: Rel[]
      }
      agent_runs: {
        Row: {
          id: string
          project_id: string
          session_id: string | null
          user_id: string | null
          agent_name: string
          model: string
          input_tokens: number | null
          output_tokens: number | null
          estimated_cost_usd: number | null
          latency_ms: number | null
          tools_called: string[] | null
          stop_reason: string | null
          status: 'success' | 'error' | 'timeout' | 'max_iter' | null
          error_message: string | null
          metadata: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          project_id?: string
          session_id?: string | null
          user_id?: string | null
          agent_name: string
          model: string
          input_tokens?: number | null
          output_tokens?: number | null
          estimated_cost_usd?: number | null
          latency_ms?: number | null
          tools_called?: string[] | null
          stop_reason?: string | null
          status?: 'success' | 'error' | 'timeout' | 'max_iter' | null
          error_message?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          session_id?: string | null
          user_id?: string | null
          agent_name?: string
          model?: string
          input_tokens?: number | null
          output_tokens?: number | null
          estimated_cost_usd?: number | null
          latency_ms?: number | null
          tools_called?: string[] | null
          stop_reason?: string | null
          status?: 'success' | 'error' | 'timeout' | 'max_iter' | null
          error_message?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
        }
        Relationships: Rel[]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
