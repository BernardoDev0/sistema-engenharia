# Identity Domain (`src/core/domain/identity`)

The **Identity** domain models authentication and authorization concepts.

Responsibilities:
- Define domain models for users, credentials, permissions, and identities.
- Express invariants and rules around authentication and access control.
- Provide domain services for operations such as validating credentials or evaluating permissions.

Boundaries:
- No direct knowledge of infrastructure details (databases, HTTP, Supabase, etc.).
- No React, routing, or UI concepts.
- Does not make assumptions about how users are stored or retrieved; that is defined via interfaces in the Application layer.
