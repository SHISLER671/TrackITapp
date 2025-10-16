export type KegSize = 'quarter' | 'half' | 'sixth' | 'tenth'
export type BeerStyle = 'IPA' | 'Lager' | 'Stout' | 'Porter' | 'Wheat' | 'Pilsner' | 'Ale' | 'Other'
export type KegStatus = 'active' | 'delivered' | 'returned' | 'retired'
export type DeliveryStatus = 'pending' | 'in_transit' | 'delivered' | 'cancelled'
export type ScanType = 'delivery' | 'pickup' | 'inventory' | 'maintenance'

export interface Keg {
  id: string
  name: string
  type: BeerStyle
  size: KegSize
  brewery_id: string
  current_holder: string
  status: KegStatus
  created_at: string
  updated_at: string
  qr_code: string
  abv?: number
  ibu?: number
  description?: string
}

export interface Delivery {
  id: string
  from_location: string
  to_location: string
  driver_id: string
  status: DeliveryStatus
  scheduled_date: string
  delivered_at?: string
  created_at: string
  updated_at: string
  notes?: string
  tx_hash?: string
  items?: DeliveryItem[]
}

export interface DeliveryItem {
  id: string
  delivery_id: string
  keg_id: string
  keg_name: string
  keg_type: BeerStyle
  keg_size: KegSize
  deposit_value: number
  created_at: string
}

export interface KegScan {
  id: string
  keg_id: string
  scanned_by: string
  location: string
  timestamp: string
  scan_type: ScanType
  notes?: string
  created_at: string
}

export interface Brewery {
  id: string
  name: string
  address: string
  contact_email: string
  contact_phone?: string
  created_at: string
  updated_at: string
}

export interface Restaurant {
  id: string
  name: string
  address: string
  contact_email: string
  contact_phone?: string
  created_at: string
  updated_at: string
}

// Form types
export interface CreateKegFormData {
  name: string
  type: BeerStyle
  size: KegSize
  brewery_id: string
  abv?: number
  ibu?: number
  description?: string
}

export interface CreateDeliveryFormData {
  from_location: string
  to_location: string
  scheduled_date: string
  keg_ids: string[]
  notes?: string
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// User roles
export type UserRole = 'brewer' | 'driver' | 'restaurant' | 'admin'

export interface User {
  id: string
  email: string
  role: UserRole
  name?: string
  created_at: string
}
