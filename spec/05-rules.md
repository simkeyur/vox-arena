# Rules and Implementation Constraints

## Implementation Rules

- Never tune one provider's prompt or config without applying the identical change to the others.
- Keep provider-specific code isolated in adapters.
- All measurements must be taken at the same pipeline layer for every provider.
- Keep raw run logs immutable; analysis reads, never rewrites.
- Use Pipecat v1.0+ APIs only.
- Pin model versions in config and record them in every run's metadata.
- Prefer adding a new provider by implementing the adapter contract, not by changing the agent contract.

## Optional UI Rule

If a UI is added later, it must stay thin and additive. It can launch runs and show results, but it should not own the agent logic or the provider integration.

## Coding Preference

Keep the spec stable and narrow. If a future change affects one concern only, update only the file that owns that concern.
