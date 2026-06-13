# Goals and Principles

## Goals

1. Build one boring-on-purpose voice agent on Pipecat v1.0+.
2. Run it against multiple realtime providers with everything else held constant.
3. Drive every provider with the same pre-recorded audio script.
4. Collect symmetric metrics across repeated runs.
5. Use narrow-scope reviewers to score transcripts against ground truth.
6. Publish a clear comparison writeup.

## Non-Goals

- Production deployment, auth, multi-user support.
- Prompt-tuning one provider after the first run while leaving the other unchanged.
- Telephony. This stays local and reproducible.

## Design Principles

- Keep the app provider-agnostic at the core: model and vendor selection should live in config and adapters, not in agent logic.
- Make the comparison fair by sharing one prompt, one tool schema, one transcript format, and one metric pipeline.
- Treat transport, provider, and analysis as separate layers so each can evolve independently.
- Prefer boring, explicit interfaces over clever abstractions; the main goal is easy swapping later, not framework novelty.
- Record every run with a manifest that includes provider, model, version, prompt hash, tool schema hash, and transport settings.

## Success Definition

The app is successful if a new provider can be added by implementing the provider contract and wiring a config entry, without changing the agent contract or the harness contract.
