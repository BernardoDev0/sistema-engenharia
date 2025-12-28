# Shared utilities (`src/shared`)

The **Shared** folder contains cross-cutting, framework-agnostic pieces.

- Reusable helpers (e.g., formatting, type guards) that do not depend on React.
- Constants and tokens that are not specific to a single bounded context.

Do **not** put domain-specific logic here; keep that in the Domain or Application layers.
