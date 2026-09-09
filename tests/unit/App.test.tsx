import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../../src/App'
import { FakeChatService } from '../../src/services/fakeChatService'

describe('CA Buddy shell', () => {
  it('renders the required screen landmarks and disclaimer', () => {
    render(<App />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /ca buddy/i })).toBeInTheDocument()
    expect(screen.getByRole('log', { name: /conversation/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /question/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /new chat/i })).toBeInTheDocument()
    expect(screen.getByText(/general information only/i)).toBeInTheDocument()
  })

  it('shows the submitted question and service answer', async () => {
    const user = userEvent.setup()
    const service = new FakeChatService({ response: 'GST returns are filed according to your registration and filing frequency.' })
    render(<App chatService={service} />)

    await user.type(screen.getByRole('textbox', { name: /question/i }), 'When is my GST return due?')
    await user.click(screen.getByRole('button', { name: /ask ca buddy/i }))

    expect(screen.getByText('When is my GST return due?')).toBeInTheDocument()
    expect(await screen.findByText(/gst returns are filed/i)).toBeInTheDocument()
    expect(service.requests[0]).toMatchObject({ question: 'When is my GST return due?', history: [] })
  })

  it('ignores empty questions and reports missing configuration', async () => {
    const user = userEvent.setup()
    const service = new FakeChatService({ missingConfig: 'Add the API key before trying again.' })
    render(<App chatService={service} />)

    await user.type(screen.getByRole('textbox', { name: /question/i }), '   ')
    expect(screen.getByRole('button', { name: /ask ca buddy/i })).toBeDisabled()
    expect(service.requests).toHaveLength(0)

    await user.clear(screen.getByRole('textbox', { name: /question/i }))
    await user.type(screen.getByRole('textbox', { name: /question/i }), 'What is TDS?')
    await user.click(screen.getByRole('button', { name: /ask ca buddy/i }))

    expect(await screen.findByText('Add the API key before trying again.')).toBeInTheDocument()
  })

  it('shows loading and failure states without crashing', async () => {
    const user = userEvent.setup()
    const service = new FakeChatService({ delayMs: 50, failure: 'The provider is unavailable.' })
    render(<App chatService={service} />)

    await user.type(screen.getByRole('textbox', { name: /question/i }), 'Explain audit basics')
    await user.click(screen.getByRole('button', { name: /ask ca buddy/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/thinking/i)
    expect(screen.getByRole('button', { name: /ask ca buddy/i })).toBeDisabled()
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/provider is unavailable/i))
  })

  it('clears the conversation when New chat is selected', async () => {
    const user = userEvent.setup()
    const service = new FakeChatService({ response: 'A concise answer.' })
    render(<App chatService={service} />)

    await user.type(screen.getByRole('textbox', { name: /question/i }), 'What is TDS?')
    await user.click(screen.getByRole('button', { name: /ask ca buddy/i }))
    expect(await screen.findByText('A concise answer.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /new chat/i }))
    expect(screen.queryByText('What is TDS?')).not.toBeInTheDocument()
    expect(screen.queryByText('A concise answer.')).not.toBeInTheDocument()
  })
})
