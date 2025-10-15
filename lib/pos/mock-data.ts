// Mock POS data for development and testing

export interface MockKegData {
  kegId: string;
  tapPosition: number;
  pintsSold: number;
  lastUpdate: Date;
}

// In-memory storage for mock POS data
class MockPOSStorage {
  private kegs: Map<string, MockKegData> = new Map();
  private tapPositions: Map<number, string> = new Map();
  
  installKeg(kegId: string, tapPosition: number): void {
    // Remove any existing keg from this tap
    const existingKeg = this.tapPositions.get(tapPosition);
    if (existingKeg) {
      this.kegs.delete(existingKeg);
    }
    
    // Install new keg
    this.tapPositions.set(tapPosition, kegId);
    this.kegs.set(kegId, {
      kegId,
      tapPosition,
      pintsSold: 0,
      lastUpdate: new Date(),
    });
  }
  
  getPintCount(kegId: string): number {
    return this.kegs.get(kegId)?.pintsSold || 0;
  }
  
  addPints(kegId: string, pints: number): void {
    const keg = this.kegs.get(kegId);
    if (keg) {
      keg.pintsSold += pints;
      keg.lastUpdate = new Date();
    }
  }
  
  getTapStatus(): Map<number, string> {
    return new Map(this.tapPositions);
  }
  
  getAllKegs(): MockKegData[] {
    return Array.from(this.kegs.values());
  }
  
  // Simulate random sales for testing
  simulateSales(): void {
    for (const keg of this.kegs.values()) {
      // Randomly add 0-3 pints to simulate sales
      const newPints = Math.floor(Math.random() * 4);
      if (newPints > 0) {
        this.addPints(keg.kegId, newPints);
      }
    }
  }
}

export const mockPOSStorage = new MockPOSStorage();

// Simulate realistic sales patterns
export function startMockSalesSimulation(intervalMs: number = 60000): NodeJS.Timeout {
  return setInterval(() => {
    mockPOSStorage.simulateSales();
  }, intervalMs);
}

// Helper to generate realistic variance scenarios for testing
export function seedMockVarianceScenarios() {
  // These can be used in development to test different variance scenarios
  const scenarios = [
    {
      kegId: 'KEG-NORMAL-1',
      expectedPints: 41,
      actualPints: 39, // Variance: 2 (NORMAL)
      description: 'Normal variance within threshold',
    },
    {
      kegId: 'KEG-WARNING-1',
      expectedPints: 74,
      actualPints: 68, // Variance: 6 (WARNING)
      description: 'Warning variance requiring attention',
    },
    {
      kegId: 'KEG-CRITICAL-1',
      expectedPints: 124,
      actualPints: 112, // Variance: 12 (CRITICAL)
      description: 'Critical variance requiring investigation',
    },
  ];
  
  return scenarios;
}
