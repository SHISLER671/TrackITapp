// POS factory - returns appropriate adapter based on configuration

import { POSAdapter, POSConfig, POSError } from './adapter';
import { RevelAdapter } from './revel';
import { SquareAdapter } from './square';
import { ToastAdapter } from './toast';

export type POSSystem = 'mock' | 'revel' | 'square' | 'toast';

/**
 * Get POS adapter instance based on configuration
 */
export function getPOSAdapter(
  system: POSSystem = 'mock',
  config: POSConfig = {}
): POSAdapter {
  switch (system) {
    case 'revel':
      return new RevelAdapter(config);
    case 'square':
      return new SquareAdapter(config);
    case 'toast':
      return new ToastAdapter(config);
    case 'mock':
    default:
      // Mock uses Revel adapter with mock mode
      return new RevelAdapter(config);
  }
}

/**
 * Retry logic with exponential backoff for POS operations
 */
export async function retryPOSOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry if it's not a retryable error
      if (error instanceof POSError && !error.retryable) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelayMs * Math.pow(2, attempt);
      console.log(`POS operation failed, retrying in ${delay}ms...`, error);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('POS operation failed after retries');
}

/**
 * Get configured POS system from environment
 */
export function getConfiguredPOSSystem(): POSSystem {
  const system = process.env.POS_SYSTEM?.toLowerCase() as POSSystem;
  return system || 'mock';
}

/**
 * Initialize POS adapter with configuration from environment
 */
export function initPOSAdapter(): POSAdapter {
  const system = getConfiguredPOSSystem();
  
  const config: POSConfig = {
    apiKey: process.env.POS_API_KEY,
    apiSecret: process.env.POS_API_SECRET,
    merchantId: process.env.POS_MERCHANT_ID,
    baseUrl: process.env.POS_BASE_URL,
  };
  
  return getPOSAdapter(system, config);
}

// Export adapters and types
export type { POSAdapter, POSConfig, POSError } from './adapter';
export { RevelAdapter } from './revel';
export { SquareAdapter } from './square';
export { ToastAdapter } from './toast';
export { mockPOSStorage } from './mock-data';

