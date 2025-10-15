// Revel POS adapter with mock implementation

import { POSAdapter, POSConfig, POSError } from './adapter';
import { mockPOSStorage } from './mock-data';

const USE_LIVE_API = process.env.USE_LIVE_POS === 'true';

export class RevelAdapter implements POSAdapter {
  private config: POSConfig;
  
  constructor(config: POSConfig = {}) {
    this.config = config;
  }
  
  async installKeg(kegId: string, tapPosition: number): Promise<void> {
    if (USE_LIVE_API) {
      try {
        // TODO: Implement real Revel API integration
        // const response = await fetch(`${this.config.baseUrl}/api/v1/products/`, {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Token ${this.config.apiKey}`,
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     keg_id: kegId,
        //     tap_position: tapPosition,
        //     active: true,
        //   }),
        // });
        
        throw new Error('Live Revel API integration not yet implemented');
      } catch (error) {
        throw new POSError(
          'Failed to install keg in Revel',
          'REVEL_INSTALL_ERROR',
          true
        );
      }
    } else {
      // Mock implementation
      await this.simulateDelay(300);
      mockPOSStorage.installKeg(kegId, tapPosition);
      console.log(`Mock Revel: Installed keg ${kegId} on tap ${tapPosition}`);
    }
  }
  
  async getPintCount(kegId: string): Promise<number> {
    if (USE_LIVE_API) {
      try {
        // TODO: Implement real Revel API integration
        // const response = await fetch(
        //   `${this.config.baseUrl}/api/v1/orders/?keg_id=${kegId}`,
        //   {
        //     headers: {
        //       'Authorization': `Token ${this.config.apiKey}`,
        //     },
        //   }
        // );
        // const data = await response.json();
        // return data.total_pints || 0;
        
        throw new Error('Live Revel API integration not yet implemented');
      } catch (error) {
        throw new POSError(
          'Failed to get pint count from Revel',
          'REVEL_COUNT_ERROR',
          true
        );
      }
    } else {
      // Mock implementation
      await this.simulateDelay(150);
      const count = mockPOSStorage.getPintCount(kegId);
      console.log(`Mock Revel: Retrieved ${count} pints for keg ${kegId}`);
      return count;
    }
  }
  
  async syncSales(): Promise<void> {
    if (USE_LIVE_API) {
      try {
        // TODO: Implement real Revel API integration
        // Fetch all active keg sales and update database
        
        throw new Error('Live Revel API integration not yet implemented');
      } catch (error) {
        throw new POSError(
          'Failed to sync sales from Revel',
          'REVEL_SYNC_ERROR',
          true
        );
      }
    } else {
      // Mock implementation
      await this.simulateDelay(500);
      mockPOSStorage.simulateSales();
      console.log('Mock Revel: Sales synced successfully');
    }
  }
  
  async getTapStatus(): Promise<Map<number, string>> {
    if (USE_LIVE_API) {
      try {
        // TODO: Implement real Revel API integration
        
        throw new Error('Live Revel API integration not yet implemented');
      } catch (error) {
        throw new POSError(
          'Failed to get tap status from Revel',
          'REVEL_STATUS_ERROR',
          true
        );
      }
    } else {
      // Mock implementation
      await this.simulateDelay(100);
      return mockPOSStorage.getTapStatus();
    }
  }
  
  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
