# Implementation Plan: CA Buddy Tax and Audit Chat

**Branch**: `001-ca-buddy` | **Date**: 2026-09-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-ca-buddy/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

CA Buddy is a single-screen browser chatbot for small-business owners in India.
It provides concise first explanations for GST, TDS, ITR deadlines, and audit
basics, and clearly escalates unusual, high-stakes, personalized, legal, or
filing questions to a Chartered Accountant. The implementation keeps the UI
independent from model access through a `ChatService`, uses a version-controlled
CA persona prompt, retains conversation state only in memory, and validates the
full experience with deterministic unit and end-to-end tests before publishing
the static site.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript with React and Vite; exact compatible package
versions are pinned in the lockfile during setup.

**Primary Dependencies**: React, Vite, `@langchain/google-genai`, LangChain.js,
Vitest, Testing Library, and Playwright.

**Storage**: None; the active conversation exists only in browser memory.

**Testing**: Vitest + Testing Library for unit behavior; Playwright with
controlled Gemini request interception for end-to-end behavior.

**Target Platform**: Modern browsers served as a static GitHub Pages site.

**Project Type**: Frontend single-page web application.

**Performance Goals**: The primary user can complete the happy path in under
three minutes; loading and failure states remain visible and responsive while
the model request is pending.

**Constraints**: No backend, server, database, account, saved history, or
settings. Read `VITE_GOOGLE_API_KEY` from environment configuration, call
`gemma-4-26b-a4b-it` through LangChain.js, cap output at 1024 tokens, and keep
the prompt and active conversation within the browser-only scope.

**Scale/Scope**: One screen, four user journeys, five ordered implementation
tasks, one active conversation, and no persistent user data.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. User-Safe Scope and Escalation**: PASS. The plan limits answers to the
  four named tax and audit areas and includes explicit Chartered Accountant
  escalation for out-of-scope or professional-advice requests.
- **II. Browser-Only Minimal Architecture**: PASS. The planned system is a
  static React/Vite SPA with in-memory state and no backend or persistence.
- **III. Testable Service Contracts**: PASS. `ChatService` remains the model
  boundary, with a deterministic fake for unit tests and controlled responses
  for browser tests.
- **IV. Prompt and Conversation Boundaries**: PASS. The persona prompt is
  version-controlled; requests carry active context; New chat clears it; the
  required model and token limit remain fixed.
- **V. Gated, Traceable Delivery**: PASS. Unit tests, build, and Playwright
  checks run on push and pull request, and Pages deployment depends on all
  checks passing. The five-task sequence remains unchanged.

**Post-design re-check**: PASS. The research and design artifacts preserve all
five principles: they add no persistence or backend, keep model access behind
the required contract, keep persona and limits reviewable, define deterministic
test seams, and make publication depend on the complete validation workflow.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── App.tsx
├── components/
│   ├── ChatScreen.tsx
│   ├── MessageList.tsx
│   └── QuestionForm.tsx
├── prompts/
│   └── caPersona.ts
├── services/
│   ├── chatService.ts
│   ├── fakeChatService.ts
│   └── geminiChatService.ts
└── types/
  └── chat.ts

tests/
├── unit/
│   ├── App.test.tsx
│   ├── fakeChatService.test.ts
│   └── geminiChatService.test.ts
└── e2e/
  └── chat-buddy.spec.ts

.github/workflows/
├── ci.yml
└── deploy-pages.yml
```

**Structure Decision**: Use one Vite frontend with a small component layer,
one service boundary, one version-controlled persona prompt, and colocated
unit and end-to-end test roots. CI is split between validation and a dependent
GitHub Pages deployment workflow so publishing cannot bypass the quality gate.

## Complexity Tracking

No constitutional violations were identified, so no complexity exceptions are
required.
