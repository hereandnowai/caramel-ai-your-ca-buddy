# CA Buddy PRD

## One paragraph
CA Buddy is a frontend-only chatbot for small-business owners that answers everyday Indian tax and audit questions about GST, TDS, ITR deadlines, and audit basics, while clearly telling users when to consult a Chartered Accountant. It provides a simple, approachable three-minute experience: ask a question, receive a concise answer grounded in the CA persona and scope rules, and see a clear escalation when the question needs professional advice.

## User
A small-business owner in India who needs a quick first explanation of GST, TDS, ITR deadlines, or audit basics, but may not know whether a Chartered Accountant is needed.

## Happy path (this is the three-minute demo)
The user opens CA Buddy, reads the one-line disclaimer, types “When is my next GST return due?”, submits the question, and sees a clear answer in the chat panel. They then ask “Does this apply to my unusual cross-state case?” and CA Buddy explains its limits and says to consult a Chartered Accountant. The user clicks “New chat,” sees the conversation cleared, and asks one final audit-basics question.

## Out of scope
- Frontend only. React + TypeScript + Vite. No backend, no server, no database. The browser calls Google Gemini directly through LangChain.js (@langchain/google-genai). The API key is read from VITE_GOOGLE_API_KEY — a local .env during development, a GitHub Actions secret when built in CI.
- No login, no saved history, no settings.
- No personalized tax filing, legal or professional representation, filing submission, calculations requiring verified financial records, document storage, or guaranteed current tax advice.
- No features beyond the exactly five implementation tasks below.

## Architecture
A React + TypeScript + Vite single-page application contains one chat screen, local in-memory conversation state, a `ChatService` interface, a LangChain.js Google Gemini implementation, and a fake implementation for tests. The browser reads `VITE_GOOGLE_API_KEY` and calls Gemini directly through `@langchain/google-genai`; there is no backend, server, or database. GitHub Actions runs unit and end-to-end tests and deploys the built static site to GitHub Pages only after all tests pass.

## Functional requirements FR-1 to FR-8, each testable
- **FR-1:** The app displays a single screen with a header, one chat panel, an input, a “New chat” button, and a one-line disclaimer. **Test:** render the app and assert each element is present.
- **FR-2:** A user can submit a non-empty question and see their question appear in the chat panel. **Test:** enter text, submit, and assert the user message is rendered.
- **FR-3:** A submitted question is sent through `ChatService`, and the returned answer appears in the chat panel. **Test:** use the fake service and assert the rendered answer matches its response.
- **FR-4:** The app sends the conversation context needed for the current chat to the model, while retaining it only in browser memory. **Test:** make two turns with a fake service and assert the second request includes the first turn.
- **FR-5:** The CA persona answers in scope for GST, TDS, ITR deadlines, and audit basics, and gives a “consult a CA” fallback for questions outside scope or requiring professional advice. **Test:** fake responses for in-scope and escalation cases and assert the expected answer path is shown.
- **FR-6:** Clicking “New chat” clears the current conversation from the chat panel and starts a fresh in-memory conversation. **Test:** create a message, click the button, and assert no prior messages remain.
- **FR-7:** The app handles loading, model failure, and missing API-key states without crashing and communicates an actionable status in the chat panel. **Test:** configure the fake service to delay, reject, and report missing configuration, then assert each state is rendered.
- **FR-8:** Unit and end-to-end test commands run in GitHub Actions on every push and pull request, and GitHub Pages deployment runs only after all tests pass. **Test:** inspect the workflow and run the configured test commands in CI.

## The model (provider, model name, where the system prompt lives, max tokens)
- **Provider:** Google Gemini through LangChain.js `@langchain/google-genai`.
- **Model name:** `gemma-4-26b-a4b-it` (Gemma 4 26B A4B instruction-tuned).
- **System prompt:** A version-controlled file in the frontend source, such as `src/prompts/caPersona.ts`, containing the CA persona, scope rules, “consult a CA” fallback, and disclaimer behavior.
- **Max tokens:** `1024` output tokens per response.

## Quality gates
Unit tests use Vitest + Testing Library with the model faked. End-to-end tests use Playwright with the Gemini request intercepted. Both run in GitHub Actions on every push and pull request. The production build must succeed, and GitHub Pages deployment is blocked unless all tests pass.

## The five tasks
Exactly five tasks build the whole app, in this order, one GitHub issue and one pull request each:

1. Chat UI shell, unit tests, and the CI workflow that runs them.
2. ChatService interface; LangChain + Gemini implementation; a fake implementation for tests.
3. The CA persona: system prompt in a file, scope rules, “consult a CA” fallback, disclaimer, conversation memory.
4. Playwright end-to-end tests with the Gemini call intercepted, wired into CI.
5. GitHub Pages deployment, gated on all tests passing.

## Acceptance walkthrough
1. Open the GitHub Pages site and verify the one-screen layout: header, chat panel, input, “New chat” button, and one-line disclaimer.
2. Ask an in-scope GST question and verify the fake/intercepted model contract produces an answer in the chat panel.
3. Ask an out-of-scope or high-stakes question and verify CA Buddy tells the user to consult a Chartered Accountant.
4. Ask two questions in one chat and verify conversation memory is included; click “New chat” and verify the panel is empty.
5. Verify loading, failure, and missing-key states are readable and non-crashing.
6. Verify unit tests and Playwright tests pass on push and pull request, then verify GitHub Pages deploys only after those tests pass.
