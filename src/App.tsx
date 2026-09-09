import { ChatScreen } from './components/ChatScreen'
import { GeminiChatService } from './services/geminiChatService'
import type { ChatService } from './services/chatService'

interface AppProps {
  chatService?: ChatService
}

export default function App({ chatService = new GeminiChatService() }: AppProps) {
  return <ChatScreen chatService={chatService} />
}
