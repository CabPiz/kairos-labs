-- =============================================
-- Kairos Labs — Dashboard RPC (Migration 002)
-- Issue #56: SECURITY DEFINER para leituras do admin
-- =============================================

-- Função que consolida todos os dados do dashboard.
-- SECURITY DEFINER: executa com os privilégios do owner (postgres),
-- eliminando a necessidade de BYPASSRLS (service_role) para leituras.
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
