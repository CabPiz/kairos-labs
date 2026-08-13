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
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================
-- RLS — Row Level Security
-- =============================================

ALTER TABLE public.waitlist        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Acesso de fundador é baseado em app_metadata.role = 'founder'.
-- Nunca hardcode emails nas policies — configure o metadata
-- no painel Supabase ou via SQL (ver CONTRIBUTING.md).

-- waitlist: inserção pública, leitura/exclusão apenas pelo fundador
CREATE POLICY "Permitir inserção pública na waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Acesso exclusivo do fundador à waitlist"
  ON public.waitlist FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'founder');

CREATE POLICY "Fundador pode deletar entradas da waitlist"
  ON public.waitlist FOR DELETE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'founder');

-- feedback: inserção pública, leitura/exclusão apenas pelo fundador
CREATE POLICY "Permitir inserção pública no feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Acesso exclusivo do fundador ao feedback"
  ON public.feedback FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'founder');

CREATE POLICY "Fundador pode deletar entradas de feedback"
  ON public.feedback FOR DELETE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'founder');

-- contact_requests: inserção via service_role (Server Action), leitura pelo fundador
CREATE POLICY "Acesso exclusivo do fundador às solicitações de contato"
  ON public.contact_requests FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'founder');

CREATE POLICY "Fundador pode deletar solicitações de contato"
  ON public.contact_requests FOR DELETE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'founder');

-- =============================================
-- GRANTS
-- =============================================

GRANT INSERT ON public.waitlist         TO anon;
GRANT INSERT ON public.feedback         TO anon;
GRANT ALL    ON public.waitlist         TO service_role;
GRANT ALL    ON public.feedback         TO service_role;
GRANT ALL    ON public.contact_requests TO service_role;

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
