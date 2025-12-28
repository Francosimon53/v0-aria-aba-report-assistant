-- Assessment Schema for ARIA
-- Supports multi-assessment, multi-device with RLS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Assessments table (main metadata)
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Assessment metadata
  evaluation_type TEXT NOT NULL DEFAULT 'initial',
  status TEXT NOT NULL DEFAULT 'draft', -- draft|submitted|completed|archived
  title TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS assessments_user_id_idx ON public.assessments(user_id);
CREATE INDEX IF NOT EXISTS assessments_updated_at_idx ON public.assessments(updated_at);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_assessments_updated_at
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- RLS Policies
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assessments_select_own"
  ON public.assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "assessments_insert_own"
  ON public.assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "assessments_update_own"
  ON public.assessments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
