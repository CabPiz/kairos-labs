export interface WaitlistEntry {
  id: string
  email: string
  product_id: ProductId
  created_at: string
}

export type ProductId = 'devprint' | 'ai-saas' | 'audio-tech' | 'blockchain'

export interface Product {
  id: ProductId
  name: string
  description: string
  status: 'em-breve' | 'beta' | 'ativo'
}

export interface FeedbackEntry {
  id: string
  nome?: string
  email?: string
  mensagem: string
  created_at: string
}