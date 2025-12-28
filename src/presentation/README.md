# Presentation layer (`src/presentation`)

The **Presentation** layer holds React UI and view models.

- React components, pages/routes, and UI-specific hooks live here.
- Talks to the Application layer via use cases or facades, not directly to Infrastructure.
- Contains view models (VMs) to map domain/application data into UI-friendly shapes.

Keep this layer free of business rules. Its job is to present data, capture user intent,
and call the appropriate Application services.
