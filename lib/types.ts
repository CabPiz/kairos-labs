// lib/types.ts
export interface WaitlistEntry {
  id: string;
  email: string;
  product_id: string;
  created_at: string;
}

export type ProductId =
  | 'devprint'
  | 'ai-saas'
  | 'audio-tech'
  | 'blockchain';
