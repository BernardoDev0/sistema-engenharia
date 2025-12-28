export const appConfig = {
  /**
   * Global, non-secret application configuration.
   * Extend this object as the system grows (e.g., locales, feature flags metadata).
   */
  name: "Enterprise App",
} as const;

export type AppConfig = typeof appConfig;
