# Identity Infrastructure Layer (`src/core/infrastructure/identity`)

The **Identity** infrastructure layer provides technical implementations for Identity ports.

Responsibilities:
- Implement the interfaces defined in `core/application/identity` (e.g., user repository, session gateway, role provider).
- Integrate with external systems (e.g., auth providers, databases, future Supabase-based storage) behind abstractions.
- Handle concerns such as token storage, transport, and low-level error mapping.

Boundaries:
- May depend on Domain and Application types, external SDKs, and environment configuration.
- Must not be imported directly by React components; Presentation should depend only on Application layer abstractions.
- Should avoid embedding business rules; those belong in Domain and Application layers.
