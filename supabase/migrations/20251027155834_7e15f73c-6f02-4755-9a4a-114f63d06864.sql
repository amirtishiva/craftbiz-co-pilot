-- Make platform column nullable to support non-social media content types
ALTER TABLE public.marketing_content 
ALTER COLUMN platform DROP NOT NULL;