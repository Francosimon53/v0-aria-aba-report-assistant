-- Add trial tracking fields to profiles table if they don't exist
-- These fields may already exist, so we use IF NOT EXISTS pattern

-- Add trial_started_at if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'trial_started_at') THEN
        ALTER TABLE profiles ADD COLUMN trial_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add trial_ends_at if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'trial_ends_at') THEN
        ALTER TABLE profiles ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days');
    END IF;
END $$;

-- Add trial_used if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'trial_used') THEN
        ALTER TABLE profiles ADD COLUMN trial_used BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Update subscription_status default to 'trialing' if column exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' AND column_name = 'subscription_status') THEN
        ALTER TABLE profiles ALTER COLUMN subscription_status SET DEFAULT 'trialing';
    END IF;
END $$;

-- Set trial_ends_at for existing users who don't have it set
UPDATE profiles 
SET trial_ends_at = created_at + INTERVAL '7 days'
WHERE trial_ends_at IS NULL AND created_at IS NOT NULL;

-- Set trial_started_at for existing users who don't have it set
UPDATE profiles 
SET trial_started_at = created_at
WHERE trial_started_at IS NULL AND created_at IS NOT NULL;

-- Create index for faster trial expiration queries
CREATE INDEX IF NOT EXISTS idx_profiles_trial_ends_at ON profiles(trial_ends_at);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);

-- Comment for documentation
COMMENT ON COLUMN profiles.trial_started_at IS 'When the user started their 7-day free trial';
COMMENT ON COLUMN profiles.trial_ends_at IS 'When the user 7-day free trial expires';
COMMENT ON COLUMN profiles.trial_used IS 'Whether the user has already used their free trial (prevents re-trials)';
COMMENT ON COLUMN profiles.subscription_status IS 'Current subscription status: trialing, active, canceled, expired';
