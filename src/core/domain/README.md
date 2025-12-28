# Domain layer (`src/core/domain`)

The **Domain** layer contains pure business logic and models.

- Define **entities**, **value objects**, and **domain services** here.
- No imports from React, routing, HTTP clients, or UI libraries.
- No access to browser APIs (no `window`, `localStorage`, etc.).
- Can depend only on other domain modules and simple shared utilities that are also framework-agnostic.

When in doubt, put rules and invariants here.
