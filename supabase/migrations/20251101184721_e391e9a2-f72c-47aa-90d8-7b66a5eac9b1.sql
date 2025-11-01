-- Create banner_designs table
CREATE TABLE public.banner_designs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.business_plans(id),
  
  -- Configuration
  banner_size TEXT NOT NULL,
  custom_width INTEGER,
  custom_height INTEGER,
  input_type TEXT NOT NULL CHECK (input_type IN ('text', 'image')),
  
  -- Content
  headline TEXT NOT NULL,
  subheadline TEXT,
  cta_text TEXT,
  
  -- Design
  style_theme TEXT NOT NULL,
  color_scheme TEXT NOT NULL,
  primary_color TEXT,
  secondary_color TEXT,
  
  -- Input data
  text_description TEXT,
  reference_image_data TEXT,
  
  -- Generated outputs (store all 3 variants)
  banner_url_png_1 TEXT NOT NULL,
  banner_url_png_2 TEXT,
  banner_url_png_3 TEXT,
  
  prompt_used TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.banner_designs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own banners" 
ON public.banner_designs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own banners" 
ON public.banner_designs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own banners" 
ON public.banner_designs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_banner_designs_updated_at
BEFORE UPDATE ON public.banner_designs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();