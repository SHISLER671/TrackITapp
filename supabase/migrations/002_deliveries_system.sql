-- Deliveries System Migration
-- Migration 002: Add delivery tracking, signatures, and receipt generation

-- Create delivery status enum
CREATE TYPE delivery_status_type AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- Deliveries table
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Party information
  driver_id UUID NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
  brewery_id UUID NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  
  -- Delivery details
  keg_ids TEXT[] NOT NULL, -- Array of keg IDs being delivered
  status delivery_status_type DEFAULT 'PENDING',
  
  -- Signatures and blockchain
  driver_signature TEXT, -- Blockchain signature when driver creates delivery
  manager_signature TEXT, -- Blockchain signature when manager accepts
  blockchain_tx_hash TEXT, -- Thirdweb transaction hash (NFT transfer)
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  
  -- Receipt information
  receipt_pdf_url TEXT,
  receipt_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Financial tracking
  deposit_amount DECIMAL(10, 2), -- Total keg deposit value
  notes TEXT
);

-- Delivery items table (for detailed tracking)
CREATE TABLE delivery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  keg_id VARCHAR(255) NOT NULL REFERENCES kegs(id) ON DELETE CASCADE,
  
  -- Keg snapshot at delivery time (for receipt generation)
  keg_name VARCHAR(50) NOT NULL,
  keg_type VARCHAR(50) NOT NULL,
  keg_size keg_size_type NOT NULL,
  deposit_value DECIMAL(10, 2), -- Individual keg deposit
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accounting exports table (tracks CSV exports for reconciliation)
CREATE TABLE accounting_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exported_by UUID NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
  
  -- Export filters
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  restaurant_id UUID REFERENCES user_roles(id) ON DELETE SET NULL,
  
  -- Export data
  delivery_count INTEGER NOT NULL,
  total_kegs INTEGER NOT NULL,
  total_deposit DECIMAL(10, 2),
  file_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_deliveries_driver ON deliveries(driver_id);
CREATE INDEX idx_deliveries_restaurant ON deliveries(restaurant_id);
CREATE INDEX idx_deliveries_brewery ON deliveries(brewery_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_created_at ON deliveries(created_at);
CREATE INDEX idx_delivery_items_delivery ON delivery_items(delivery_id);
CREATE INDEX idx_delivery_items_keg ON delivery_items(keg_id);
CREATE INDEX idx_accounting_exports_created_at ON accounting_exports(created_at);

-- Enable RLS
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_exports ENABLE ROW LEVEL SECURITY;

-- Deliveries policies
CREATE POLICY "Drivers can view their own deliveries" ON deliveries
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.id = deliveries.driver_id
    )
  );

CREATE POLICY "Restaurant managers can view their deliveries" ON deliveries
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.id = deliveries.restaurant_id
    )
  );

CREATE POLICY "Brewers can view all deliveries from their brewery" ON deliveries
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'BREWER'
      AND user_roles.brewery_id = deliveries.brewery_id
    )
  );

CREATE POLICY "Drivers can create deliveries" ON deliveries
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'DRIVER'
      AND user_roles.id = deliveries.driver_id
    )
  );

CREATE POLICY "Drivers and restaurant managers can update deliveries" ON deliveries
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND (
        user_roles.id = deliveries.driver_id OR
        user_roles.id = deliveries.restaurant_id
      )
    )
  )
  WITH CHECK (true);

-- Delivery items policies
CREATE POLICY "Users can view delivery items if they can view the delivery" ON delivery_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deliveries d
      JOIN user_roles ur ON ur.user_id = auth.uid()
      WHERE d.id = delivery_items.delivery_id
      AND (
        ur.id = d.driver_id OR
        ur.id = d.restaurant_id OR
        (ur.role = 'BREWER' AND ur.brewery_id = d.brewery_id)
      )
    )
  );

CREATE POLICY "Drivers can create delivery items" ON delivery_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deliveries d
      JOIN user_roles ur ON ur.user_id = auth.uid()
      WHERE d.id = delivery_items.delivery_id
      AND ur.role = 'DRIVER'
      AND ur.id = d.driver_id
    )
  );

-- Accounting exports policies
CREATE POLICY "Users can view their own exports" ON accounting_exports
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.id = accounting_exports.exported_by
    )
  );

CREATE POLICY "Brewers and managers can create exports" ON accounting_exports
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('BREWER', 'RESTAURANT_MANAGER')
    )
  );

-- Functions

-- Function to calculate deposit amount based on keg sizes
CREATE OR REPLACE FUNCTION calculate_delivery_deposit()
RETURNS TRIGGER AS $$
DECLARE
  total_deposit DECIMAL(10, 2) := 0;
BEGIN
  -- Calculate total from delivery_items
  SELECT COALESCE(SUM(deposit_value), 0) INTO total_deposit
  FROM delivery_items
  WHERE delivery_id = NEW.delivery_id;
  
  -- Update delivery
  UPDATE deliveries
  SET deposit_amount = total_deposit
  WHERE id = NEW.delivery_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update delivery deposit when items change
CREATE TRIGGER update_delivery_deposit
  AFTER INSERT OR UPDATE ON delivery_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_delivery_deposit();

-- Function to transfer kegs on delivery acceptance
CREATE OR REPLACE FUNCTION accept_delivery_transfer_kegs()
RETURNS TRIGGER AS $$
BEGIN
  -- Only execute when status changes to ACCEPTED
  IF NEW.status = 'ACCEPTED' AND OLD.status = 'PENDING' THEN
    -- Update all kegs in the delivery to new holder
    UPDATE kegs
    SET 
      current_holder = NEW.restaurant_id,
      last_scan = NEW.accepted_at,
      last_location = 'Delivery accepted'
    WHERE id = ANY(NEW.keg_ids);
    
    -- Record acceptance time
    NEW.accepted_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to transfer kegs when delivery is accepted
CREATE TRIGGER transfer_kegs_on_acceptance
  BEFORE UPDATE OF status ON deliveries
  FOR EACH ROW
  EXECUTE FUNCTION accept_delivery_transfer_kegs();

-- Comments
COMMENT ON TABLE deliveries IS 'Tracks keg deliveries with blockchain signatures and receipts';
COMMENT ON TABLE delivery_items IS 'Individual kegs in a delivery with snapshot data for receipts';
COMMENT ON TABLE accounting_exports IS 'Tracks CSV exports for accounting reconciliation';
COMMENT ON COLUMN deliveries.blockchain_tx_hash IS 'Thirdweb NFT transfer transaction hash - immutable receipt';
COMMENT ON COLUMN deliveries.deposit_amount IS 'Total deposit value for all kegs in delivery';
