# Feature Specification: CA Buddy Tax and Audit Chat

**Feature Branch**: `001-ca-buddy`

**Created**: 2026-09-09

**Status**: Draft

**Input**: User description: `#file:prd.md #file:constitution.md`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Get a quick in-scope answer (Priority: P1)

A small-business owner opens CA Buddy, reads the disclaimer, and asks a concise question about GST, TDS, ITR deadlines, or audit basics. The owner receives a concise first explanation in the same conversation.

**Why this priority**: This is the core value of CA Buddy and the primary three-minute demonstration.

**Independent Test**: Start a new conversation, ask an in-scope tax or audit question, and verify that the question and a relevant answer are visible in the chat.

**Acceptance Scenarios**:

1. **Given** the user is on the CA Buddy screen, **When** the user enters a non-empty GST question and submits it, **Then** the question appears in the chat and a concise answer appears afterward.
2. **Given** the user is viewing CA Buddy, **When** the user inspects the screen before asking a question, **Then** the header, chat area, question input, new-chat control, and one-line disclaimer are visible.

---

### User Story 2 - Know when professional help is needed (Priority: P1)

A small-business owner asks about an unusual, high-stakes, personalized, or out-of-scope situation and needs a clear boundary rather than an overconfident answer. CA Buddy explains its limits and recommends consulting a Chartered Accountant.

**Why this priority**: Clear escalation reduces the risk that general educational guidance is mistaken for professional tax or legal advice.

**Independent Test**: Ask an unusual cross-state question and a high-stakes or out-of-scope question, then verify that each response identifies the limitation and recommends consulting a Chartered Accountant.

**Acceptance Scenarios**:

1. **Given** the user has an active conversation, **When** the user asks whether general guidance applies to an unusual cross-state case, **Then** the response explains the limitation and tells the user to consult a Chartered Accountant.
2. **Given** the user asks for personalized filing, legal representation, filing submission, or a calculation requiring verified records, **When** CA Buddy responds, **Then** it declines that professional task and provides the consultation recommendation.

---

### User Story 3 - Continue and reset a conversation safely (Priority: P2)

A small-business owner asks follow-up questions and expects CA Buddy to use the current conversation for context. When the owner starts a new chat, prior messages disappear and the next question starts without earlier context.

**Why this priority**: Follow-up context makes the short interaction useful, while reset behavior protects the boundary of each conversation.

**Independent Test**: Ask two questions in one conversation and inspect the second response request for the first turn; start a new chat and verify that no prior messages remain.

**Acceptance Scenarios**:

1. **Given** the user has asked and received one question-and-answer pair, **When** the user submits a follow-up question, **Then** the answer is generated with the earlier turn available as context.
2. **Given** the chat contains messages, **When** the user selects New chat, **Then** the chat panel is empty and a subsequent question begins a fresh conversation.

---

### User Story 4 - Understand service status and availability (Priority: P2)

A small-business owner needs to know whether a response is being generated, could not be generated, or cannot be generated because the service is not configured. CA Buddy communicates each state in the chat area without crashing and gives an actionable next step where appropriate.

**Why this priority**: Readable status handling keeps the short experience trustworthy when the model is delayed, unavailable, or misconfigured.

**Independent Test**: Exercise delayed, failed, and missing-configuration response conditions and verify that each state is visible, understandable, and does not terminate the chat screen.

**Acceptance Scenarios**:

1. **Given** a question has been submitted and an answer is not yet available, **When** the service is still processing, **Then** the chat shows a loading status and prevents ambiguous duplicate submission behavior.
2. **Given** the response service fails, **When** the failure is returned, **Then** the chat shows an actionable failure status and remains usable.
3. **Given** the response service has no required configuration, **When** the user submits a question, **Then** the chat explains that the service is unavailable because configuration is missing and tells the user what to do next.

### Edge Cases

- The user submits an empty or whitespace-only question; the chat MUST not create a user message or request an answer.
- The user submits a second question while the first answer is loading; the interface MUST keep message order clear and MUST not duplicate or lose a turn.
- The answer service returns an empty, malformed, or unexpectedly long answer; the chat MUST remain readable and communicate a failure when it cannot show a useful answer.
- The user starts a new chat while a response is loading; the old response MUST not appear in the new conversation.
- The user asks a question outside GST, TDS, ITR deadlines, or audit basics; CA Buddy MUST use the professional-consultation boundary instead of presenting unrelated advice as in scope.
- The user refreshes or closes the page; the active conversation is not expected to be recoverable.
- The user does not have a stable internet connection or the model provider is unavailable; the chat MUST show a failure state without crashing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The product MUST present one chat screen containing a header, chat panel, question input, New chat control, and one-line disclaimer.
- **FR-002**: The user MUST be able to submit a non-empty question and see the question appear in the current chat.
- **FR-003**: Each submitted question MUST produce either a concise answer in the chat or a readable actionable status when an answer cannot be produced.
- **FR-004**: The product MUST support general first explanations for GST, TDS, ITR deadlines, and audit basics.
- **FR-005**: For questions outside scope or requiring personalized, legal, filing, or other professional advice, the product MUST clearly state its limitation and recommend consulting a Chartered Accountant.
- **FR-006**: The product MUST include the active conversation context when processing a follow-up question, while retaining that conversation only for the current browser session.
- **FR-007**: Selecting New chat MUST remove all prior messages from the visible chat and begin a fresh conversation without prior context.
- **FR-008**: The product MUST communicate loading, response failure, and missing-configuration states in the chat panel without crashing and with an actionable next step where applicable.
- **FR-009**: The product MUST not provide guaranteed current tax advice, legal or professional representation, filing submission, document storage, or calculations requiring verified financial records.
- **FR-010**: The product MUST operate without user accounts, saved history, settings, or server-side application storage.
- **FR-011**: The CA persona, scope rules, disclaimer behavior, escalation fallback, response model, and response-length limit MUST be version-controlled and reviewable.
- **FR-012**: Automated unit and end-to-end checks MUST run for every push and pull request, and the published site MUST deploy only after the production build and all configured checks pass.
- **FR-013**: End-to-end checks MUST use a controlled model response so the acceptance scenarios do not depend on a live model response.

### Key Entities *(include if feature involves data)*

- **Chat message**: A user question or CA Buddy answer displayed in the active conversation, with its role and visible content.
- **Active conversation**: The ordered set of messages used for the current chat and discarded when the user starts a new chat or leaves the page.
- **Response status**: The current state of a submitted question, including loading, answered, failed, or unavailable because required configuration is missing.
- **Scope boundary**: The rules that distinguish supported general explanations from questions that require a Chartered Accountant.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user can complete the primary happy path, from opening the site through receiving an in-scope answer, in under three minutes.
- **SC-002**: In a review of the acceptance walkthrough, 100% of required screen elements are visible before submission and 100% of submitted non-empty questions are represented in the chat.
- **SC-003**: In controlled acceptance tests, 100% of unusual, high-stakes, personalized, legal, filing, or out-of-scope prompts display a clear recommendation to consult a Chartered Accountant.
- **SC-004**: In controlled two-turn tests, 100% of follow-up responses have access to the earlier turn, and 100% of New chat actions remove prior visible messages and context.
- **SC-005**: Loading, failure, and missing-configuration scenarios each produce a readable status without crashing in 100% of controlled acceptance tests.
- **SC-006**: Every push and pull request receives successful unit checks, end-to-end checks, and a production-build check before the published site can be updated.

## Assumptions

- Users have a modern browser and an internet connection when requesting an answer.
- The product provides general educational guidance only; users remain responsible for consulting a Chartered Accountant for decisions requiring professional advice.
- The active conversation is intentionally ephemeral and is not recoverable after a page refresh, page close, or New chat action.
- The response provider and its required configuration are available in the environments where the published experience is demonstrated.
- Automated end-to-end tests can use controlled responses so they verify user-visible behavior without relying on live provider availability.
- The initial release is limited to the five ordered implementation tasks described in the PRD; additional capabilities require a separate scope decision and constitution review.
