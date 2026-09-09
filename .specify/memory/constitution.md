<!--
Sync Impact Report
- Version change: unratified scaffold -> 1.0.0
- Modified principles: five scaffold placeholders -> User-Safe Scope and Escalation;
	Browser-Only Minimal Architecture; Testable Service Contracts; Prompt and
	Conversation Boundaries; Gated, Traceable Delivery
- Added sections: Technical and Product Constraints; Development Workflow and Quality Gates
- Removed sections: none
- Follow-up TODOs: confirm the original ratification date.
-->

# CA Buddy Constitution

## Core Principles

### I. User-Safe Scope and Escalation
CA Buddy MUST provide only concise first explanations for GST, TDS, ITR
deadlines, and audit basics. It MUST clearly state its limitations and direct
users to consult a Chartered Accountant for questions outside that scope,
high-stakes decisions, unusual cases, personalized filing, legal or
professional representation, or advice requiring verified financial records.
This protects users from treating an educational chatbot as professional advice.

### II. Browser-Only Minimal Architecture
The product MUST remain a React, TypeScript, and Vite single-page application
with one chat screen and local in-memory conversation state. It MUST NOT add a
backend, server, database, login, saved history, settings, document storage,
or unrelated features. The browser MAY call Google Gemini directly through
LangChain.js using `VITE_GOOGLE_API_KEY`; no application layer may persist the
conversation beyond the active browser session.

### III. Testable Service Contracts
Model access MUST pass through a `ChatService` interface. A fake service MUST
be available for tests, and UI behavior MUST be testable without live model
access. Unit tests MUST cover rendering, non-empty submission, returned
answers, conversation context, new-chat reset, loading, model failure, and
missing-key states. This keeps product behavior deterministic and makes the
provider replaceable.

### IV. Prompt and Conversation Boundaries
The CA persona, scope rules, disclaimer behavior, escalation fallback, model
name, and output-token limit MUST be version-controlled and reviewable. Each
request MUST include the current conversation context needed for the active
chat, while a new chat MUST begin with no prior messages. The implementation
MUST use `gemma-4-26b-a4b-it` with a maximum of 1024 output tokens unless this
constitution is amended.

### V. Gated, Traceable Delivery
Every user-visible behavior MUST have a corresponding test or an explicit
documented reason why testing is impossible. Unit and Playwright end-to-end
tests MUST run on every push and pull request, with Gemini requests
intercepted in end-to-end tests. The production build MUST succeed before
deployment, and GitHub Pages deployment MUST be blocked unless all configured
tests pass. Product work MUST follow the five ordered implementation tasks,
with one GitHub issue and one pull request per task.

## Technical and Product Constraints

- The supported audience is small-business owners in India seeking a quick
	first explanation, not a substitute for a Chartered Accountant.
- The interface MUST contain one screen with a header, chat panel, question
	input, `New chat` control, and one-line disclaimer.
- The application MUST read the Gemini key from `VITE_GOOGLE_API_KEY`; local
	development uses a local `.env`, while CI supplies the value through a
	GitHub Actions secret.
- The system MUST communicate loading, model failure, and missing-key states
	in the chat panel without crashing and with an actionable next step.
- The application MUST not claim guaranteed current tax advice, perform filing
	submission, calculate from verified financial records, or provide legal or
	professional representation.

## Development Workflow and Quality Gates

- Changes MUST preserve the `ChatService` contract and use the fake service
	for unit-level behavior tests.
- Playwright tests MUST verify the acceptance walkthrough, including an
	in-scope question, escalation for an unusual or high-stakes question, two
	turns of conversation memory, new-chat clearing, and readable error states.
- Pull requests MUST demonstrate the relevant tests and production build
	results before merge or deployment.
- A change that expands scope, stores user data, introduces a server, or
	changes provider/model limits MUST be proposed as a constitution amendment
	before implementation.

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

This constitution supersedes conflicting project practices for CA Buddy.
Amendments MUST state the affected principles, the reason for the change, the
expected migration or test impact, and the new semantic version. A pull
request review MUST verify scope, privacy, service-contract, prompt, testing,
and deployment compliance. Any exception MUST be documented in the pull
request and approved before implementation.

Versioning follows semantic versioning: MAJOR for incompatible governance or
principle removal or redefinition, MINOR for a new principle or materially
expanded requirement, and PATCH for clarifications or non-semantic wording
changes. The constitution MUST receive a compliance review whenever a feature
is proposed and before release. The ratification date remains unresolved:
TODO(RATIFICATION_DATE): record the original adoption date when confirmed.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2026-09-09
