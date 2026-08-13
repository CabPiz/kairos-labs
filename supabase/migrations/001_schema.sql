-- =============================================
-- Kairos Labs — Schema Unificado
-- Estado final do banco. Evolua este arquivo
-- diretamente para qualquer mudança de schema.
-- Histórico de mudanças: git log supabase/migrations/001_schema.sql
-- =============================================

-- =============================================
-- TABELAS
-- =============================================

-- Tabela da Lista de Espera por Produto
-- product_id: devprint | ai-saas | audio-tech | blockchain |
--             ascend | elucya-talk | agora-global | kairos-labs
CREATE TABLE public.waitlist (
  id         UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
  email      TEXT                     NOT NULL,
  product_id TEXT                     NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT waitlist_email_product_unique UNIQUE (email, product_id)
);

-- Tabela de Sugestões / Feedback
CREATE TABLE public.feedback (
  id              UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id      TEXT                     NOT NULL,
  nome            TEXT,
  email           TEXT,
  mensagem        TEXT                     NOT NULL,
  mensagem_locale TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Solicitações de Contato
CREATE TABLE public.contact_requests (
  id                  UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
  name                TEXT                     NOT NULL,
  email               TEXT                     NOT NULL,
  project_type        TEXT                     NOT NULL,
  description         TEXT                     NOT NULL,
  phone               TEXT,
  whatsapp_preferred  BOOLEAN                  NOT NULL DEFAULT FALSE,
  status              TEXT                     NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'visualizado', 'respondido')),
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Anexos de Solicitações de Contato
CREATE TABLE public.contact_attachments (
  id                 UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_request_id UUID                     NOT NULL REFERENCES public.contact_requests(id) ON DELETE CASCADE,
  filename           TEXT                     NOT NULL,
  storage_path       TEXT                     NOT NULL,
  mime_type          TEXT                     NOT NULL,
  size_bytes         BIGINT                   NOT NULL,
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================
-- RLS — Row Level Security
-- =============================================

ALTER TABLE public.waitlist            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_attachments ENABLE ROW LEVEL SECURITY;

-- Acesso de fundador é baseado em app_metadata.role = 'founder'.
-- Acesso de fundador é verificado via app_metadata.role.
-- Nunca hardcode emails nas policies — configure o metadata
-- no painel Supabase ou via SQL (ver CONTRIBUTING.md).

-- Função auxiliar: retorna true se o usuário autenticado tem role 'founder'.
-- STABLE + SECURITY DEFINER garantem avaliação correta no contexto de RLS.
CREATE OR REPLACE FUNCTION public.is_founder()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'founder';
$$;

-- waitlist: inserção pública, leitura/exclusão apenas pelo fundador
CREATE POLICY "Permitir inserção pública na waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Acesso exclusivo do fundador à waitlist"
  ON public.waitlist FOR SELECT
  USING (public.is_founder());

CREATE POLICY "Fundador pode deletar entradas da waitlist"
  ON public.waitlist FOR DELETE
  USING (public.is_founder());

-- feedback: inserção pública, leitura/exclusão apenas pelo fundador
CREATE POLICY "Permitir inserção pública no feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Acesso exclusivo do fundador ao feedback"
  ON public.feedback FOR SELECT
  USING (public.is_founder());

CREATE POLICY "Fundador pode deletar entradas de feedback"
  ON public.feedback FOR DELETE
  USING (public.is_founder());

-- contact_requests: inserção via service_role (Server Action), leitura/update pelo fundador
CREATE POLICY "Acesso exclusivo do fundador às solicitações de contato"
  ON public.contact_requests FOR SELECT
  USING (public.is_founder());

CREATE POLICY "Fundador pode deletar solicitações de contato"
  ON public.contact_requests FOR DELETE
  USING (public.is_founder());

-- contact_attachments: inserção via service_role (route handler), leitura/exclusão pelo fundador
CREATE POLICY "Fundador lê anexos de contato"
  ON public.contact_attachments FOR SELECT
  USING (public.is_founder());

CREATE POLICY "Fundador pode deletar anexos de contato"
  ON public.contact_attachments FOR DELETE
  USING (public.is_founder());

-- =============================================
-- GRANTS
-- =============================================

GRANT INSERT ON public.waitlist            TO anon;
GRANT INSERT ON public.feedback            TO anon;
GRANT ALL    ON public.waitlist            TO service_role;
GRANT ALL    ON public.feedback            TO service_role;
GRANT ALL    ON public.contact_requests    TO service_role;
GRANT ALL    ON public.contact_attachments TO service_role;

-- =============================================
-- FUNÇÕES
-- =============================================

-- Consolida todos os dados do dashboard do Fundador.
-- SECURITY DEFINER: executa com privilégios do owner (postgres),
-- eliminando a necessidade de BYPASSRLS para leituras do admin.
-- SET search_path: previne search_path injection.
CREATE OR REPLACE FUNCTION public.get_dashboard_kpis()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  seven_days_ago TIMESTAMPTZ := NOW() - INTERVAL '7 days';
BEGIN
  RETURN jsonb_build_object(
    'all_leads',
      (SELECT COALESCE(jsonb_agg(w ORDER BY w.created_at DESC), '[]'::jsonb)
       FROM waitlist w),
    'recent_count',
      (SELECT COUNT(*) FROM waitlist WHERE created_at >= seven_days_ago),
    'all_feedback',
      (SELECT COALESCE(jsonb_agg(f ORDER BY f.created_at DESC), '[]'::jsonb)
       FROM feedback f)
  );
END;
$$;

-- Apenas usuários autenticados (o fundador) podem chamar a função
GRANT EXECUTE ON FUNCTION public.get_dashboard_kpis() TO authenticated;

-- =============================================
-- OBSERVABILIDADE DE IA (Pilar 5)
-- =============================================

-- Tabela de registros de execução de agentes IA.
-- RLS bloqueia todo acesso por JWT; apenas service_role (BYPASSRLS) pode escrever.
-- Leitura para o admin via #126 deve usar service_role ou RPC SECURITY DEFINER.
CREATE TABLE public.agent_runs (
  id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id         TEXT          NOT NULL DEFAULT 'kairos-labs',
  session_id         TEXT,
  user_id            UUID          REFERENCES auth.users(id),
  agent_name         TEXT          NOT NULL,
  model              TEXT          NOT NULL,
  input_tokens       INT,
  output_tokens      INT,
  estimated_cost_usd NUMERIC(10,6),
  latency_ms         INT,
  tools_called       TEXT[],
  stop_reason        TEXT,
  status             TEXT          CHECK (status IN ('success','error','timeout','max_iter')),
  error_message      TEXT,
  metadata           JSONB         DEFAULT '{}',
  created_at         TIMESTAMPTZ   DEFAULT NOW()
);

ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;

-- Bloqueia acesso via JWT; service_role contorna via BYPASSRLS
CREATE POLICY "service role only" ON public.agent_runs USING (false);

GRANT ALL ON public.agent_runs TO service_role;

-- =============================================
-- STORAGE
-- =============================================

-- Bucket privado para anexos de solicitações de contato
-- file_size_limit: 10 MB; tipos aceitos: PDF, DOCX, TXT, PNG, JPG
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contact-attachments',
  'contact-attachments',
  false,
  10485760,
  ARRAY['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain','image/png','image/jpeg']
) ON CONFLICT (id) DO NOTHING;

-- service_role gerencia o bucket via route handler (upload, signed URLs, delete)
CREATE POLICY "service_role gerencia contact-attachments"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'contact-attachments')
  WITH CHECK (bucket_id = 'contact-attachments');
