# Agent and Evaluation

## Agent

- Persona: FAQ bot for a fictional vegetarian restaurant called Saffron Leaf.
- Menu is strictly vegetarian, with no onion and no garlic.
- The agent should be useful, factual, and constrained.

## Shared Prompt

Use one shared system prompt file for every provider. The prompt must be byte-identical across providers unless the same change is applied everywhere.

## Shared Tools

All providers must expose the same JSON schemas.

1. `lookup_menu(category)` returns items from a static JSON menu.
2. `get_hours(day)` returns hours from a static table.
3. `check_reservation_availability(date, time, party_size)` returns deterministic fake availability.

## Test Script

The benchmark uses 20 scripted utterances:

- Simple FAQ turns
- Tool-call triggers
- Interruptions
- Ambiguous or mumbled speech
- Code-switching
- Constraint probes

Each utterance should be stored in `utterances.yaml` with expected outcomes.

Example:

```yaml
- id: u07
  text: "Can I book a table for six tomorrow at seven pm"
  expect:
    tool: check_reservation_availability
    args: { party_size: 6, time: "19:00" }
```

## Metrics

Measure per turn and per run.

- Time-to-first-audio
- Tool-call accuracy
- Interruption stop latency
- Transcript fidelity
- Hallucination count
- Cost per conversation

## Instrumentation Constraint

Use transport-layer timestamps for every provider. Do not compare one provider at the service layer and another at the observer layer.

Pipecat's `GeminiLiveLLMService` does not emit `UserStartedSpeakingFrame` or `UserStoppedSpeakingFrame` with default server-side VAD, so turn-based observers can be asymmetric. Fix this with a custom transport-boundary logger or locally-driven turn detection before doing real runs.

## Review Loop

Each reviewer should do one narrow job only:

1. Tool accuracy reviewer: transcript + tool-call log + ground truth YAML.
2. Hallucination reviewer: transcript + menu/hours JSON.
3. Failure-pattern comparator: scored results from both providers.
