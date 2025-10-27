-- Add content_type column to marketing_content table
ALTER TABLE public.marketing_content 
ADD COLUMN IF NOT EXISTS content_type TEXT;

-- Add check constraint for valid content types
ALTER TABLE public.marketing_content
DROP CONSTRAINT IF EXISTS marketing_content_content_type_check;

ALTER TABLE public.marketing_content
ADD CONSTRAINT marketing_content_content_type_check 
CHECK (content_type IN ('social-post', 'ad-copy', 'email', 'blog-intro') OR content_type IS NULL);