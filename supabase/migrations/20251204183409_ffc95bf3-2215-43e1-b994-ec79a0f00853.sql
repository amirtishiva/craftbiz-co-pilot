
-- Products table with story-driven fields
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  story TEXT,
  craft_heritage TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  ai_suggested_price DECIMAL(10,2),
  currency TEXT DEFAULT 'INR',
  stock_quantity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  is_customizable BOOLEAN DEFAULT false,
  customization_options JSONB,
  materials_used TEXT[],
  creation_time_hours INTEGER,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Product images
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seller profiles (extends existing profiles)
CREATE TABLE public.seller_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  shop_tagline TEXT,
  artisan_story TEXT,
  craft_specialty TEXT[],
  years_of_experience INTEGER,
  social_links JSONB,
  is_verified BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shopping cart
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  customization_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id),
  seller_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_payment_status TEXT,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  customization_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Custom order requests
CREATE TABLE public.custom_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id),
  seller_id UUID NOT NULL REFERENCES public.profiles(id),
  description TEXT NOT NULL,
  reference_images TEXT[],
  proposed_budget DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  seller_quote DECIMAL(10,2),
  seller_notes TEXT,
  estimated_delivery_days INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  buyer_id UUID NOT NULL REFERENCES auth.users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Wishlist
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Products RLS Policies
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (status = 'active');

CREATE POLICY "Sellers can view their own products" ON public.products
  FOR SELECT USING (seller_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Sellers can create products" ON public.products
  FOR INSERT WITH CHECK (seller_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Sellers can update their own products" ON public.products
  FOR UPDATE USING (seller_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Sellers can delete their own products" ON public.products
  FOR DELETE USING (seller_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Product Images RLS Policies
CREATE POLICY "Anyone can view product images" ON public.product_images
  FOR SELECT USING (true);

CREATE POLICY "Sellers can manage their product images" ON public.product_images
  FOR ALL USING (
    product_id IN (
      SELECT p.id FROM public.products p
      JOIN public.profiles pr ON p.seller_id = pr.id
      WHERE pr.user_id = auth.uid()
    )
  );

-- Seller Profiles RLS Policies
CREATE POLICY "Anyone can view seller profiles" ON public.seller_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own seller profile" ON public.seller_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own seller profile" ON public.seller_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Cart Items RLS Policies
CREATE POLICY "Users can view their own cart" ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their cart" ON public.cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their cart" ON public.cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can remove from their cart" ON public.cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- Orders RLS Policies
CREATE POLICY "Buyers can view their orders" ON public.orders
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view orders for their products" ON public.orders
  FOR SELECT USING (seller_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update order status" ON public.orders
  FOR UPDATE USING (seller_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Order Items RLS Policies
CREATE POLICY "Users can view their order items" ON public.order_items
  FOR SELECT USING (
    order_id IN (SELECT id FROM public.orders WHERE buyer_id = auth.uid() OR seller_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  );

CREATE POLICY "Users can create order items" ON public.order_items
  FOR INSERT WITH CHECK (
    order_id IN (SELECT id FROM public.orders WHERE buyer_id = auth.uid())
  );

-- Custom Requests RLS Policies
CREATE POLICY "Buyers can view their custom requests" ON public.custom_requests
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view custom requests sent to them" ON public.custom_requests
  FOR SELECT USING (seller_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create custom requests" ON public.custom_requests
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can update their pending requests" ON public.custom_requests
  FOR UPDATE USING (auth.uid() = buyer_id AND status = 'pending');

CREATE POLICY "Sellers can respond to custom requests" ON public.custom_requests
  FOR UPDATE USING (seller_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Reviews RLS Policies
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Buyers can create reviews for purchased products" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = buyer_id AND
    order_id IN (SELECT id FROM public.orders WHERE buyer_id = auth.uid() AND status = 'delivered')
  );

CREATE POLICY "Buyers can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = buyer_id);

CREATE POLICY "Buyers can delete their own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = buyer_id);

-- Wishlists RLS Policies
CREATE POLICY "Users can view their wishlist" ON public.wishlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to wishlist" ON public.wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from wishlist" ON public.wishlists
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seller_profiles_updated_at
  BEFORE UPDATE ON public.seller_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_requests_updated_at
  BEFORE UPDATE ON public.custom_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Storage policies for product images
CREATE POLICY "Anyone can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own product images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own product images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
