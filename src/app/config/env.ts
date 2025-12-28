import { appConfig } from "./app-config";

/**
 * Minimal, typed access to Vite environment variables.
 * Extend this as you introduce new `VITE_...` keys.
 */
const getEnvVar = (key: string): string => {
  const value = import.meta.env[key as keyof ImportMetaEnv] as string | undefined;

  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};

export const env = {
  /**
   * Example accessor – uncomment and adapt when you introduce a concrete key:
   * appEnv: () => getEnvVar("VITE_APP_ENV"),
   */
};

export { getEnvVar, appConfig };
