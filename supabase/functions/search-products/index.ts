import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      query, 
      category, 
      minPrice, 
      maxPrice, 
      sellerId,
      latitude,
      longitude,
      maxDistance,
      sortBy = 'created_at',
      sortOrder = 'desc',
      limit = 20,
      offset = 0
    } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Searching products:", { query, category, minPrice, maxPrice });

    let dbQuery = supabase
      .from('products')
      .select(`
        *,
        product_images!inner(id, image_url, is_primary, display_order),
        seller:profiles!products_seller_id_fkey(id, business_name, avatar_url, location),
        seller_profile:seller_profiles!inner(shop_name, rating, is_verified)
      `)
      .eq('status', 'active');

    // Text search
    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`);
    }

    // Category filter
    if (category && category !== 'all') {
      dbQuery = dbQuery.eq('category', category);
    }

    // Price range filters
    if (minPrice !== undefined) {
      dbQuery = dbQuery.gte('price', minPrice);
    }
    if (maxPrice !== undefined) {
      dbQuery = dbQuery.lte('price', maxPrice);
    }

    // Seller filter
    if (sellerId) {
      dbQuery = dbQuery.eq('seller_id', sellerId);
    }

    // Sorting
    const validSortFields = ['created_at', 'price', 'title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    dbQuery = dbQuery.order(sortField, { ascending: sortOrder === 'asc' });

    // Pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data: products, error, count } = await dbQuery;

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    // If location-based search, calculate distances
    let resultsWithDistance = products || [];
    if (latitude && longitude && products) {
      resultsWithDistance = products.map(product => {
        if (product.latitude && product.longitude) {
          const distance = calculateDistance(
            latitude, longitude,
            Number(product.latitude), Number(product.longitude)
          );
          return { ...product, distance };
        }
        return { ...product, distance: null };
      });

      // Filter by max distance if specified
      if (maxDistance) {
        resultsWithDistance = resultsWithDistance.filter(
          p => p.distance === null || p.distance <= maxDistance
        );
      }

      // Sort by distance if location search
      resultsWithDistance.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    console.log(`Found ${resultsWithDistance.length} products`);

    return new Response(JSON.stringify({ 
      success: true, 
      data: resultsWithDistance,
      count: resultsWithDistance.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error searching products:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : "Search failed" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
