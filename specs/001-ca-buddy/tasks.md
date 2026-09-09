# Tasks: CA Buddy Tax and Audit Chat

**Input**: Design documents from `/specs/001-ca-buddy/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), and [contracts/](contracts/)

**Tests**: Required by the feature specification and constitution. Unit tests use a fake service; Playwright tests intercept Gemini requests.

**Organization**: Tasks are grouped by user story, while the five mandated implementation tasks define the issue and pull-request boundaries.

## Delivery Boundaries

The following five ordered groups are each implemented as one GitHub issue and
one pull request. A later group MUST NOT merge before the preceding group is
validated.

1. **Delivery Task 1**: UI shell, unit tests, and initial CI validation (`T001`-`T010`).
2. **Delivery Task 2**: `ChatService`, Gemini adapter, and fake service (`T011`-`T015`).
3. **Delivery Task 3**: CA persona, scope fallback, disclaimer, and conversation memory (`T016`-`T020`).
4. **Delivery Task 4**: Playwright tests with intercepted Gemini calls, wired into CI (`T021`-`T024`).
5. **Delivery Task 5**: GitHub Pages deployment gated on validation (`T025`-`T027`).

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Vite frontend and test runners needed by every user story.

- [X] T001 Initialize the React/TypeScript/Vite project files and npm scripts in `package.json`, `index.html`, `src/main.tsx`, `tsconfig.json`, and `tsconfig.app.json`.
- [X] T002 Configure Vite, Vitest, and Playwright entry points in `vite.config.ts`, `vitest.config.ts`, and `playwright.config.ts` with headless Chromium as the initial E2E target.
- [X] T003 [P] Add shared browser environment typing and base application styles in `src/vite-env.d.ts` and `src/styles.css`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared in-memory types and deterministic test setup before story implementation.

**Checkpoint**: Foundation ready; user-story implementation can proceed in the prescribed delivery order.

- [X] T004 [P] Define `ChatMessage`, `ActiveConversation`, response-status, and scope-boundary types in `src/types/chat.ts` from `data-model.md`.
- [X] T005 [P] Configure Testing Library cleanup, DOM matchers, and shared test helpers in `tests/setup.ts` and `tests/unit/testUtils.ts`.
- [X] T006 [P] Add the initial CI validation job skeleton for dependency installation and artifact-safe environment setup in `.github/workflows/ci.yml`.

---

## Phase 3: User Story 1 - Get a quick in-scope answer (Priority: P1) MVP

**Goal**: Deliver the single-screen CA Buddy shell where a user can submit a non-empty question and see a deterministic answer in the chat.

**Independent Test**: Render the app with a test service, verify all required landmarks and disclaimer, submit a GST question, and assert the question and answer appear.

### Tests for User Story 1

- [X] T007 [US1] Write failing unit tests for required landmarks, disclaimer, non-empty submission, user-message rendering, and answer rendering in `tests/unit/App.test.tsx`.

### Implementation for User Story 1

- [X] T008 [US1] Implement the one-screen shell and message rendering in `src/App.tsx`, `src/components/ChatScreen.tsx`, `src/components/MessageList.tsx`, and `src/components/QuestionForm.tsx` using an injected deterministic response stub.
- [X] T009 [P] [US1] Complete push and pull-request unit/build checks in `.github/workflows/ci.yml` and expose the matching npm scripts in `package.json`.
- [X] T010 [US1] Run the User Story 1 unit suite and production build, then record the passing commands and expected landmarks in `specs/001-ca-buddy/quickstart.md`.

**Checkpoint**: The shell is independently demonstrable with controlled answers; no live model access is required.

---

## Phase 4: User Story 2 - Know when professional help is needed (Priority: P1)

**Goal**: Add the replaceable model boundary and production Gemini adapter so CA Buddy can return controlled or live answers while preserving the future escalation behavior.

**Independent Test**: Exercise the service contract with a fake answer, missing configuration, and rejection; verify the UI receives the correct result or error without a provider call in unit tests.

### Tests for User Story 2

- [X] T011 [US2] Write failing service contract tests for request history, answer results, missing configuration, rejection, and empty-response handling in `tests/unit/chatService.test.ts`.

### Implementation for User Story 2

- [X] T012 [US2] Define the `ChatService`, `ChatRequest`, `ChatResult`, and typed service-error contract in `src/services/chatService.ts` to match `contracts/chat-service.md`.
- [X] T013 [US2] Implement the configurable deterministic fake service in `src/services/fakeChatService.ts` with delay, answer, missing-config, and rejection modes.
- [X] T014 [US2] Implement the LangChain Gemini adapter in `src/services/geminiChatService.ts` using `VITE_GOOGLE_API_KEY`, `gemma-4-26b-a4b-it`, and the 1024-token output limit.
- [X] T015 [US2] Wire the production and fake service implementations into `src/App.tsx` and add adapter configuration tests in `tests/unit/geminiChatService.test.ts` without making live network calls.

**Checkpoint**: The model boundary is replaceable, deterministic in tests, and ready for persona and conversation-context integration.

---

## Phase 5: User Story 3 - Continue and reset a conversation safely (Priority: P2)

**Goal**: Add the reviewed CA persona, scope fallback, disclaimer, ordered context, New chat reset, and late-response protection.

**Independent Test**: Make two turns, assert the second request includes the first turn, trigger New chat, and assert visible messages and subsequent history are empty.

### Tests for User Story 3

- [X] T016 [US3] Write failing unit tests for the CA persona prompt, supported topics, consultation fallback, two-turn history, New chat reset, and stale-result protection in `tests/unit/caPersona.test.ts` and `tests/unit/chatConversation.test.tsx`.

### Implementation for User Story 3

- [X] T017 [US3] Add the version-controlled persona, disclaimer, supported GST/TDS/ITR/audit scope, and Chartered Accountant fallback in `src/prompts/caPersona.ts`.
- [X] T018 [US3] Update the Gemini adapter to send the persona prompt and ordered active history while preserving the model and token limits in `src/services/geminiChatService.ts`.
- [X] T019 [US3] Implement in-memory message ordering, loading/answered/error state transitions, and New chat generation guards in `src/components/ChatScreen.tsx` and `src/types/chat.ts`.
- [X] T020 [US3] Integrate the disclaimer, scope-aware response display, and fresh-conversation behavior in `src/App.tsx`, `src/components/MessageList.tsx`, and `src/components/QuestionForm.tsx`.

**Checkpoint**: The core CA Buddy conversation is scoped, contextual, resettable, and safe against late responses.

---

## Phase 6: User Story 4 - Understand service status and availability (Priority: P2)

**Goal**: Make loading, provider failure, and missing-configuration states readable in the chat and prove the acceptance walkthrough in a controlled browser.

**Independent Test**: Run Playwright with Gemini requests intercepted and verify in-scope answer, escalation, two-turn context, New chat, loading, failure, and missing-configuration states.

### Tests for User Story 4

- [X] T021 [US4] Write the failing Playwright acceptance scenarios and Gemini route fixture in `tests/e2e/chat-buddy.spec.ts` for the controlled in-scope, escalation, context, reset, and status flows.

### Implementation for User Story 4

- [X] T022 [US4] Complete readable loading, failed, missing-configuration, empty-response, and retry/next-step states in `src/components/ChatScreen.tsx`, `src/components/MessageList.tsx`, and `src/services/fakeChatService.ts`.
- [X] T023 [US4] Add page-level Gemini request interception, request-history assertions, bounded waits, and Chromium setup in `tests/e2e/chat-buddy.spec.ts` and `playwright.config.ts`.
- [X] T024 [US4] Run Playwright in CI with a safe dummy key and controlled network responses in `.github/workflows/ci.yml`, keeping live Gemini calls disabled.

**Checkpoint**: The full acceptance walkthrough is deterministic and runs as a required CI check.

---

## Phase 7: Polish & Cross-Cutting Delivery

**Purpose**: Publish the static application only after the complete validation workflow succeeds.

- [X] T025 Configure GitHub Pages artifact upload and dependent deployment permissions in `.github/workflows/deploy-pages.yml` so deployment requires successful `ci.yml` completion.
- [X] T026 Configure the Vite base path and static asset handling for the repository's GitHub Pages URL in `vite.config.ts` and `.github/workflows/deploy-pages.yml`.
- [X] T027 Run every local command in `specs/001-ca-buddy/quickstart.md`, verify the configured Pages release gate, and document publication prerequisites in `specs/001-ca-buddy/quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 -> T002; T003 can run after T001 and is parallelizable with T002.
- **Foundational (Phase 2)**: T004-T006 depend on the setup and block user-story work.
- **User Story 1 (Phase 3)**: T007 -> T008; T009 can proceed in parallel with T008 after T002; T010 follows T008-T009.
- **User Story 2 (Phase 4)**: T011 -> T012 -> T013/T014 -> T015.
- **User Story 3 (Phase 5)**: T016 -> T017/T018/T019/T020 in the listed dependency order; T018 depends on T014 and T019-T020 depend on T008 and T015.
- **User Story 4 (Phase 6)**: T021 -> T022 -> T023 -> T024; T022 depends on T019-T020.
- **Polish (Phase 7)**: T025 -> T026 -> T027; all prior phases must pass first.

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Setup and Foundational; no later story is required for its shell and controlled-answer checkpoint.
- **User Story 2 (P1)**: Follows US1 because the mandated Delivery Task 2 adds the service boundary to the delivered shell.
- **User Story 3 (P2)**: Depends on US2's service contract and adapter; it is the mandated Delivery Task 3 persona/memory increment.
- **User Story 4 (P2)**: Depends on US3's complete UI states and context behavior; it is the mandated Delivery Task 4 browser-validation increment.
- **Pages delivery**: Depends on US4 and all validation checks; it is the mandated Delivery Task 5 release increment.

### Parallel Opportunities

- T003 can run alongside T002 after T001.
- T004 and T005 can run in parallel after T002; T006 can run in parallel once the package scripts exist.
- T009 can run alongside T008 because it changes only the workflow and package scripts after setup.
- Within each story, test authoring is intentionally first and implementation is sequential where files overlap.
- No user stories are run in parallel in the default plan because the constitution and PRD require five ordered issue/PR boundaries.

## Parallel Example: Foundational Setup

```text
After T002:
- T003: environment typing and base styles in src/vite-env.d.ts and src/styles.css
- T004: shared chat types in src/types/chat.ts
- T005: test setup in tests/setup.ts and tests/unit/testUtils.ts
- T006: CI skeleton in .github/workflows/ci.yml
```

## Parallel Example: User Story 1

```text
After T007's failing tests are written:
- T008: UI shell in src/App.tsx and src/components/
- T009: validation workflow completion in .github/workflows/ci.yml and package.json
```

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Setup and Foundational phases.
2. Complete Delivery Task 1: UI shell, unit tests, and initial CI.
3. Complete Delivery Task 2's service boundary and adapter so the P1 answer flow has a production path.
4. Stop and validate US1 independently with the fake service and production build.

The first usable MVP is US1 plus the minimum service work required to answer a
question. Persona safety, full context/reset behavior, E2E coverage, and Pages
publishing follow as ordered increments.

### Incremental Delivery

1. Delivery Task 1: show the shell and deterministic answer flow.
2. Delivery Task 2: replace the stub with the tested ChatService and Gemini adapter.
3. Delivery Task 3: add persona safety, disclaimer, context, and New chat.
4. Delivery Task 4: prove the browser acceptance walkthrough in CI.
5. Delivery Task 5: publish only the validated static build.

### Issue and Pull-Request Strategy

Open exactly one issue and one pull request for each Delivery Task 1 through 5.
Each pull request must pass the checks available at that delivery boundary and
must not introduce backend storage, authentication, saved history, or unrelated
features.

## Notes

- Every task uses the required `- [ ] T###` format; `[P]` appears only where files and dependencies permit parallel work.
- `[US1]` through `[US4]` map directly to the four user stories in `spec.md`.
- Tests are included because the spec and constitution explicitly require unit, contract, and end-to-end coverage.
- Each task names at least one concrete repository path and is intended to be executable without additional design context.
