-- Ensure mcp_audit_log table exists with all required columns
CREATE TABLE IF NOT EXISTS mcp_audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name   TEXT NOT NULL,
  client_id   TEXT,
  action      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns to existing table (safe if they already exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'mcp_audit_log' AND column_name = 'created_at') THEN
    ALTER TABLE mcp_audit_log ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'mcp_audit_log' AND column_name = 'client_id') THEN
    ALTER TABLE mcp_audit_log ADD COLUMN client_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'mcp_audit_log' AND column_name = 'action') THEN
    ALTER TABLE mcp_audit_log ADD COLUMN action TEXT;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mcp_audit_log_user_id ON mcp_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_audit_log_tool_name ON mcp_audit_log(tool_name);
CREATE INDEX IF NOT EXISTS idx_mcp_audit_log_created_at ON mcp_audit_log(created_at);

-- Enable RLS
ALTER TABLE mcp_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies (use DO block to avoid errors if they already exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mcp_audit_log' AND policyname = 'Users can insert own audit logs') THEN
    CREATE POLICY "Users can insert own audit logs"
      ON mcp_audit_log FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mcp_audit_log' AND policyname = 'Users can read own audit logs') THEN
    CREATE POLICY "Users can read own audit logs"
      ON mcp_audit_log FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

COMMENT ON TABLE mcp_audit_log IS 'Audit trail for WebMCP tool invocations from the ARIA client';
COMMENT ON COLUMN mcp_audit_log.tool_name IS 'Name of the MCP tool that was called (e.g. aria_list_assessments)';
COMMENT ON COLUMN mcp_audit_log.client_id IS 'Optional client/assessment identifier relevant to the call';
COMMENT ON COLUMN mcp_audit_log.action IS 'Serialized summary of the tool call inputs';
