/**
 * Application configuration
 *
 * Centralized configuration management for environment variables
 * with type-safe access and validation.
 */

/**
 * Configuration object containing all environment variables
 */
export const config = {
  /** You.com API key from environment */
  youApiKey: process.env.YOU_API_KEY,
  /** Current Node environment */
  nodeEnv: process.env.NODE_ENV || 'development',
  /** Whether running in production mode */
  isProduction: process.env.NODE_ENV === 'production',
  /** Whether running in development mode */
  isDevelopment: process.env.NODE_ENV === 'development',
} as const;

/**
 * Validates required environment variables
 *
 * @throws Error if YOU_API_KEY is not set
 *
 * @example
 * ```typescript
 * // Call at app startup
 * validateEnv();
 * ```
 */
export function validateEnv() {
  if (!config.youApiKey) {
    throw new Error('YOU_API_KEY environment variable is required');
  }
}
