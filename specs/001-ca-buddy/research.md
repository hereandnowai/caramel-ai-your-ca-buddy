# Research: CA Buddy Tax and Audit Chat

## Browser-Only Application Boundary

**Decision**: Use a React, TypeScript, and Vite single-page application with one
chat screen and conversation state held only in browser memory.

**Rationale**: This is the smallest architecture that supports the three-minute
experience, keeps deployment static, and satisfies the constitution's ban on a
backend, server, database, accounts, and saved history.

**Alternatives considered**:

- A backend service was rejected because it adds operations, authentication,
  and data-retention concerns that are outside the PRD.
- Local or IndexedDB persistence was rejected because saved history is explicitly
  out of scope and would weaken the ephemeral conversation boundary.
- A hosted prompt or session service was rejected because one version-controlled
  prompt is sufficient for this feature.

**Risk and mitigation**: A browser API key is visible to the client by design.
The implementation must avoid sending sensitive records, keep the product within
general educational guidance, use HTTPS through GitHub Pages, and document key
rotation as an operational concern rather than introducing a backend.

## Model Provider and Persona Prompt

**Decision**: Use LangChain.js with `@langchain/google-genai`, the
`gemma-4-26b-a4b-it` model, and a maximum of 1024 output tokens. Store the CA
persona, supported topics, disclaimer behavior, and Chartered Accountant
escalation rules in a version-controlled source prompt.

**Rationale**: The provider and model are fixed by the PRD and constitution.
LangChain keeps model access behind a replaceable service boundary, while a
reviewable prompt makes safety behavior and prompt changes traceable.

**Alternatives considered**:

- Direct Google SDK usage was rejected because it would couple the UI more
  tightly to one provider and bypass the required LangChain service boundary.
- A larger or more capable model was rejected because the feature needs concise,
  low-latency first explanations rather than open-ended professional work.
- A remote prompt-management system was rejected as unnecessary infrastructure
  for one small, version-controlled persona.

**Risk and mitigation**: Tax guidance can become inaccurate or outdated. Keep
answers general, display the disclaimer, escalate unusual or professional cases,
and require Chartered Accountant review of the prompt and representative answers
before release.

## ChatService Contract and Conversation Ownership

**Decision**: Define a small `ChatService` contract that accepts the current
question plus ordered active conversation context and returns an answer or a
structured error. Keep the conversation array and request-state transitions in
the UI layer. Provide a configurable fake service for unit tests and a Gemini
implementation for production.

**Rationale**: Separating request/response access from UI state makes loading,
failure, missing-configuration, reset, and context behavior deterministic. It
also prevents provider details from spreading through components.

**Alternatives considered**:

- Calling the model directly from the component was rejected because it makes
  unit tests provider-dependent and mixes rendering with integration behavior.
- Putting conversation state inside the service was rejected because New chat
  must synchronously clear visible state and the service should remain a
  request/response boundary.
- Persisting context in browser storage was rejected by the constitution.

**Resolved design defaults**:

- The UI owns ordered user and assistant messages.
- New chat creates a fresh active conversation identity and ignores late results
  belonging to the previous one.
- An empty or whitespace-only question is rejected before calling the service.
- The fake service can delay, return a response, reject, or report missing
  configuration so every required UI state is testable.

## Unit and End-to-End Testing

**Decision**: Use Vitest and Testing Library for deterministic unit behavior, and
Playwright for browser acceptance flows. Unit tests use the fake service. E2E
tests use Playwright's page-level network routing to intercept Gemini requests and
return controlled responses; they must not call the live provider.

**Rationale**: This directly satisfies the constitution and FR-013 while keeping
CI fast, repeatable, and independent of quota, latency, and model drift.

**Alternatives considered**:

- Live Gemini calls in CI were rejected because they create flakiness, cost, and
  external availability dependencies.
- SDK-level stubbing alone was rejected for E2E because it would not verify the
  browser's actual request boundary.
- Omitting E2E tests was rejected because the acceptance walkthrough and gated
  delivery require browser-level evidence.

**Resolved test defaults**:

- Run E2E in headless Chromium first; cross-browser coverage is outside this
  five-task release unless a later constitution amendment expands scope.
- Route the provider request at the browser page boundary and assert the second
  request contains the earlier turn, rather than depending only on rendered text.
- Use explicit bounded waits for loading and response states; do not use sleeps.
- Test missing-key behavior through the fake service/unit configuration and use
  a safe dummy key for intercepted browser tests.

## CI and GitHub Pages Delivery

**Decision**: Run one GitHub Actions validation workflow on every push and pull
request. It installs dependencies with a pinned current Node LTS runtime, runs
unit tests, builds the production bundle, and runs Playwright tests. A dependent
Pages deployment job uses the official GitHub Pages actions and runs only after
validation succeeds.

**Rationale**: This enforces the constitution's gated delivery rule and keeps
static hosting aligned with the browser-only architecture. Pinning one LTS
runtime reduces local/CI drift without creating a second supported runtime.

**Alternatives considered**:

- A community Pages publishing action was rejected in favor of GitHub's official
  Pages artifact and deployment actions.
- A separate deployment trigger without a dependency was rejected because it
  could publish an untested build.
- A backend or container deployment was rejected because it violates the product
  boundary.

**Resolved workflow defaults**:

- Use a single validation workflow for push and pull-request checks.
- Provide the Gemini key as a masked Actions secret at build time, while tests
  intercept provider calls and do not spend model quota.
- Keep the deployment job dependent on the validation job and grant only the
  Pages artifact/deployment permissions it needs.
- Record the selected Node LTS and action versions in the workflow when task 1
  and task 5 are implemented.

## Deferred Risks

- The constitution's original ratification date remains a documentation TODO;
  it does not block feature planning.
- Provider behavior, tax-law accuracy, and key exposure require review before
  production release; none justify adding out-of-scope persistence or backend
  infrastructure.
- No live-provider integration test is planned because the PRD explicitly
  requires controlled model behavior in automated end-to-end checks.
