import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, Star, Store, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

type Libraries = ("places" | "geometry" | "drawing" | "visualization")[];
const GOOGLE_MAPS_LIBRARIES: Libraries = ['places'];

interface SellerLocation {
  id: string;
  user_id: string;
  shop_name: string;
  shop_tagline: string | null;
  artisan_story: string | null;
  craft_specialty: string[] | null;
  rating: number;
  total_sales: number;
  is_verified: boolean;
  latitude: number;
  longitude: number;
}

interface ArtisanMapProps {
  onBack: () => void;
  onSelectSeller?: (sellerId: string) => void;
}

const containerStyle = {
  width: '100%',
  height: '600px'
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629 // Center of India
};

const ArtisanMap: React.FC<ArtisanMapProps> = ({ onBack, onSelectSeller }) => {
  const [sellers, setSellers] = useState<SellerLocation[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<SellerLocation | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [isLoadingSellers, setIsLoadingSellers] = useState(true);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  useEffect(() => {
    fetchSellers();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          setMapCenter(loc);
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  };

  const fetchSellers = async () => {
    setIsLoadingSellers(true);
    try {
      const { data, error } = await supabase
        .from('seller_profiles')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;
      setSellers(data || []);
    } catch (error) {
      console.error('Error fetching sellers:', error);
    } finally {
      setIsLoadingSellers(false);
    }
  };

  const onMapLoad = useCallback((map: google.maps.Map) => {
    // Fit bounds to show all sellers if there are any
    if (sellers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      sellers.forEach(seller => {
        bounds.extend({ lat: seller.latitude, lng: seller.longitude });
      });
      if (userLocation) {
        bounds.extend(userLocation);
      }
      map.fitBounds(bounds);
    }
  }, [sellers, userLocation]);

  if (loadError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Button>
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-medium text-foreground mb-2">Map Loading Error</h3>
            <p className="text-muted-foreground">Unable to load Google Maps. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-8 w-8 text-primary" />
            Discover Artisans Near You
          </h1>
          <p className="text-muted-foreground mt-1">
            Find skilled craftspeople in your area and explore their creations
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {sellers.length} Artisans Found
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            {!isLoaded ? (
              <div className="h-[600px] flex items-center justify-center bg-muted">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-muted-foreground">Loading map...</p>
                </div>
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={5}
                onLoad={onMapLoad}
                options={{
                  styles: [
                    {
                      featureType: 'poi',
                      stylers: [{ visibility: 'off' }]
                    }
                  ]
                }}
              >
                {/* User location marker */}
                {userLocation && (
                  <Marker
                    position={userLocation}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 10,
                      fillColor: '#3b82f6',
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 3
                    }}
                    title="Your Location"
                  />
                )}

                {/* Seller markers */}
                {sellers.map((seller) => (
                  <Marker
                    key={seller.id}
                    position={{ lat: seller.latitude, lng: seller.longitude }}
                    onClick={() => setSelectedSeller(seller)}
                    icon={{
                      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="20" cy="20" r="18" fill="${seller.is_verified ? '#22c55e' : '#f97316'}" stroke="white" stroke-width="3"/>
                          <text x="20" y="26" text-anchor="middle" fill="white" font-size="18" font-weight="bold">🏺</text>
                        </svg>
                      `),
                      scaledSize: new google.maps.Size(40, 40)
                    }}
                  />
                ))}

                {/* Info Window */}
                {selectedSeller && (
                  <InfoWindow
                    position={{ lat: selectedSeller.latitude, lng: selectedSeller.longitude }}
                    onCloseClick={() => setSelectedSeller(null)}
                  >
                    <div className="p-2 max-w-[250px]">
                      <h3 className="font-bold text-foreground mb-1">{selectedSeller.shop_name}</h3>
                      {selectedSeller.shop_tagline && (
                        <p className="text-sm text-muted-foreground mb-2">{selectedSeller.shop_tagline}</p>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        {selectedSeller.rating > 0 && (
                          <span className="flex items-center gap-1 text-sm">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {selectedSeller.rating.toFixed(1)}
                          </span>
                        )}
                        {selectedSeller.is_verified && (
                          <Badge variant="secondary" className="text-xs">Verified</Badge>
                        )}
                      </div>
                      {selectedSeller.craft_specialty && selectedSeller.craft_specialty.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {selectedSeller.craft_specialty.slice(0, 2).map((craft, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{craft}</Badge>
                          ))}
                        </div>
                      )}
                      {onSelectSeller && (
                        <Button 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => onSelectSeller(selectedSeller.user_id)}
                        >
                          View Products
                        </Button>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            )}
          </Card>
        </div>

        {/* Seller List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Nearby Artisans</h2>
          
          {isLoadingSellers ? (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Loading artisans...</p>
            </div>
          ) : sellers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Store className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-muted-foreground">No artisans with locations found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-2">
              {sellers.map((seller) => (
                <Card 
                  key={seller.id}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    selectedSeller?.id === seller.id ? 'border-primary ring-2 ring-primary/20' : ''
                  }`}
                  onClick={() => {
                    setSelectedSeller(seller);
                    setMapCenter({ lat: seller.latitude, lng: seller.longitude });
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground truncate">
                            {seller.shop_name}
                          </h3>
                          {seller.is_verified && (
                            <Badge className="bg-green-500 text-white text-xs shrink-0">
                              ✓
                            </Badge>
                          )}
                        </div>
                        {seller.shop_tagline && (
                          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                            {seller.shop_tagline}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-sm">
                          {seller.rating > 0 && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {seller.rating.toFixed(1)}
                            </span>
                          )}
                          <span className="text-muted-foreground">
                            {seller.total_sales} sales
                          </span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Store className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    {seller.craft_specialty && seller.craft_specialty.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {seller.craft_specialty.slice(0, 3).map((craft, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {craft}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtisanMap;
