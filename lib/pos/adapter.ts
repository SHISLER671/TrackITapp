// Base POS adapter interface
// All POS integrations (Revel, Square, Toast) must implement this interface

export interface POSAdapter {
  /**
   * Install a keg on a specific tap position
   * Sends keg activation event to POS system
   */
  installKeg(kegId: string, tapPosition: number): Promise<void>;
  
  /**
   * Get the current pint count for a keg
   * Queries POS system for all beer sales at the keg's tap
   */
  getPintCount(kegId: string): Promise<number>;
  
  /**
   * Sync all sales data from POS system
   * Called periodically (every 5 minutes) to update pint counts
   */
  syncSales(): Promise<void>;
  
  /**
   * Get tap status information
   * Returns which kegs are currently on which taps
   */
  getTapStatus(): Promise<Map<number, string>>; // tap position -> keg ID
}

export interface POSConfig {
  apiKey?: string;
  apiSecret?: string;
  merchantId?: string;
  baseUrl?: string;
}

export class POSError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'POSError';
  }
}
