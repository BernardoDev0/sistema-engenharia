# Infrastructure layer (`src/core/infrastructure`)

The **Infrastructure** layer contains technical details and integrations.

- Implement the **ports/interfaces** defined in the Application/Domain layers.
- Examples: HTTP clients, database repositories, cache, logging, queues.
- May use external SDKs (e.g., Supabase, REST clients) behind abstractions.

This layer can depend on Domain and Application types but must **not** be imported by React UI directly.
UI should talk to abstractions in the Application layer, not to infrastructure details.
