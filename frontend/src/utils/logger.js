/**
 * EcoFleet AI — Client Logging Utility
 * Standardizes diagnostic logging across the frontend while suppressing
 * verbose or noisy debug output in production environments.
 */

const isDev = Boolean(import.meta.env.DEV)

export const logger = {
  info: (...args) => {
    if (isDev) {
      console.info('[EcoFleet]', ...args)
    }
  },
  warn: (...args) => {
    if (isDev) {
      console.warn('[EcoFleet]', ...args)
    }
  },
  error: (...args) => {
    // Errors are logged in all environments for telemetry tracking
    console.error('[EcoFleet ERROR]', ...args)
  },
  debug: (...args) => {
    if (isDev) {
      console.debug('[EcoFleet DEBUG]', ...args)
    }
  },
}

export default logger
