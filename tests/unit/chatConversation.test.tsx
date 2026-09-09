import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../../src/App'
import { FakeChatService } from '../../src/services/fakeChatService'

describe('conversation memory and reset', () => {
  it('sends the previous turn as history and starts new chat with empty history', async () => {
    const user = userEvent.setup()
    const service = new FakeChatService({ response: ({ question }) => `Answer for ${question}` })
    render(<App chatService={service} />)

    const input = screen.getByRole('textbox', { name: /question/i })
    await user.type(input, 'First question')
    await user.click(screen.getByRole('button', { name: /ask ca buddy/i }))
    await screen.findByText('Answer for First question')

    await user.type(input, 'Follow-up question')
    await user.click(screen.getByRole('button', { name: /ask ca buddy/i }))
    await screen.findByText('Answer for Follow-up question')

    expect(service.requests[1].history).toEqual([
      { role: 'user', content: 'First question' },
      { role: 'assistant', content: 'Answer for First question' },
    ])

    await user.click(screen.getByRole('button', { name: /new chat/i }))
    await user.type(input, 'Fresh question')
    await user.click(screen.getByRole('button', { name: /ask ca buddy/i }))
    await waitFor(() => expect(service.requests[2].history).toEqual([]))
  })

  it('does not show a response from a conversation cleared while loading', async () => {
    const user = userEvent.setup()
    let resolveResponse: ((value: string) => void) | undefined
    const service = new FakeChatService({
      response: () => new Promise<string>((resolve) => { resolveResponse = resolve }) as unknown as string,
    })
    render(<App chatService={service} />)

    await user.type(screen.getByRole('textbox', { name: /question/i }), 'Old question')
    await user.click(screen.getByRole('button', { name: /ask ca buddy/i }))
    await user.click(screen.getByRole('button', { name: /new chat/i }))
    resolveResponse?.('Late old answer')

    await waitFor(() => expect(screen.queryByText('Late old answer')).not.toBeInTheDocument())
  })
})