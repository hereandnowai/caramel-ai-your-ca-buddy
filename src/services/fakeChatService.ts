import type { ChatHistoryMessage } from '../types/chat'
import type { ChatRequest, ChatResult, ChatService } from './chatService'

export interface FakeChatServiceOptions {
  response?: string | ((request: ChatRequest) => string | Promise<string>)
  delayMs?: number
  failure?: string
  missingConfig?: string
}

export class FakeChatService implements ChatService {
  readonly requests: ChatRequest[] = []
  private readonly options: FakeChatServiceOptions

  constructor(options: FakeChatServiceOptions = {}) {
    this.options = options
  }

  async sendMessage(request: ChatRequest): Promise<ChatResult> {
    this.requests.push({
      question: request.question,
      history: request.history.map((message: ChatHistoryMessage) => ({ ...message })),
    })

    if (this.options.delayMs) {
      await new Promise((resolve) => window.setTimeout(resolve, this.options.delayMs))
    }

    if (this.options.missingConfig) {
      return { kind: 'missing-config', message: this.options.missingConfig }
    }

    if (this.options.failure) {
      throw new Error(this.options.failure)
    }

    const response = this.options.response ?? 'Here is a general starting point. Please consult a Chartered Accountant for advice specific to your situation.'
    const text = typeof response === 'function' ? await response(request) : response

    if (!text.trim()) {
      throw new Error('The response was empty. Please try again.')
    }

    return { kind: 'answer', text: text.trim() }
  }
}
