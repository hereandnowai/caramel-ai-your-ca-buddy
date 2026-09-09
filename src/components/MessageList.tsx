import type { ChatMessage, ChatStatus } from '../types/chat'

interface MessageListProps {
  messages: ChatMessage[]
  status: ChatStatus
  statusMessage?: string
}

const statusCopy: Partial<Record<ChatStatus, string>> = {
  loading: 'CA Buddy is thinking...',
  failed: 'I could not complete that response. Please try again.',
  'missing-config': 'The answer service is not configured yet. Check the setup message above and try again after configuration.',
}

export function MessageList({ messages, status, statusMessage }: MessageListProps) {
  return (
    <div className="conversation" role="log" aria-label="Conversation" aria-live="polite">
      {messages.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__mark" aria-hidden="true">*</span>
          <p>Ask a practical question about GST, TDS, ITR deadlines, or audit basics.</p>
        </div>
      ) : (
        messages.map((message) => (
          <article
            className={`message message--${message.role}`}
            data-message-role={message.role}
            key={message.id}
          >
            <span className="message__label">{message.role === 'user' ? 'You' : 'CA Buddy'}</span>
            <p>{message.content}</p>
          </article>
        ))
      )}
      {status !== 'idle' && status !== 'answered' && (
        <div className={`status status--${status}`} role="status">
          <span className="status__dot" aria-hidden="true" />
          <span>{statusMessage ?? statusCopy[status]}</span>
        </div>
      )}
    </div>
  )
}
