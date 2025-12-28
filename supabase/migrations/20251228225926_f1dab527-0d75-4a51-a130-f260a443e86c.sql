-- Create enum for equipment status
CREATE TYPE public.equipment_status AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'DISCARDED');

-- Create equipment table
CREATE TABLE public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  certification TEXT,
  status public.equipment_status NOT NULL DEFAULT 'AVAILABLE',
  total_quantity INTEGER NOT NULL DEFAULT 0 CHECK (total_quantity >= 0),
  quantity_in_use INTEGER NOT NULL DEFAULT 0 CHECK (quantity_in_use >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT quantity_check CHECK (quantity_in_use <= total_quantity)
);

-- Enable RLS on equipment
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- RLS policies for equipment table
-- Everyone authenticated can view equipment
CREATE POLICY "Authenticated users can view equipment"
ON public.equipment
FOR SELECT
TO authenticated
USING (true);

-- Admins can insert equipment
CREATE POLICY "Admins can create equipment"
ON public.equipment
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'ADMIN'));

-- Admins can update equipment
CREATE POLICY "Admins can update equipment"
ON public.equipment
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'ADMIN'));

-- Admins can delete equipment
CREATE POLICY "Admins can delete equipment"
ON public.equipment
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'ADMIN'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_equipment_updated_at
BEFORE UPDATE ON public.equipment
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_equipment_status ON public.equipment(status);
CREATE INDEX idx_equipment_category ON public.equipment(category);