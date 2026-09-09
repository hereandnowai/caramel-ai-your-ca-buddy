export type ChatRole = 'user' | 'assistant'

export type ChatStatus =
  | 'idle'
  | 'loading'
  | 'answered'
  | 'failed'
  | 'missing-config'

export type ScopeCategory =
  | 'GST'
  | 'TDS'
  | 'ITR deadlines'
  | 'audit basics'
  | 'professional escalation'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  sequence: number
}

export interface ActiveConversation {
  id: string
  messages: ChatMessage[]
  status: ChatStatus
  requestGeneration: number
}

export interface ChatHistoryMessage {
  role: ChatRole
  content: string
}
