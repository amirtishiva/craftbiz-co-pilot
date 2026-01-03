const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeocodeRequest {
  address: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('Google_Map_API_Key');
    
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const { address }: GeocodeRequest = await req.json();
    console.log('Geocoding address:', address);

    if (!address) {
      throw new Error('Address is required');
    }

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    console.log('Geocode API URL (without key):', geocodeUrl.replace(apiKey, '***'));
    
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    console.log('Geocode API response status:', data.status);

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      const formattedAddress = data.results[0].formatted_address;

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            latitude: location.lat,
            longitude: location.lng,
            formatted_address: formattedAddress
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error('Geocoding failed:', data.status, data.error_message || '');
      
      let errorMessage = 'Geocoding failed';
      if (data.status === 'REQUEST_DENIED') {
        errorMessage = 'Geocoding API access denied. Please ensure the Geocoding API is enabled.';
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        errorMessage = 'API quota exceeded.';
      } else if (data.status === 'ZERO_RESULTS') {
        errorMessage = 'No results found for this address.';
      }
      
      throw new Error(data.error_message || errorMessage);
    }

  } catch (error: unknown) {
    console.error('Error in geocode-address:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
