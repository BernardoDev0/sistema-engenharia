# Identity Presentation Layer (`src/presentation/identity`)

The **Identity** presentation layer contains UI and view models for authentication and access.

Responsibilities:
- Define React components, routes, and hooks related to sign-in, sign-out, and identity display.
- Use Application layer use cases (e.g., `SignIn`, `GetCurrentUser`) to perform actions and fetch data.
- Map domain/application data into view models tailored for the UI.

Boundaries:
- Must not call infrastructure implementations directly (e.g., no direct SDK or HTTP calls).
- Should not embed core business rules; instead, defer to Domain/Application.
- Keeps identity-related UI concerns (forms, error messages, loading states) isolated from technical details.
