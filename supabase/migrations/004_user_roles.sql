-- Add user roles to the auth.users table
-- This extends the existing auth.users table with role information

-- Ensure required tables exist (in case previous migrations weren't run)
CREATE TABLE IF NOT EXISTS breweries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table to store additional user information
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('brewer', 'driver', 'restaurant_manager', 'admin')),
  brewery_id UUID REFERENCES breweries(id),
  restaurant_id UUID REFERENCES restaurants(id),
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_brewery_id ON user_profiles(brewery_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_restaurant_id ON user_profiles(restaurant_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'restaurant_manager')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sample users will be created automatically via the trigger when they sign up through Supabase Auth
-- No manual inserts needed - the trigger will handle profile creation for real users

-- Update RLS policies for other tables to be role-based
DROP POLICY IF EXISTS "Allow all operations on breweries" ON breweries;
DROP POLICY IF EXISTS "Allow all operations on restaurants" ON restaurants;
DROP POLICY IF EXISTS "Allow all operations on kegs" ON kegs;
DROP POLICY IF EXISTS "Allow all operations on deliveries" ON deliveries;
DROP POLICY IF EXISTS "Allow all operations on delivery_items" ON delivery_items;
DROP POLICY IF EXISTS "Allow all operations on keg_scans" ON keg_scans;

-- Breweries: Only brewers and admins can access
CREATE POLICY "Brewers can access breweries" ON breweries 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('brewer', 'admin')
    )
  );

-- Restaurants: Only restaurant managers and admins can access
CREATE POLICY "Restaurant managers can access restaurants" ON restaurants 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('restaurant_manager', 'admin')
    )
  );

-- Kegs: All roles can view, but only brewers can create/update
CREATE POLICY "All roles can view kegs" ON kegs 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('brewer', 'driver', 'restaurant_manager', 'admin')
    )
  );

CREATE POLICY "Brewers can insert kegs" ON kegs 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('brewer', 'admin')
    )
  );

CREATE POLICY "Brewers can update kegs" ON kegs 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('brewer', 'admin')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('brewer', 'admin')
    )
  );

CREATE POLICY "Brewers can delete kegs" ON kegs 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('brewer', 'admin')
    )
  );

-- Deliveries: Drivers and admins can manage, others can view
CREATE POLICY "All roles can view deliveries" ON deliveries 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('brewer', 'driver', 'restaurant_manager', 'admin')
    )
  );

CREATE POLICY "Drivers can insert deliveries" ON deliveries 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('driver', 'admin')
    )
  );

CREATE POLICY "Drivers can update deliveries" ON deliveries 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('driver', 'admin')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('driver', 'admin')
    )
  );

CREATE POLICY "Drivers can delete deliveries" ON deliveries 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('driver', 'admin')
    )
  );

-- Delivery items: Same as deliveries
CREATE POLICY "All roles can view delivery items" ON delivery_items 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('brewer', 'driver', 'restaurant_manager', 'admin')
    )
  );

CREATE POLICY "Drivers can insert delivery items" ON delivery_items 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('driver', 'admin')
    )
  );

CREATE POLICY "Drivers can update delivery items" ON delivery_items 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('driver', 'admin')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('driver', 'admin')
    )
  );

CREATE POLICY "Drivers can delete delivery items" ON delivery_items 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('driver', 'admin')
    )
  );

-- Keg scans: All roles can create scans, all can view
CREATE POLICY "All roles can manage keg scans" ON keg_scans 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('brewer', 'driver', 'restaurant_manager', 'admin')
    )
  );
