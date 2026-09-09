# Data Model: CA Buddy Tax and Audit Chat

CA Buddy has no persistent data model. The following entities describe the
in-memory state required by the active browser conversation and the contracts
that tests must observe.

## ChatMessage

Represents one visible turn in the active conversation.

| Field | Type | Rules |
|---|---|---|
| `id` | opaque string | Unique within the active conversation; generated when the message is added. |
| `role` | `user` or `assistant` | User messages come from submitted questions; assistant messages come from the service result. |
| `content` | string | User content MUST be non-empty after trimming. Assistant content MUST be readable and non-empty before it is rendered as an answer. |
| `sequence` | positive integer | Increases with display order and MUST preserve user-question/answer order. |

Messages are held only in memory and are discarded on New chat, page close, or
refresh.

## ActiveConversation

Represents one ephemeral chat session.

| Field | Type | Rules |
|---|---|---|
| `id` | opaque string | Changes when New chat starts a fresh conversation. |
| `messages` | ordered list of `ChatMessage` | Contains only the current conversation's visible turns. |
| `status` | `idle`, `loading`, `answered`, `failed`, or `missing-config` | Describes the latest submission lifecycle. |
| `requestGeneration` | non-negative integer | Increases when a new chat starts so late results from an old request cannot enter the new conversation. |

## ScopeBoundary

Represents the persona's supported and escalated question classes.

| Category | Behavior |
|---|---|
| GST | Provide a concise general first explanation. |
| TDS | Provide a concise general first explanation. |
| ITR deadlines | Provide a concise general first explanation while retaining the disclaimer. |
| Audit basics | Provide a concise general first explanation. |
| Unusual, high-stakes, personalized, legal, filing, verified-record, or unrelated question | State the limitation and recommend consulting a Chartered Accountant. |

## State Transitions

```text
idle
  -> loading       non-empty question accepted
loading
  -> answered      usable answer returned
loading
  -> failed        provider or response failure
loading
  -> missing-config required configuration reported unavailable
loading
  -> idle          New chat starts before the result returns; old result ignored
answered/failed/missing-config
  -> loading       next non-empty question submitted
any state
  -> idle          New chat clears messages and creates a new conversation id
```

## Validation Rules

- Whitespace-only questions MUST be rejected before a service request.
- A user message MUST be rendered before its corresponding service request is
  awaited so the user sees their submitted question promptly.
- A loading state MUST prevent ambiguous duplicate submission behavior.
- A late result MUST be ignored when its request generation no longer matches
  the active conversation.
- No entity may be serialized to local storage, a database, or an application
  server.
