# Quickstart Validation: CA Buddy Tax and Audit Chat

This guide validates the feature after implementation. It intentionally uses a
controlled model response for automated checks and does not require a live
Gemini request.

## Prerequisites

- Node.js using the LTS version pinned by the project workflow.
- npm and the installed project dependencies.
- A local `.env` containing `VITE_GOOGLE_API_KEY` only when manually exercising
  the real Gemini adapter. Unit and end-to-end tests use fakes or interception.

## Install and Run

From the repository root:

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. Confirm the one-screen layout, one-line
disclaimer, question input, chat panel, and New chat control.

## Automated Validation

Run the same checks required by CI:

```bash
npm run test:unit
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

The exact script names are implementation task outputs; if the project uses a
single test command, it MUST still expose equivalent unit, build, and E2E checks
for CI.

## Latest Local Validation

Validated on 2026-09-09 with a temporary Playwright browser cache:

- `npm run test:unit`: 5 test files, 12 tests passed.
- `npm run build`: production bundle completed successfully.
- `npm run test:e2e`: 4 browser acceptance tests passed.

The GitHub Pages workflow is configured and gated on the successful validation
workflow. The published URL becomes available after the repository changes are
committed and pushed to `main`.

## Acceptance Scenarios

1. Submit `When is my next GST return due?` and verify the question and a
   concise controlled answer appear.
2. Submit an unusual cross-state question and verify the response explains the
   boundary and recommends consulting a Chartered Accountant.
3. Submit two questions and verify the second provider request includes the
   earlier turn; select New chat and verify the panel and next request contain
   no prior messages.
4. Exercise loading, provider failure, and missing-configuration responses and
   verify each status is readable and the screen remains usable.
5. Submit an empty or whitespace-only question and verify no message or service
   request is created.
6. Start a request, select New chat before it completes, and verify its late
   response does not appear in the new conversation.

## Release Gate

A change is ready for publication only when the unit checks, production build,
and Playwright checks pass on the relevant push or pull request. The Pages
workflow must publish the build only after that validation workflow succeeds.
