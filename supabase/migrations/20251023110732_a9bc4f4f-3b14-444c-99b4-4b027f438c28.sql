-- Create business_ideas table
CREATE TABLE public.business_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input_method TEXT NOT NULL CHECK (input_method IN ('text', 'voice', 'image')),
  original_text TEXT,
  refined_idea TEXT,
  product_image_url TEXT,
  voice_recording_url TEXT,
  detected_language TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_ideas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_ideas
CREATE POLICY "Users can view their own ideas"
  ON public.business_ideas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ideas"
  ON public.business_ideas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas"
  ON public.business_ideas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas"
  ON public.business_ideas FOR DELETE
  USING (auth.uid() = user_id);

-- Create business_plans table
CREATE TABLE public.business_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES public.business_ideas(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  tagline TEXT,
  executive_summary TEXT,
  market_analysis TEXT,
  target_customers TEXT,
  competitive_advantage TEXT,
  revenue_model TEXT,
  marketing_strategy TEXT,
  operations_plan TEXT,
  financial_projections TEXT,
  risk_analysis TEXT,
  implementation_timeline TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_plans
CREATE POLICY "Users can view their own plans"
  ON public.business_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plans"
  ON public.business_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
  ON public.business_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
  ON public.business_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Create design_assets table
CREATE TABLE public.design_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.business_plans(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('logo', 'scene', 'mockup')),
  asset_url TEXT NOT NULL,
  prompt_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.design_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for design_assets
CREATE POLICY "Users can view their own assets"
  ON public.design_assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assets"
  ON public.design_assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets"
  ON public.design_assets FOR DELETE
  USING (auth.uid() = user_id);

-- Create marketing_content table
CREATE TABLE public.marketing_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.business_plans(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'twitter', 'linkedin', 'whatsapp')),
  content_text TEXT NOT NULL,
  hashtags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketing_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketing_content
CREATE POLICY "Users can view their own content"
  ON public.marketing_content FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content"
  ON public.marketing_content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content"
  ON public.marketing_content FOR DELETE
  USING (auth.uid() = user_id);

-- Create suppliers table (public data)
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  website_url TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  rating DECIMAL(2,1),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for suppliers (public read access)
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- RLS Policy for suppliers - anyone can read
CREATE POLICY "Anyone can view suppliers"
  ON public.suppliers FOR SELECT
  USING (true);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at columns
CREATE TRIGGER update_business_ideas_updated_at
  BEFORE UPDATE ON public.business_ideas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_plans_updated_at
  BEFORE UPDATE ON public.business_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_business_ideas_user_id ON public.business_ideas(user_id);
CREATE INDEX idx_business_plans_user_id ON public.business_plans(user_id);
CREATE INDEX idx_business_plans_idea_id ON public.business_plans(idea_id);
CREATE INDEX idx_design_assets_user_id ON public.design_assets(user_id);
CREATE INDEX idx_design_assets_plan_id ON public.design_assets(plan_id);
CREATE INDEX idx_marketing_content_user_id ON public.marketing_content(user_id);
CREATE INDEX idx_marketing_content_plan_id ON public.marketing_content(plan_id);
CREATE INDEX idx_suppliers_category ON public.suppliers(category);
CREATE INDEX idx_suppliers_city ON public.suppliers(city);