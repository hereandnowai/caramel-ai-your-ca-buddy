# UI Acceptance Contract

The application exposes one screen with stable, user-visible landmarks and
states. These names are behavior contracts for unit and Playwright tests.

## Required Landmarks

- Header identifies CA Buddy.
- One chat panel contains ordered user, assistant, and status messages.
- Question input accepts the next question.
- Submit control sends a non-empty question.
- New chat control clears the active conversation.
- One-line disclaimer remains visible on the screen.

## Required Statuses

| Status | Required user-visible behavior |
|---|---|
| Loading | Shows that the answer is being generated and avoids ambiguous duplicate submission. |
| Answered | Shows the returned concise answer after the user's question. |
| Failed | Explains that the response could not be generated and gives an actionable retry/next step. |
| Missing configuration | Explains that the service is not configured and gives an actionable setup/contact next step. |

## Scope Behavior

An in-scope question produces a concise first explanation. An unusual,
high-stakes, personalized, legal, filing, verified-record, or unrelated
question produces a limitation and recommends consulting a Chartered Accountant.

## Reset Behavior

New chat removes all prior visible messages immediately, creates a fresh active
conversation, and prevents a late response from the previous conversation from
appearing in the new chat.
