-- Create breweries table
CREATE TABLE IF NOT EXISTS breweries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create kegs table
CREATE TABLE IF NOT EXISTS kegs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('IPA', 'Lager', 'Stout', 'Porter', 'Wheat', 'Pilsner', 'Ale', 'Other')),
  size TEXT NOT NULL CHECK (size IN ('quarter', 'half', 'sixth', 'tenth')),
  brewery_id UUID NOT NULL REFERENCES breweries(id),
  current_holder UUID NOT NULL, -- Can be brewery or restaurant ID
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'delivered', 'returned', 'retired')),
  qr_code TEXT NOT NULL UNIQUE,
  abv DECIMAL(4,2),
  ibu INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  driver_id UUID NOT NULL, -- References auth.users
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled')),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  delivered_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  tx_hash TEXT, -- For blockchain integration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create delivery_items table
CREATE TABLE IF NOT EXISTS delivery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  keg_id UUID NOT NULL REFERENCES kegs(id),
  keg_name TEXT NOT NULL,
  keg_type TEXT NOT NULL,
  keg_size TEXT NOT NULL,
  deposit_value DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create keg_scans table
CREATE TABLE IF NOT EXISTS keg_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keg_id UUID NOT NULL REFERENCES kegs(id),
  scanned_by UUID NOT NULL, -- References auth.users
  location TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('delivery', 'pickup', 'inventory', 'maintenance')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_kegs_brewery_id ON kegs(brewery_id);
CREATE INDEX IF NOT EXISTS idx_kegs_current_holder ON kegs(current_holder);
CREATE INDEX IF NOT EXISTS idx_kegs_status ON kegs(status);
CREATE INDEX IF NOT EXISTS idx_kegs_qr_code ON kegs(qr_code);
CREATE INDEX IF NOT EXISTS idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_delivery_items_delivery_id ON delivery_items(delivery_id);
CREATE INDEX IF NOT EXISTS idx_delivery_items_keg_id ON delivery_items(keg_id);
CREATE INDEX IF NOT EXISTS idx_keg_scans_keg_id ON keg_scans(keg_id);
CREATE INDEX IF NOT EXISTS idx_keg_scans_scanned_by ON keg_scans(scanned_by);
CREATE INDEX IF NOT EXISTS idx_keg_scans_timestamp ON keg_scans(timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE breweries ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE kegs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE keg_scans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic - allow all for now)
CREATE POLICY "Allow all operations on breweries" ON breweries FOR ALL USING (true);
CREATE POLICY "Allow all operations on restaurants" ON restaurants FOR ALL USING (true);
CREATE POLICY "Allow all operations on kegs" ON kegs FOR ALL USING (true);
CREATE POLICY "Allow all operations on deliveries" ON deliveries FOR ALL USING (true);
CREATE POLICY "Allow all operations on delivery_items" ON delivery_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on keg_scans" ON keg_scans FOR ALL USING (true);

-- Insert sample data
INSERT INTO breweries (name, address, contact_email, contact_phone) VALUES
('Craft Brew Co', '123 Main St, Portland, OR', 'contact@craftbrew.com', '555-0123'),
('Hoppy Valley Brewery', '456 Oak Ave, Seattle, WA', 'info@hoppyvalley.com', '555-0456');

INSERT INTO restaurants (name, address, contact_email, contact_phone) VALUES
('The Golden Tap', '789 Pine St, Portland, OR', 'manager@goldentap.com', '555-0789'),
('Brew & Bite', '321 Elm St, Seattle, WA', 'orders@brewbite.com', '555-0321');
