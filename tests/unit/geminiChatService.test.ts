import { describe, expect, it } from 'vitest'
import { GeminiChatService, geminiConfig } from '../../src/services/geminiChatService'

describe('GeminiChatService', () => {
  it('reports missing configuration before attempting a provider call', async () => {
    const result = await new GeminiChatService('').sendMessage({ question: 'What is GST?', history: [] })

    expect(result.kind).toBe('missing-config')
    expect(result).toMatchObject({ message: expect.stringContaining('VITE_GOOGLE_API_KEY') })
  })

  it('exposes the governed model configuration', () => {
    expect(geminiConfig).toEqual({ model: 'gemma-4-26b-a4b-it', maxOutputTokens: 1024 })
  })
})