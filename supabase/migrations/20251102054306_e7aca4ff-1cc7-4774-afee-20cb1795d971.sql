-- Add UPDATE policies to tables missing them

-- Banner designs UPDATE policy
CREATE POLICY "Users can update their own banners"
ON public.banner_designs
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Design assets UPDATE policy
CREATE POLICY "Users can update their own assets"
ON public.design_assets
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Marketing content UPDATE policy
CREATE POLICY "Users can update their own content"
ON public.marketing_content
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);