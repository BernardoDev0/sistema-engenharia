# Identity Application Layer (`src/core/application/identity`)

The **Identity** application layer coordinates identity-related use cases.

Responsibilities:
- Implement use cases such as sign-in, sign-out, refresh session, and resolve current user.
- Define ports/interfaces for user repositories, credential verification services, and role/permission lookup.
- Map external DTOs (e.g., HTTP payloads) into domain models and back.

Boundaries:
- May depend on the Identity domain models and shared, framework-agnostic utilities.
- Must not depend on React, routing, or concrete infrastructure (databases, Supabase SDKs, etc.).
- Exposes a stable API to the Presentation layer (UI) without leaking infrastructure details.
