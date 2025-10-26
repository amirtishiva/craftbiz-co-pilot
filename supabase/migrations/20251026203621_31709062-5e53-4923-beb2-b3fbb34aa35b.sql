-- Fix marketing_content platform check constraint to include 'x'
ALTER TABLE marketing_content DROP CONSTRAINT IF EXISTS marketing_content_platform_check;

-- Add updated constraint with all platforms including 'x'
ALTER TABLE marketing_content ADD CONSTRAINT marketing_content_platform_check 
  CHECK (platform IN ('facebook', 'instagram', 'linkedin', 'x'));