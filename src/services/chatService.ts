import type { ChatHistoryMessage } from '../types/chat'

export interface ChatRequest {
  question: string
  history: readonly ChatHistoryMessage[]
}

export type ChatResult =
  | { kind: 'answer'; text: string }
  | { kind: 'missing-config'; message: string }

export interface ChatService {
  sendMessage(request: ChatRequest): Promise<ChatResult>
}

export class ChatServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ChatServiceError'
  }
}
