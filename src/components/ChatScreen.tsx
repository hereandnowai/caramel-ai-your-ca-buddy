import { useRef, useState } from 'react'
import { CA_DISCLAIMER } from '../prompts/caPersona'
import type { ChatService } from '../services/chatService'
import type { ChatMessage, ChatStatus } from '../types/chat'
import { MessageList } from './MessageList'
import { QuestionForm } from './QuestionForm'

interface ChatScreenProps {
  chatService: ChatService
}

function makeMessage(role: ChatMessage['role'], content: string, sequence: number): ChatMessage {
  return {
    id: `${role}-${sequence}-${crypto.randomUUID()}`,
    role,
    content,
    sequence,
  }
}

export function ChatScreen({ chatService }: ChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<ChatStatus>('idle')
  const [statusMessage, setStatusMessage] = useState<string>()
  const generation = useRef(0)

  async function handleSubmit(question: string) {
    if (status === 'loading') return

    const currentGeneration = generation.current
    const history = messages.map(({ role, content }) => ({ role, content }))
    const userMessage = makeMessage('user', question, messages.length + 1)
    setMessages((current) => [...current, userMessage])
    setStatus('loading')
    setStatusMessage(undefined)

    try {
      const result = await chatService.sendMessage({ question, history })
      if (currentGeneration !== generation.current) return

      if (result.kind === 'missing-config') {
        setStatus('missing-config')
        setStatusMessage(result.message)
        return
      }

      setMessages((current) => [
        ...current,
        makeMessage('assistant', result.text, current.length + 1),
      ])
      setStatus('answered')
    } catch (error) {
      if (currentGeneration !== generation.current) return
      setStatus('failed')
      setStatusMessage(
        error instanceof Error
          ? `We couldn't get an answer. ${error.message}`
          : "We couldn't get an answer. Please try again.",
      )
    }
  }

  function handleNewChat() {
    generation.current += 1
    setMessages([])
    setStatus('idle')
    setStatusMessage(undefined)
  }

  return (
    <main className="app-shell">
      <header className="site-header" role="banner">
        <div className="brand-lockup">
          <span className="brand-lockup__eyebrow">Caramel AI / India</span>
          <h1>CA Buddy</h1>
        </div>
        <button className="new-chat-button" type="button" onClick={handleNewChat}>
          <span aria-hidden="true">+</span>
          <span>New chat</span>
        </button>
      </header>

      <section className="intro-band" aria-labelledby="intro-title">
        <div>
          <p className="kicker">A calm first answer for busy founders</p>
          <h2 id="intro-title">Make the next tax question<br /><em>less intimidating.</em></h2>
        </div>
        <p className="intro-band__note">Grounded in everyday Indian tax and audit basics.<br />Clear about when a CA should take over.</p>
      </section>

      <section className="chat-card" aria-label="CA Buddy chat">
        <div className="chat-card__topline">
          <span className="online-indicator"><span aria-hidden="true" /> Ready for a question</span>
          <span className="chat-card__topic">GST · TDS · ITR · Audit</span>
        </div>
        <MessageList messages={messages} status={status} statusMessage={statusMessage} />
        <QuestionForm disabled={status === 'loading'} onSubmit={handleSubmit} />
      </section>

      <p className="disclaimer">{CA_DISCLAIMER}</p>
    </main>
  )
}
