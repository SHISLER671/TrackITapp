// Core type definitions for the Keg Tracker application

export type KegSize = '1/6BBL' | '1/4BBL' | '1/2BBL' | 'Pony' | 'Cornelius';

export type UserRole = 'BREWER' | 'DRIVER' | 'RESTAURANT_MANAGER';

export type VarianceStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';

export type DeliveryStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export type BeerStyle = 
  | 'IPA' 
  | 'Pale Ale' 
  | 'Lager' 
  | 'Pilsner' 
  | 'Stout' 
  | 'Porter' 
  | 'Wheat Beer' 
  | 'Sour' 
  | 'Amber Ale'
  | 'Brown Ale'
  | 'Belgian Ale'
  | 'Other';

export interface Brewery {
  id: string;
  name: string;
  logo_url: string | null;
  created_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  brewery_id: string | null;
  location_id: string | null;
  created_at: string;
}

export interface Keg {
  id: string; // Thirdweb token ID
  brewery_id: string;
  name: string; // Beer name
  type: string; // Beer style
  abv: number; // Stored as integer * 10 (e.g., 6.5% = 65)
  ibu: number;
  brew_date: string; // ISO date string
  keg_size: KegSize;
  expected_pints: number; // Auto-calculated based on keg_size
  current_holder: string | null; // UUID of user_roles.id
  last_scan: string | null; // ISO timestamp
  last_location: string | null;
  is_empty: boolean;
  pints_sold: number;
  variance: number; // expected_pints - pints_sold
  variance_status: VarianceStatus;
  created_at: string;
}

export interface KegScan {
  id: string;
  keg_id: string;
  scanned_by: string; // user_roles.id
  location: string; // Geolocation coordinates or address
  timestamp: string; // ISO timestamp
  created_at: string;
}

export interface POSSales {
  id: string;
  keg_id: string;
  tap_position: number | null;
  pints_sold: number;
  last_sync: string; // ISO timestamp
  created_at: string;
}

export interface VarianceReport {
  id: string;
  keg_id: string;
  variance_amount: number;
  status: VarianceStatus;
  ai_analysis: AIAnalysisResult;
  created_at: string;
  resolved: boolean;
  resolved_at: string | null;
}

export interface Delivery {
  id: string;
  driver_id: string;
  restaurant_id: string;
  brewery_id: string;
  keg_ids: string[];
  status: DeliveryStatus;
  driver_signature: string | null;
  manager_signature: string | null;
  blockchain_tx_hash: string | null;
  created_at: string;
  accepted_at: string | null;
  receipt_pdf_url: string | null;
  receipt_sent_at: string | null;
  deposit_amount: number | null;
  notes: string | null;
}

export interface DeliveryItem {
  id: string;
  delivery_id: string;
  keg_id: string;
  keg_name: string;
  keg_type: string;
  keg_size: KegSize;
  deposit_value: number;
  created_at: string;
}

export interface AccountingExport {
  id: string;
  exported_by: string;
  start_date: string;
  end_date: string;
  restaurant_id: string | null;
  delivery_count: number;
  total_kegs: number;
  total_deposit: number;
  file_url: string | null;
  created_at: string;
}

export interface AIAnalysisResult {
  summary: string; // 1-sentence cause summary
  required_actions: string[]; // 3 specific actions
  time_windows: string[]; // Critical time windows for footage review
  staff_to_interview: string[]; // Staff members to interview
}

// Helper function to calculate expected pints based on keg size
export function calculateExpectedPints(kegSize: KegSize): number {
  const pintMap: Record<KegSize, number> = {
    '1/6BBL': 41,
    '1/4BBL': 74,
    '1/2BBL': 124,
    'Pony': 53,
    'Cornelius': 37,
  };
  
  return pintMap[kegSize];
}

// Helper function to calculate variance status
export function calculateVarianceStatus(variance: number): VarianceStatus {
  const absVariance = Math.abs(variance);
  
  if (absVariance <= 3) return 'NORMAL';
  if (absVariance <= 8) return 'WARNING';
  return 'CRITICAL';
}

// Helper function to format ABV for display
export function formatABV(abv: number): string {
  return (abv / 10).toFixed(1) + '%';
}

// Helper function to parse ABV from user input
export function parseABV(abv: number): number {
  return Math.round(abv * 10);
}

// Form data types
export interface CreateKegFormData {
  name: string;
  type: BeerStyle;
  abv: number; // Display value (0-20)
  ibu: number; // (1-120)
  brew_date: string; // ISO date
  keg_size: KegSize;
}

export interface ScanResult {
  keg: Keg;
  location: string;
  timestamp: string;
}

export interface RetirementData {
  keg: Keg;
  final_pints_sold: number;
  variance: number;
  variance_status: VarianceStatus;
}

// QR Code format
export interface QRCodeData {
  contract: string;
  tokenId: string;
}

export function parseQRCode(qrString: string): QRCodeData | null {
  const parts = qrString.split(':');
  if (parts.length !== 3 || parts[0] !== 'keg') {
    return null;
  }
  
  return {
    contract: parts[1],
    tokenId: parts[2],
  };
}

export function formatQRCode(contract: string, tokenId: string): string {
  return `keg:${contract}:${tokenId}`;
}

// Helper function to calculate keg deposit value based on size
export function calculateKegDeposit(kegSize: KegSize): number {
  const depositMap: Record<KegSize, number> = {
    '1/6BBL': 30.00,
    '1/4BBL': 30.00,
    '1/2BBL': 30.00,
    'Pony': 30.00,
    'Cornelius': 30.00,
  };
  
  return depositMap[kegSize];
}

// Form data types for deliveries
export interface CreateDeliveryFormData {
  restaurant_id: string;
  keg_ids: string[];
  notes?: string;
}
