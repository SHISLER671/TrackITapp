export interface Database {
  public: {
    Tables: {
      kegs: {
        Row: {
          id: string
          name: string
          type: string
          size: string
          brewery_id: string
          current_holder: string
          status: 'active' | 'delivered' | 'returned' | 'retired'
          created_at: string
          updated_at: string
          qr_code: string
          abv?: number
          ibu?: number
          description?: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          size: string
          brewery_id: string
          current_holder: string
          status?: 'active' | 'delivered' | 'returned' | 'retired'
          created_at?: string
          updated_at?: string
          qr_code: string
          abv?: number
          ibu?: number
          description?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          size?: string
          brewery_id?: string
          current_holder?: string
          status?: 'active' | 'delivered' | 'returned' | 'retired'
          created_at?: string
          updated_at?: string
          qr_code?: string
          abv?: number
          ibu?: number
          description?: string
        }
      }
      deliveries: {
        Row: {
          id: string
          from_location: string
          to_location: string
          driver_id: string
          status: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
          scheduled_date: string
          delivered_at?: string
          created_at: string
          updated_at: string
          notes?: string
          tx_hash?: string
        }
        Insert: {
          id?: string
          from_location: string
          to_location: string
          driver_id: string
          status?: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
          scheduled_date: string
          delivered_at?: string
          created_at?: string
          updated_at?: string
          notes?: string
          tx_hash?: string
        }
        Update: {
          id?: string
          from_location?: string
          to_location?: string
          driver_id?: string
          status?: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
          scheduled_date?: string
          delivered_at?: string
          created_at?: string
          updated_at?: string
          notes?: string
          tx_hash?: string
        }
      }
      delivery_items: {
        Row: {
          id: string
          delivery_id: string
          keg_id: string
          keg_name: string
          keg_type: string
          keg_size: string
          deposit_value: number
          created_at: string
        }
        Insert: {
          id?: string
          delivery_id: string
          keg_id: string
          keg_name: string
          keg_type: string
          keg_size: string
          deposit_value: number
          created_at?: string
        }
        Update: {
          id?: string
          delivery_id?: string
          keg_id?: string
          keg_name?: string
          keg_type?: string
          keg_size?: string
          deposit_value?: number
          created_at?: string
        }
      }
      keg_scans: {
        Row: {
          id: string
          keg_id: string
          scanned_by: string
          location: string
          timestamp: string
          scan_type: 'delivery' | 'pickup' | 'inventory' | 'maintenance'
          notes?: string
          created_at: string
        }
        Insert: {
          id?: string
          keg_id: string
          scanned_by: string
          location: string
          timestamp: string
          scan_type: 'delivery' | 'pickup' | 'inventory' | 'maintenance'
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          keg_id?: string
          scanned_by?: string
          location?: string
          timestamp?: string
          scan_type?: 'delivery' | 'pickup' | 'inventory' | 'maintenance'
          notes?: string
          created_at?: string
        }
      }
      breweries: {
        Row: {
          id: string
          name: string
          address: string
          contact_email: string
          contact_phone?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          contact_email: string
          contact_phone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          contact_email?: string
          contact_phone?: string
          created_at?: string
          updated_at?: string
        }
      }
      restaurants: {
        Row: {
          id: string
          name: string
          address: string
          contact_email: string
          contact_phone?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          contact_email: string
          contact_phone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          contact_email?: string
          contact_phone?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      keg_status: 'active' | 'delivered' | 'returned' | 'retired'
      delivery_status: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
      scan_type: 'delivery' | 'pickup' | 'inventory' | 'maintenance'
    }
  }
}
