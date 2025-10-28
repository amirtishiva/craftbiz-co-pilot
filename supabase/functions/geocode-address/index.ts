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
    const apiKey = Deno.env.get('Google_Map_API');
    
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const { address }: GeocodeRequest = await req.json();
    console.log('Geocoding address:', address);

    if (!address) {
      throw new Error('Address is required');
    }

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    
    const response = await fetch(geocodeUrl);
    const data = await response.json();

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
      console.error('Geocoding failed:', data.status, data.error_message);
      throw new Error(data.error_message || 'Geocoding failed');
    }

  } catch (error) {
    console.error('Error in geocode-address:', error);
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