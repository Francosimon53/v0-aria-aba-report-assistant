-- Create baa_requests table for BAA form submissions
CREATE TABLE IF NOT EXISTS baa_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organization_type TEXT NOT NULL,
  number_of_bcbas TEXT,
  message TEXT,
  authorized BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_baa_requests_email ON baa_requests(email);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_baa_requests_status ON baa_requests(status);

-- Enable RLS (optional - can be disabled for admin-only table)
ALTER TABLE baa_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access (admin only)
CREATE POLICY "Service role can manage BAA requests" ON baa_requests
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
