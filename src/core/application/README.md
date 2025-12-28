# Application layer (`src/core/application`)

The **Application** layer coordinates domain logic into use cases.

- Implement **use-case services** (e.g., `CreateOrder`, `GetUserProfile`).
- Define **ports/interfaces** for repositories, gateways, and other services.
- Map external data (DTOs) into domain models and back.
- Orchestrate workflows but do **not** contain UI logic or framework code.

This layer may depend on the Domain layer and shared, framework-agnostic utilities.
It must **not** depend on React components or concrete infrastructure implementations.
