import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { CA_PERSONA_PROMPT } from '../prompts/caPersona'
import type { ChatRequest, ChatResult, ChatService } from './chatService'

const MODEL_NAME = 'gemma-4-26b-a4b-it'
const MAX_OUTPUT_TOKENS = 1024

function contentToText(content: unknown): string {
  if (typeof content === 'string') {
    return content.trim()
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part
        if (part && typeof part === 'object' && 'text' in part) {
          return String(part.text)
        }
        return ''
      })
      .join('')
      .trim()
  }

  return ''
}

export class GeminiChatService implements ChatService {
  private readonly apiKey: string | undefined

  constructor(apiKey = import.meta.env.VITE_GOOGLE_API_KEY) {
    this.apiKey = apiKey?.trim() || undefined
  }

  async sendMessage(request: ChatRequest): Promise<ChatResult> {
    if (!this.apiKey) {
      return {
        kind: 'missing-config',
        message: 'Gemini is not configured yet. Add VITE_GOOGLE_API_KEY for local development, then try again.',
      }
    }

    const model = new ChatGoogleGenerativeAI({
      apiKey: this.apiKey,
      model: MODEL_NAME,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      temperature: 0.2,
      maxRetries: 0,
    })

    const history = request.history.map((message) =>
      message.role === 'user'
        ? new HumanMessage(message.content)
        : new AIMessage(message.content),
    )
    const response = await model.invoke([
      new SystemMessage(CA_PERSONA_PROMPT),
      ...history,
      new HumanMessage(request.question),
    ])
    const text = contentToText(response.content)

    if (!text) {
      throw new Error('Gemini returned an empty response. Please try again.')
    }

    return { kind: 'answer', text }
  }
}

export const geminiConfig = {
  model: MODEL_NAME,
  maxOutputTokens: MAX_OUTPUT_TOKENS,
}
