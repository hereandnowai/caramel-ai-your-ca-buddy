import { describe, expect, it } from 'vitest'
import { FakeChatService } from '../../src/services/fakeChatService'

describe('FakeChatService', () => {
  it('records ordered history and returns a deterministic answer', async () => {
    const service = new FakeChatService({ response: 'A fixed answer.' })
    const result = await service.sendMessage({
      question: 'Follow-up question',
      history: [{ role: 'user', content: 'First question' }, { role: 'assistant', content: 'First answer' }],
    })

    expect(result).toEqual({ kind: 'answer', text: 'A fixed answer.' })
    expect(service.requests[0].history).toEqual([
      { role: 'user', content: 'First question' },
      { role: 'assistant', content: 'First answer' },
    ])
  })

  it('supports missing configuration, failure, and empty-response states', async () => {
    await expect(new FakeChatService({ failure: 'No provider' }).sendMessage({ question: 'Q', history: [] })).rejects.toThrow('No provider')
    await expect(new FakeChatService({ response: '   ' }).sendMessage({ question: 'Q', history: [] })).rejects.toThrow(/empty/i)
    await expect(new FakeChatService({ missingConfig: 'Configure the service' }).sendMessage({ question: 'Q', history: [] })).resolves.toEqual({
      kind: 'missing-config',
      message: 'Configure the service',
    })
  })
})