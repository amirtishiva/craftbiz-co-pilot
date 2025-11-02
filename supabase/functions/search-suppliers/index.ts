import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SearchSchema = z.object({
  searchQuery: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  userLocation: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional(),
  maxDistance: z.number().positive().max(500).optional()
});

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const params = SearchSchema.parse(body);
    console.log('Search params:', params);

    // Build query
    let query = supabase
      .from('suppliers')
      .select('*');

    // Apply filters
    if (params.category && params.category !== 'all-categories') {
      query = query.eq('category', params.category);
    }

    if (params.city && params.city !== 'all-cities') {
      query = query.eq('city', params.city);
    }

    if (params.searchQuery) {
      query = query.or(`name.ilike.%${params.searchQuery}%,description.ilike.%${params.searchQuery}%`);
    }

    const { data: suppliers, error } = await query.order('rating', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // Calculate distances if user location provided
    let suppliersWithDistance = suppliers || [];
    
    if (params.userLocation && suppliers) {
      suppliersWithDistance = suppliers
        .map(supplier => {
          if (!supplier.latitude || !supplier.longitude) {
            return { ...supplier, distance: null };
          }

          // Haversine formula to calculate distance
          const R = 6371; // Earth's radius in km
          const dLat = toRad(params.userLocation!.lat - supplier.latitude);
          const dLon = toRad(params.userLocation!.lng - supplier.longitude);
          
          const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(supplier.latitude)) * Math.cos(toRad(params.userLocation!.lat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;

          return {
            ...supplier,
            distance: parseFloat(distance.toFixed(1))
          };
        })
        .filter(supplier => {
          if (params.maxDistance && supplier.distance !== null) {
            return supplier.distance <= params.maxDistance;
          }
          return true;
        })
        .sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: suppliersWithDistance,
        count: suppliersWithDistance.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-suppliers:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}