import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Search, 
  Star,
  Phone,
  Navigation,
  Loader2,
  AlertCircle,
  Store,
  Shirt,
  Package,
  Utensils,
  ShoppingBag
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Libraries = ("places" | "geometry" | "drawing" | "visualization")[];

interface Location {
  lat: number;
  lng: number;
}

interface Dealer {
  id: string;
  name: string;
  category: string;
  address: string;
  coordinates: Location;
  distance: string;
  rating: number;
  reviews: number;
  phone?: string;
  open_now?: boolean;
}

const mapContainerStyle = {
  width: '100%',
  height: '600px'
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

const LocalDealersMap: React.FC = () => {
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'granted' | 'denied' | 'unsupported'>('loading');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRadius, setSelectedRadius] = useState(5); // km
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const libraries: Libraries = ['places'];
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const distanceMatrixRef = useRef<google.maps.DistanceMatrixService | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  // Initialize Google Maps services
  useEffect(() => {
    if (isLoaded && map) {
      placesServiceRef.current = new google.maps.places.PlacesService(map);
      geocoderRef.current = new google.maps.Geocoder();
      distanceMatrixRef.current = new google.maps.DistanceMatrixService();
    }
  }, [isLoaded, map]);

  // Detect user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationStatus('granted');
          toast({
            title: "Location detected",
            description: "Your location has been successfully detected.",
          });
        },
        (error) => {
          setLocationStatus('denied');
          toast({
            title: "Location access denied",
            description: "Please enable location services to find nearby dealers.",
            variant: "destructive",
          });
        }
      );
    } else {
      setLocationStatus('unsupported');
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    // Initialize services when map loads
    placesServiceRef.current = new google.maps.places.PlacesService(map);
    geocoderRef.current = new google.maps.Geocoder();
    distanceMatrixRef.current = new google.maps.DistanceMatrixService();
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Fit map bounds to show all dealers
  useEffect(() => {
    if (map && dealers.length > 0 && userLocation) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(userLocation);
      dealers.forEach(dealer => {
        bounds.extend(dealer.coordinates);
      });
      map.fitBounds(bounds);
    }
  }, [map, dealers, userLocation]);

  const calculateDistances = async (places: google.maps.places.PlaceResult[], origin: Location): Promise<Dealer[]> => {
    if (!distanceMatrixRef.current || places.length === 0) return [];

    return new Promise((resolve) => {
      const destinations = places
        .filter(place => place.geometry?.location)
        .map(place => place.geometry!.location!);

      if (destinations.length === 0) {
        resolve([]);
        return;
      }

      distanceMatrixRef.current!.getDistanceMatrix(
        {
          origins: [new google.maps.LatLng(origin.lat, origin.lng)],
          destinations: destinations,
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
        },
        (response, status) => {
          if (status === google.maps.DistanceMatrixStatus.OK && response) {
            const dealers: Dealer[] = places
              .filter(place => place.geometry?.location)
              .map((place, index) => {
                const element = response.rows[0]?.elements[index];
                const distance = element?.distance?.value 
                  ? (element.distance.value / 1000).toFixed(1) 
                  : '0';

                return {
                  id: place.place_id || `place-${index}`,
                  name: place.name || 'Unknown',
                  category: place.types?.[0]?.replace(/_/g, ' ') || 'Store',
                  address: place.vicinity || place.formatted_address || 'Address not available',
                  coordinates: {
                    lat: place.geometry!.location!.lat(),
                    lng: place.geometry!.location!.lng(),
                  },
                  distance,
                  rating: place.rating || 0,
                  reviews: place.user_ratings_total || 0,
                  phone: place.formatted_phone_number,
                  open_now: place.opening_hours?.isOpen?.() || false,
                };
              })
              .filter(dealer => parseFloat(dealer.distance) <= selectedRadius)
              .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

            resolve(dealers);
          } else {
            resolve([]);
          }
        }
      );
    });
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setDealers([]);
      setSearchQuery('');
      return;
    }

    if (!userLocation) {
      toast({
        title: "Location required",
        description: "Please enable location services to search.",
        variant: "destructive",
      });
      return;
    }

    if (!placesServiceRef.current) {
      toast({
        title: "Maps not ready",
        description: "Please wait for the map to load.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);

    const request: google.maps.places.PlaceSearchRequest = {
      location: new google.maps.LatLng(userLocation.lat, userLocation.lng),
      radius: selectedRadius * 1000, // Convert km to meters
      keyword: query,
    };

    placesServiceRef.current.nearbySearch(request, async (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const dealersWithDistances = await calculateDistances(results, userLocation);
        setDealers(dealersWithDistances);
        setIsSearching(false);

        if (dealersWithDistances.length === 0) {
          toast({
            title: "No results found",
            description: "Try expanding your search radius or different keywords.",
          });
        } else {
          toast({
            title: "Search complete",
            description: `Found ${dealersWithDistances.length} nearby locations.`,
          });
        }
      } else {
        setIsSearching(false);
        setDealers([]);
        toast({
          title: "Search failed",
          description: "Unable to find nearby locations. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const handleQuickSearch = (category: string) => {
    handleSearch(category);
  };

  const openDirections = (dealer: Dealer) => {
    if (!userLocation) return;
    
    const url = `https://www.google.com/maps/dir/?api=1` +
      `&origin=${userLocation.lat},${userLocation.lng}` +
      `&destination=${dealer.coordinates.lat},${dealer.coordinates.lng}` +
      `&travelmode=driving`;
    window.open(url, '_blank');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loadError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Maps</h3>
            <p className="text-muted-foreground mb-4">
              There was an error loading Google Maps. Please check your API key configuration.
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isLoaded || locationStatus === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {locationStatus === 'loading' ? 'Detecting your location...' : 'Loading maps...'}
        </h3>
        <p className="text-muted-foreground">
          {locationStatus === 'loading' ? 'Please allow location access when prompted' : 'Please wait'}
        </p>
      </div>
    );
  }

  if (locationStatus === 'denied' || locationStatus === 'unsupported') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2">Location Access Required</h3>
            <p className="text-muted-foreground mb-4">
              {locationStatus === 'denied' 
                ? 'Please enable location services in your browser settings to use Local Dealers.'
                : 'Your browser does not support geolocation services.'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Location Status */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Navigation className="h-4 w-4 text-green-600" />
            <span>
              Location detected: {userLocation?.lat.toFixed(4)}, {userLocation?.lng.toFixed(4)}
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for anything: pharmacy, bookstore, cafe, hardware..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              className="pl-10 h-12 text-base"
            />
            <Button
              className="absolute right-2 top-2"
              onClick={() => handleSearch(searchQuery)}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
            </Button>
          </div>

          {/* Quick Search Buttons - Optional Filters */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Quick search suggestions:</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleQuickSearch('clothing')}
                disabled={isSearching}
              >
                <Shirt className="mr-2 h-4 w-4" />
                Clothing
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleQuickSearch('fabrics')}
                disabled={isSearching}
              >
                <Package className="mr-2 h-4 w-4" />
                Fabrics
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleQuickSearch('toy')}
                disabled={isSearching}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Toy Stores
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleQuickSearch('restaurant')}
                disabled={isSearching}
              >
                <Utensils className="mr-2 h-4 w-4" />
                Restaurants
              </Button>
            </div>
          </div>

          {/* Radius Filter */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Search Radius:</span>
            <div className="flex gap-2">
              {[1, 5, 10, 25].map((radius) => (
                <Button
                  key={radius}
                  variant={selectedRadius === radius ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRadius(radius)}
                >
                  {radius} km
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results List Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold">
            {dealers.length > 0 ? `${dealers.length} dealers found` : 'Search for dealers'}
          </h3>
          
          {dealers.length > 0 ? (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {dealers.map((dealer) => (
                <Card 
                  key={dealer.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedDealer?.id === dealer.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedDealer(dealer)}
                >
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{dealer.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{dealer.category}</p>
                      </div>
                      {dealer.open_now && (
                        <Badge variant="secondary" className="text-xs">Open</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {renderStars(dealer.rating)}
                      <span className="text-xs text-muted-foreground">
                        ({dealer.reviews})
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {dealer.distance} km away
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDirections(dealer);
                      }}
                    >
                      <Navigation className="mr-2 h-3 w-3" />
                      Get Directions
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Use the search bar or quick buttons above to find nearby dealers
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Google Map View */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              {userLocation ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={userLocation}
                  zoom={13}
                  onLoad={onLoad}
                  onUnmount={onUnmount}
                  options={mapOptions}
                >
                  {/* User Location Marker */}
                  <Marker
                    position={userLocation}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 8,
                      fillColor: '#3B82F6',
                      fillOpacity: 1,
                      strokeColor: '#FFFFFF',
                      strokeWeight: 2,
                    }}
                    title="Your Location"
                  />

                  {/* Dealer Markers */}
                  {dealers.map((dealer) => (
                    <Marker
                      key={dealer.id}
                      position={dealer.coordinates}
                      onClick={() => setSelectedDealer(dealer)}
                      icon={{
                        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                        scale: 6,
                        fillColor: selectedDealer?.id === dealer.id ? '#DC2626' : '#EF4444',
                        fillOpacity: 1,
                        strokeColor: '#FFFFFF',
                        strokeWeight: 2,
                        rotation: 180,
                      }}
                      title={dealer.name}
                    />
                  ))}

                  {/* Info Window for Selected Dealer */}
                  {selectedDealer && (
                    <InfoWindow
                      position={selectedDealer.coordinates}
                      onCloseClick={() => setSelectedDealer(null)}
                    >
                      <div className="p-2 max-w-xs">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-sm mb-1">{selectedDealer.name}</h4>
                            <p className="text-xs text-gray-600">{selectedDealer.category}</p>
                          </div>
                          {selectedDealer.open_now && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Open</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 mb-2">
                          {renderStars(selectedDealer.rating)}
                          <span className="text-xs text-gray-600">
                            ({selectedDealer.reviews} reviews)
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-700 mb-2">{selectedDealer.address}</p>
                        
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
                          <MapPin className="h-3 w-3" />
                          <span>{selectedDealer.distance} km away</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            className="flex-1 bg-primary text-white text-xs px-3 py-1.5 rounded hover:bg-primary/90 flex items-center justify-center gap-1"
                            onClick={() => openDirections(selectedDealer)}
                          >
                            <Navigation className="h-3 w-3" />
                            Directions
                          </button>
                          {selectedDealer.phone && (
                            <a
                              href={`tel:${selectedDealer.phone}`}
                              className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded hover:bg-gray-200 flex items-center justify-center"
                            >
                              <Phone className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              ) : (
                <div className="h-[600px] bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Store className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Interactive Map View</h3>
                    <p className="text-muted-foreground">
                      Waiting for location...
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LocalDealersMap;
