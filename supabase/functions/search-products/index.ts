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
      offset = 0,
      // New filters
      materials,
      minRating,
      customizableOnly,
      verifiedOnly
    } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Searching products:", { query, category, minPrice, maxPrice, materials, minRating, customizableOnly, verifiedOnly });

    // Query products with images and seller profile info
    let dbQuery = supabase
      .from('products')
      .select(`
        *,
        product_images(id, image_url, is_primary, display_order),
        seller:profiles!products_seller_id_fkey(id, user_id, business_name, avatar_url, location)
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

    // Customizable filter
    if (customizableOnly) {
      dbQuery = dbQuery.eq('is_customizable', true);
    }

    // Materials filter (check if any of the specified materials are in the array)
    if (materials && materials.length > 0) {
      dbQuery = dbQuery.overlaps('materials_used', materials);
    }

    // Sorting - handle special cases separately, standard ones in DB query
    const standardSortFields = ['created_at', 'price', 'title'];
    const isStandardSort = standardSortFields.includes(sortBy);
    
    if (isStandardSort) {
      dbQuery = dbQuery.order(sortBy, { ascending: sortOrder === 'asc' });
    } else {
      // Default order for non-standard sorts (will be re-sorted later)
      dbQuery = dbQuery.order('created_at', { ascending: false });
    }

    // Pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data: products, error } = await dbQuery;

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    // Fetch seller profiles and order counts for the products
    let resultsWithSellerProfiles = products || [];
    if (products && products.length > 0) {
      const userIds = products
        .map(p => p.seller?.user_id)
        .filter(Boolean);
      
      const productIds = products.map(p => p.id);
      
      // Fetch seller profiles
      let sellerProfileMap = new Map();
      if (userIds.length > 0) {
        const { data: sellerProfiles } = await supabase
          .from('seller_profiles')
          .select('user_id, shop_name, rating, is_verified, total_sales')
          .in('user_id', userIds);
        
        sellerProfileMap = new Map(
          sellerProfiles?.map(sp => [sp.user_id, sp]) || []
        );
      }
      
      // Fetch order counts for popularity sorting
      let orderCountMap = new Map();
      if (sortBy === 'popularity' && productIds.length > 0) {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('product_id, quantity')
          .in('product_id', productIds);
        
        if (orderItems) {
          orderItems.forEach(item => {
            const currentCount = orderCountMap.get(item.product_id) || 0;
            orderCountMap.set(item.product_id, currentCount + (item.quantity || 1));
          });
        }
      }
      
      resultsWithSellerProfiles = products.map(product => ({
        ...product,
        seller_profile: product.seller?.user_id 
          ? sellerProfileMap.get(product.seller.user_id) 
          : null,
        order_count: orderCountMap.get(product.id) || 0
      }));

      // Apply rating and verified filters after joining with seller_profiles
      if (minRating !== undefined) {
        resultsWithSellerProfiles = resultsWithSellerProfiles.filter(
          p => p.seller_profile?.rating >= minRating
        );
      }

      if (verifiedOnly) {
        resultsWithSellerProfiles = resultsWithSellerProfiles.filter(
          p => p.seller_profile?.is_verified === true
        );
      }
      
      // Sort by rating if requested
      if (sortBy === 'rating') {
        resultsWithSellerProfiles.sort((a, b) => {
          const ratingA = a.seller_profile?.rating || 0;
          const ratingB = b.seller_profile?.rating || 0;
          return sortOrder === 'asc' ? ratingA - ratingB : ratingB - ratingA;
        });
      }
      
      // Sort by popularity (order count) if requested
      if (sortBy === 'popularity') {
        resultsWithSellerProfiles.sort((a, b) => {
          const countA = a.order_count || 0;
          const countB = b.order_count || 0;
          return sortOrder === 'asc' ? countA - countB : countB - countA;
        });
      }
    }

    // If location-based search, calculate distances
    let finalResults = resultsWithSellerProfiles;
    if (latitude && longitude && resultsWithSellerProfiles.length > 0) {
      finalResults = resultsWithSellerProfiles.map(product => {
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
        finalResults = finalResults.filter(
          p => p.distance === null || p.distance <= maxDistance
        );
      }

      // Sort by distance if location search
      finalResults.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    console.log(`Found ${finalResults.length} products`);

    return new Response(JSON.stringify({ 
      success: true, 
      data: finalResults,
      count: finalResults.length
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
