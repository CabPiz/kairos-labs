-- Adiciona coluna current_step para rastreamento em tempo real do passo atual
-- do pipeline de análise IA de solicitações de contato.
ALTER TABLE public.contact_analysis
  ADD COLUMN IF NOT EXISTS current_step TEXT;
