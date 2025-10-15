import { KegSize, BeerStyle } from './types';

// Keg size reference data (from PDR section 4.2)
export const KEG_SIZES: Array<{
  size: KegSize;
  name: string;
  volume_oz: number;
  expected_pints: number;
  description: string;
}> = [
  {
    size: '1/6BBL',
    name: 'Sixth Barrel',
    volume_oz: 55.2,
    expected_pints: 41,
    description: 'Most common for craft beer',
  },
  {
    size: '1/4BBL',
    name: 'Quarter Barrel',
    volume_oz: 99.2,
    expected_pints: 74,
    description: 'Common for distribution',
  },
  {
    size: '1/2BBL',
    name: 'Half Barrel',
    volume_oz: 198.4,
    expected_pints: 124,
    description: 'Standard US keg',
  },
  {
    size: 'Pony',
    name: 'Pony Keg',
    volume_oz: 74.4,
    expected_pints: 53,
    description: 'Small venues',
  },
  {
    size: 'Cornelius',
    name: 'Corny Keg',
    volume_oz: 50,
    expected_pints: 37,
    description: 'Homebrew/small batch',
  },
];

// Beer style options for dropdown
export const BEER_STYLES: BeerStyle[] = [
  'IPA',
  'Pale Ale',
  'Lager',
  'Pilsner',
  'Stout',
  'Porter',
  'Wheat Beer',
  'Sour',
  'Amber Ale',
  'Brown Ale',
  'Belgian Ale',
  'Other',
];

// Variance thresholds (from PDR section 5.3)
export const VARIANCE_THRESHOLDS = {
  NORMAL: 3,
  WARNING: 8,
} as const;

// Tap positions available in restaurants
export const TAP_POSITIONS = Array.from({ length: 20 }, (_, i) => i + 1);

// Problem keg threshold (days without scan)
export const PROBLEM_KEG_DAYS = 14;

// POS sync interval (milliseconds)
export const POS_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Map config
export const DEFAULT_MAP_CENTER = {
  lat: 40.7128,
  lng: -74.0060,
};

export const DEFAULT_MAP_ZOOM = 12;

// API rate limiting
export const RATE_LIMIT = {
  requests: 100,
  window: 60 * 1000, // 1 minute
};

// ABV constraints
export const ABV_MIN = 0;
export const ABV_MAX = 20;
export const ABV_STEP = 0.1;

// IBU constraints
export const IBU_MIN = 1;
export const IBU_MAX = 120;

// UI Messages (no blockchain terminology)
export const UI_MESSAGES = {
  KEG_CREATED: 'Keg created successfully!',
  KEG_RETIRED: 'Keg retired successfully.',
  SCAN_SUCCESS: 'Keg scanned successfully.',
  SCAN_ERROR: 'Failed to scan keg. Please try again.',
  VARIANCE_WARNING: 'This keg has a higher than expected variance.',
  VARIANCE_CRITICAL: 'This keg has a critical variance that requires investigation.',
  INSTALLATION_SUCCESS: 'Keg installed on tap successfully.',
  ANALYSIS_TRIGGERED: 'Variance analysis has been initiated.',
} as const;
