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

// Map categories to Google Places types
const categoryToPlaceType: Record<string, string> = {
  'Textiles & Fabrics': 'fabric store',
  'Raw Materials': 'hardware store',
  'Packaging': 'store',
  'Electronics': 'electronics store',
  'Machinery': 'hardware store',
  'Printing Services': 'print shop',
  'Logistics': 'moving company',
  'Marketing Materials': 'print shop'
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const params = SearchSchema.parse(body);
    console.log('Search params:', params);

    const googleApiKey = Deno.env.get('Google_Map_API_Key');
    
    if (!googleApiKey) {
      console.error('Missing Google Maps API key configuration');
      return new Response(
        JSON.stringify({ success: false, error: 'Service configuration error', data: [], count: 0 }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build search query for Google Places API
    let searchText = params.searchQuery || 'suppliers';
    
    // Add category to search if specified
    if (params.category && params.category !== 'all-categories') {
      const placeType = categoryToPlaceType[params.category] || params.category;
      searchText = `${placeType} ${searchText}`;
    }

    // Add city to search if specified
    if (params.city && params.city !== 'all-cities') {
      searchText = `${searchText} in ${params.city}, India`;
    } else {
      searchText = `${searchText} in India`;
    }

    console.log('Google Places search query:', searchText);

    // Determine search location
    let location = '';
    let radius = 50000; // 50km default radius

    if (params.userLocation) {
      location = `${params.userLocation.lat},${params.userLocation.lng}`;
      if (params.maxDistance) {
        radius = params.maxDistance * 1000; // Convert km to meters
      }
    } else if (params.city && params.city !== 'all-cities') {
      // Get coordinates for the city
      const cityCoordinates = await geocodeCity(params.city, googleApiKey);
      if (cityCoordinates) {
        location = `${cityCoordinates.lat},${cityCoordinates.lng}`;
      }
    }

    // Call Google Places Text Search API
    const placesUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    placesUrl.searchParams.append('query', searchText);
    if (location) {
      placesUrl.searchParams.append('location', location);
      placesUrl.searchParams.append('radius', radius.toString());
    }
    placesUrl.searchParams.append('key', googleApiKey);

    console.log('Calling Google Places API...');
    const placesResponse = await fetch(placesUrl.toString());
    const placesData = await placesResponse.json();

    if (placesData.status !== 'OK' && placesData.status !== 'ZERO_RESULTS') {
      console.error('Places API error:', placesData.status);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to search suppliers. Please try again.', data: [], count: 0 }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform Google Places results to supplier format
    const suppliers = (placesData.results || []).slice(0, 15).map((place: any) => {
      const supplier = {
        id: place.place_id,
        name: place.name,
        category: params.category && params.category !== 'all-categories' ? params.category : 'General',
        city: extractCity(place.formatted_address) || params.city || 'India',
        address: place.formatted_address,
        contact_phone: place.formatted_phone_number || 'Contact via Google Maps',
        contact_email: 'info@' + place.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
        rating: place.rating || 4.0,
        latitude: place.geometry?.location?.lat || null,
        longitude: place.geometry?.location?.lng || null,
        description: place.types?.join(', ') || 'Supplier',
        website_url: place.website || null,
        distance: null as number | null
      };

      // Calculate distance if user location provided
      if (params.userLocation && supplier.latitude && supplier.longitude) {
        const R = 6371; // Earth's radius in km
        const dLat = toRad(params.userLocation.lat - supplier.latitude);
        const dLon = toRad(params.userLocation.lng - supplier.longitude);
        
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(supplier.latitude)) * Math.cos(toRad(params.userLocation.lat)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        supplier.distance = parseFloat((R * c).toFixed(1));
      }

      return supplier;
    });

    // Filter by max distance if specified
    let filteredSuppliers = suppliers;
    if (params.maxDistance && params.userLocation) {
      filteredSuppliers = suppliers.filter(s => 
        s.distance === null || s.distance <= params.maxDistance!
      );
    }

    // Sort by distance if available, otherwise by rating
    filteredSuppliers.sort((a, b) => {
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      if (a.distance !== null) return -1;
      if (b.distance !== null) return 1;
      return (b.rating || 0) - (a.rating || 0);
    });

    console.log(`Found ${filteredSuppliers.length} suppliers from Google Places`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: filteredSuppliers,
        count: filteredSuppliers.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-suppliers:', error);
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      const firstError = error.errors?.[0];
      const message = firstError?.message || 'Invalid input data';
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: message,
          data: [],
          count: 0
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to search suppliers. Please try again.',
        data: [],
        count: 0
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

async function geocodeCity(city: string, apiKey: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const geocodeUrl = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    geocodeUrl.searchParams.append('address', `${city}, India`);
    geocodeUrl.searchParams.append('key', apiKey);

    const response = await fetch(geocodeUrl.toString());
    const data = await response.json();

    if (data.status === 'OK' && data.results[0]) {
      return {
        lat: data.results[0].geometry.location.lat,
        lng: data.results[0].geometry.location.lng
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

function extractCity(address: string): string | null {
  // Try to extract city from formatted address
  const parts = address.split(',');
  if (parts.length >= 2) {
    // Usually city is second to last or third to last part
    const cityPart = parts[parts.length - 3] || parts[parts.length - 2];
    return cityPart?.trim() || null;
  }
  return null;
}