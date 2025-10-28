-- Add coordinates column to suppliers table for map functionality
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric;

-- Add index for better performance on location-based queries
CREATE INDEX IF NOT EXISTS idx_suppliers_coordinates ON public.suppliers(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON public.suppliers(category);
CREATE INDEX IF NOT EXISTS idx_suppliers_city ON public.suppliers(city);