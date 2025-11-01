-- Add columns to marketing_content table for image-based generation
ALTER TABLE marketing_content 
ADD COLUMN IF NOT EXISTS input_type TEXT DEFAULT 'text' CHECK (input_type IN ('text', 'image')),
ADD COLUMN IF NOT EXISTS image_data TEXT;