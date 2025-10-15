-- Beer Keg Tracker Database Schema
-- Migration 001: Initial schema with all tables and Row Level Security

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role_type AS ENUM ('BREWER', 'DRIVER', 'RESTAURANT_MANAGER');
CREATE TYPE keg_size_type AS ENUM ('1/6BBL', '1/4BBL', '1/2BBL', 'Pony', 'Cornelius');
CREATE TYPE variance_status_type AS ENUM ('NORMAL', 'WARNING', 'CRITICAL');

-- Breweries table
CREATE TABLE breweries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role_type NOT NULL,
  brewery_id UUID REFERENCES breweries(id) ON DELETE SET NULL,
  location_id UUID, -- For restaurant managers and drivers
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Kegs table
CREATE TABLE kegs (
  id VARCHAR(255) PRIMARY KEY, -- Thirdweb token ID
  brewery_id UUID NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL, -- Beer name
  type VARCHAR(50) NOT NULL, -- Beer style
  abv INTEGER NOT NULL, -- Stored as integer * 10 (e.g., 6.5% = 65)
  ibu INTEGER NOT NULL,
  brew_date DATE NOT NULL,
  keg_size keg_size_type NOT NULL,
  expected_pints INTEGER NOT NULL, -- Auto-calculated based on keg_size
  current_holder UUID REFERENCES user_roles(id) ON DELETE SET NULL,
  last_scan TIMESTAMP WITH TIME ZONE,
  last_location TEXT,
  is_empty BOOLEAN DEFAULT FALSE,
  pints_sold INTEGER DEFAULT 0,
  variance INTEGER DEFAULT 0, -- expected_pints - pints_sold
  variance_status variance_status_type DEFAULT 'NORMAL',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keg scans table
CREATE TABLE keg_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keg_id VARCHAR(255) NOT NULL REFERENCES kegs(id) ON DELETE CASCADE,
  scanned_by UUID NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- POS sales table
CREATE TABLE pos_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keg_id VARCHAR(255) NOT NULL REFERENCES kegs(id) ON DELETE CASCADE,
  tap_position INTEGER,
  pints_sold INTEGER DEFAULT 0,
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(keg_id)
);

-- Variance reports table
CREATE TABLE variance_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keg_id VARCHAR(255) NOT NULL REFERENCES kegs(id) ON DELETE CASCADE,
  variance_amount INTEGER NOT NULL,
  status variance_status_type NOT NULL,
  ai_analysis JSONB NOT NULL, -- Stores AIAnalysisResult
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_kegs_brewery ON kegs(brewery_id);
CREATE INDEX idx_kegs_current_holder ON kegs(current_holder);
CREATE INDEX idx_kegs_is_empty ON kegs(is_empty);
CREATE INDEX idx_keg_scans_keg ON keg_scans(keg_id);
CREATE INDEX idx_keg_scans_timestamp ON keg_scans(timestamp);
CREATE INDEX idx_pos_sales_keg ON pos_sales(keg_id);
CREATE INDEX idx_variance_reports_keg ON variance_reports(keg_id);
CREATE INDEX idx_variance_reports_resolved ON variance_reports(resolved);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_brewery ON user_roles(brewery_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE breweries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kegs ENABLE ROW LEVEL SECURITY;
ALTER TABLE keg_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE variance_reports ENABLE ROW LEVEL SECURITY;

-- Breweries policies
CREATE POLICY "Breweries are viewable by authenticated users" ON breweries
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Brewers can insert breweries" ON breweries
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'BREWER'
    )
  );

-- User roles policies
CREATE POLICY "Users can view their own role" ON user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Brewers can view all roles in their brewery" ON user_roles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'BREWER'
      AND ur.brewery_id = user_roles.brewery_id
    )
  );

-- Kegs policies
CREATE POLICY "Brewers can view all kegs in their brewery" ON kegs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'BREWER'
      AND user_roles.brewery_id = kegs.brewery_id
    )
  );

CREATE POLICY "Drivers can view kegs assigned to them" ON kegs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'DRIVER'
      AND user_roles.id = kegs.current_holder
    )
  );

CREATE POLICY "Restaurant managers can view kegs at their location" ON kegs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'RESTAURANT_MANAGER'
      AND user_roles.id = kegs.current_holder
    )
  );

CREATE POLICY "Brewers can create kegs" ON kegs
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'BREWER'
      AND user_roles.brewery_id = kegs.brewery_id
    )
  );

CREATE POLICY "Authenticated users can update kegs" ON kegs
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Keg scans policies
CREATE POLICY "Users can view scans for kegs they have access to" ON keg_scans
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM kegs k
      JOIN user_roles ur ON ur.user_id = auth.uid()
      WHERE k.id = keg_scans.keg_id
      AND (
        (ur.role = 'BREWER' AND ur.brewery_id = k.brewery_id) OR
        (ur.role IN ('DRIVER', 'RESTAURANT_MANAGER') AND ur.id = k.current_holder)
      )
    )
  );

CREATE POLICY "Authenticated users can create scans" ON keg_scans
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.id = keg_scans.scanned_by
    )
  );

-- POS sales policies
CREATE POLICY "Users can view POS sales for kegs they have access to" ON pos_sales
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM kegs k
      JOIN user_roles ur ON ur.user_id = auth.uid()
      WHERE k.id = pos_sales.keg_id
      AND (
        (ur.role = 'BREWER' AND ur.brewery_id = k.brewery_id) OR
        (ur.role = 'RESTAURANT_MANAGER' AND ur.id = k.current_holder)
      )
    )
  );

CREATE POLICY "Authenticated users can insert POS sales" ON pos_sales
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update POS sales" ON pos_sales
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Variance reports policies
CREATE POLICY "Brewers and restaurant managers can view variance reports" ON variance_reports
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM kegs k
      JOIN user_roles ur ON ur.user_id = auth.uid()
      WHERE k.id = variance_reports.keg_id
      AND (
        (ur.role = 'BREWER' AND ur.brewery_id = k.brewery_id) OR
        (ur.role = 'RESTAURANT_MANAGER' AND ur.id = k.current_holder)
      )
    )
  );

CREATE POLICY "Authenticated users can create variance reports" ON variance_reports
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Brewers and restaurant managers can update variance reports" ON variance_reports
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM kegs k
      JOIN user_roles ur ON ur.user_id = auth.uid()
      WHERE k.id = variance_reports.keg_id
      AND ur.role IN ('BREWER', 'RESTAURANT_MANAGER')
    )
  )
  WITH CHECK (true);

-- Functions

-- Function to automatically calculate variance
CREATE OR REPLACE FUNCTION calculate_keg_variance()
RETURNS TRIGGER AS $$
BEGIN
  NEW.variance := NEW.expected_pints - NEW.pints_sold;
  
  -- Calculate variance status
  IF ABS(NEW.variance) <= 3 THEN
    NEW.variance_status := 'NORMAL';
  ELSIF ABS(NEW.variance) <= 8 THEN
    NEW.variance_status := 'WARNING';
  ELSE
    NEW.variance_status := 'CRITICAL';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate variance on keg update
CREATE TRIGGER update_keg_variance
  BEFORE UPDATE OF pints_sold, expected_pints ON kegs
  FOR EACH ROW
  EXECUTE FUNCTION calculate_keg_variance();

-- Function to update pints_sold from pos_sales
CREATE OR REPLACE FUNCTION sync_keg_pints_sold()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE kegs
  SET pints_sold = NEW.pints_sold
  WHERE id = NEW.keg_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync pints_sold when pos_sales updates
CREATE TRIGGER sync_pints_on_pos_update
  AFTER INSERT OR UPDATE OF pints_sold ON pos_sales
  FOR EACH ROW
  EXECUTE FUNCTION sync_keg_pints_sold();

-- Comments for documentation
COMMENT ON TABLE kegs IS 'Stores keg information with blockchain token ID as primary key';
COMMENT ON TABLE keg_scans IS 'Tracks all scan events for kegs with location and timestamp';
COMMENT ON TABLE pos_sales IS 'Stores POS integration data for tap installations and pint sales';
COMMENT ON TABLE variance_reports IS 'Stores AI-generated variance analysis reports';
COMMENT ON COLUMN kegs.abv IS 'ABV stored as integer * 10 (e.g., 6.5% = 65)';
COMMENT ON COLUMN kegs.expected_pints IS 'Auto-calculated based on keg_size, never manually entered';
COMMENT ON COLUMN kegs.variance IS 'Calculated as expected_pints - pints_sold';
