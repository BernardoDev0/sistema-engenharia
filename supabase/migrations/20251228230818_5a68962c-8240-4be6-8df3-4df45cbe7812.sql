-- Create enum for loan status
CREATE TYPE public.loan_status AS ENUM ('ACTIVE', 'RETURNED', 'DAMAGED');

-- Create loans table
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status public.loan_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  returned_at TIMESTAMP WITH TIME ZONE,
  damage_comment TEXT,
  CONSTRAINT damage_comment_required CHECK (
    (status = 'DAMAGED' AND damage_comment IS NOT NULL AND length(trim(damage_comment)) > 0) OR
    (status != 'DAMAGED')
  ),
  CONSTRAINT returned_at_required CHECK (
    (status IN ('RETURNED', 'DAMAGED') AND returned_at IS NOT NULL) OR
    (status = 'ACTIVE' AND returned_at IS NULL)
  )
);

-- Enable RLS on loans
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- RLS policies for loans table
-- Users can view their own loans
CREATE POLICY "Users can view their own loans"
ON public.loans
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all loans
CREATE POLICY "Admins can view all loans"
ON public.loans
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ADMIN'));

-- Authenticated users can create loans
CREATE POLICY "Authenticated users can create loans"
ON public.loans
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own active loans
CREATE POLICY "Users can update their own loans"
ON public.loans
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Create function to update equipment quantity_in_use when loan is created
CREATE OR REPLACE FUNCTION public.update_equipment_quantity_on_loan_create()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Increment quantity_in_use for the equipment
  UPDATE public.equipment
  SET quantity_in_use = quantity_in_use + NEW.quantity
  WHERE id = NEW.equipment_id;
  
  -- Check if the update violated the quantity constraint
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Equipment not found';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create function to update equipment quantity_in_use when loan is returned
CREATE OR REPLACE FUNCTION public.update_equipment_quantity_on_loan_return()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only decrement if status changed from ACTIVE to RETURNED or DAMAGED
  IF OLD.status = 'ACTIVE' AND NEW.status IN ('RETURNED', 'DAMAGED') THEN
    UPDATE public.equipment
    SET quantity_in_use = quantity_in_use - OLD.quantity
    WHERE id = OLD.equipment_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Equipment not found';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for loan creation
CREATE TRIGGER loan_create_update_equipment
AFTER INSERT ON public.loans
FOR EACH ROW
EXECUTE FUNCTION public.update_equipment_quantity_on_loan_create();

-- Create trigger for loan return
CREATE TRIGGER loan_return_update_equipment
AFTER UPDATE ON public.loans
FOR EACH ROW
EXECUTE FUNCTION public.update_equipment_quantity_on_loan_return();

-- Create indexes for faster queries
CREATE INDEX idx_loans_user_id ON public.loans(user_id);
CREATE INDEX idx_loans_equipment_id ON public.loans(equipment_id);
CREATE INDEX idx_loans_status ON public.loans(status);
CREATE INDEX idx_loans_active ON public.loans(status) WHERE status = 'ACTIVE';