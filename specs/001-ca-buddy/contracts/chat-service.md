# ChatService Contract

This contract keeps the chat UI independent from Gemini and makes unit tests
provider-free. It is an internal application boundary, not a public HTTP API.

## Request

```ts
interface ChatService {
  sendMessage(request: ChatRequest): Promise<ChatResult>;
}

type ChatRequest = {
  question: string;
  history: readonly ChatMessage[];
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
```

Rules:

- `question` MUST be trimmed and non-empty before the UI calls the service.
- `history` MUST contain the ordered messages from the active conversation and
  MUST exclude conversations cleared by New chat.
- The service MUST NOT own persistent storage or mutate the UI's history.

## Result

```ts
type ChatResult =
  | { kind: "answer"; text: string }
  | { kind: "missing-config"; message: string };
```

Rules:

- `answer.text` MUST be non-empty and suitable for display in the chat panel.
- `missing-config.message` MUST explain that the service is unavailable because
  required configuration is missing and identify the next action.
- Provider failures and invalid/empty provider responses MUST reject with a
  user-safe error that the UI maps to the failed status.
- The production implementation sends the configured persona prompt, question,
  and history to `gemma-4-26b-a4b-it` with the 1024-token output limit.

## Implementations

- `GeminiChatService`: production adapter around LangChain.js and
  `@langchain/google-genai`.
- `FakeChatService`: deterministic test adapter that can return a configured
  answer, delay, missing-configuration result, or rejection.

## Compatibility Checks

Unit tests MUST verify that the UI sends the first turn in the second request,
that New chat sends an empty history, and that all result/error variants map to
readable UI states. End-to-end tests MUST verify the browser-level provider
request is intercepted and receives the expected history.
