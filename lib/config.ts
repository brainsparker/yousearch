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
  /** You.com API key from environment (optional, keyless free tier when unset) */
  youApiKey: process.env.YOU_API_KEY,
  /** Current Node environment */
  nodeEnv: process.env.NODE_ENV || 'development',
  /** Whether running in production mode */
  isProduction: process.env.NODE_ENV === 'production',
  /** Whether running in development mode */
  isDevelopment: process.env.NODE_ENV === 'development',
} as const;

/**
 * Reports which You.com access path the app will use.
 *
 * YOU_API_KEY is optional. Without it the app runs on You.com's keyless free
 * tier, which is rate limited. With it, requests use the keyed APIs.
 *
 * @example
 * ```typescript
 * if (searchMode() === 'keyless') console.warn('Running on the keyless free tier');
 * ```
 */
export function searchMode(): 'keyed' | 'keyless' {
  return process.env.YOU_API_KEY?.trim() ? 'keyed' : 'keyless';
}
