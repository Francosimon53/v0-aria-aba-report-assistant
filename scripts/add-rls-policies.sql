-- ARIA ABA Assessment Platform - Row Level Security Policies
-- This script adds RLS policies to protect user data in all assessment-related tables
-- Run this script in the Supabase SQL Editor or via the v0 scripts runner

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE assessment_client_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_interventions ENABLE ROW LEVEL SECURITY;

-- Políticas para assessment_client_data
CREATE POLICY "Users can view own client data" ON assessment_client_data 
FOR SELECT USING (
  assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert own client data" ON assessment_client_data 
FOR INSERT WITH CHECK (
  assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update own client data" ON assessment_client_data 
FOR UPDATE USING (
  assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete own client data" ON assessment_client_data 
FOR DELETE USING (
  assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid())
);

-- Políticas para parent_training_progress
CREATE POLICY "Users can view own parent training" ON parent_training_progress 
FOR SELECT USING (
  assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert own parent training" ON parent_training_progress 
FOR INSERT WITH CHECK (
  assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update own parent training" ON parent_training_progress 
FOR UPDATE USING (
  assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete own parent training" ON parent_training_progress 
FOR DELETE USING (
  assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid())
);

-- Políticas para report_sections
CREATE POLICY "Users can view own report sections" ON report_sections 
FOR SELECT USING (
  assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert own report sections" ON report_sections 
FOR INSERT WITH CHECK (
  assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update own report sections" ON report_sections 
FOR UPDATE USING (
  assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete own report sections" ON report_sections 
FOR DELETE USING (
  assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid())
);

-- Políticas para assessment_goals
CREATE POLICY "Users can view own goals" ON assessment_goals 
FOR SELECT USING (
  assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert own goals" ON assessment_goals 
FOR INSERT WITH CHECK (
  assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update own goals" ON assessment_goals 
FOR UPDATE USING (
  assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete own goals" ON assessment_goals 
FOR DELETE USING (
  assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid())
);

-- Políticas para assessment_interventions
CREATE POLICY "Users can view own interventions" ON assessment_interventions 
FOR SELECT USING (
  assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert own interventions" ON assessment_interventions 
FOR INSERT WITH CHECK (
  assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update own interventions" ON assessment_interventions 
FOR UPDATE USING (
  assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete own interventions" ON assessment_interventions 
FOR DELETE USING (
  assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid())
);

-- Verify policies were created
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN (
  'assessment_client_data',
  'parent_training_progress', 
  'report_sections',
  'assessment_goals',
  'assessment_interventions'
)
ORDER BY tablename, policyname;
