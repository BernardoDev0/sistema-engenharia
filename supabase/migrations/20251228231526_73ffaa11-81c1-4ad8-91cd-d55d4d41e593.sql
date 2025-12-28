-- Create immutable audit_logs table for critical actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  performed_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins and compliance users to view all audit logs
CREATE POLICY "Admins and compliance can view audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'ADMIN')
  OR public.has_role(auth.uid(), 'COMPLIANCE_ESG')
);

-- Allow authenticated users to insert their own audit log entries
CREATE POLICY "Users can insert their own audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (performed_by_user_id = auth.uid());

-- Do NOT allow UPDATE or DELETE via RLS (no policies for those operations)

-- Hard protection: prevent updates and deletes even for elevated roles
CREATE OR REPLACE FUNCTION public.prevent_audit_log_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable and cannot be modified or deleted.';
END;
$$;

DROP TRIGGER IF EXISTS prevent_audit_logs_update ON public.audit_logs;
CREATE TRIGGER prevent_audit_logs_update
BEFORE UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW
EXECUTE FUNCTION public.prevent_audit_log_mutation();

-- Helpful indexes for querying audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by_user ON public.audit_logs(performed_by_user_id);