import React, { useState, useEffect, useCallback } from 'react';
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

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  // Mock dealers data - flat array for dynamic search
  const allMockDealers: Dealer[] = [
    {
      id: '1',
      name: 'Fashion Hub',
      category: 'Clothing Store',
      address: 'Shop 12, Market Street, Mumbai',
      coordinates: { lat: 19.0760, lng: 72.8777 },
      distance: '1.2',
      rating: 4.5,
      reviews: 234,
      phone: '+91 98765 43210',
      open_now: true
    },
    {
      id: '2',
      name: 'Style Studio',
      category: 'Clothing Store',
      address: '45 Fashion Plaza, Mumbai',
      coordinates: { lat: 19.0800, lng: 72.8800 },
      distance: '2.1',
      rating: 4.7,
      reviews: 189,
      phone: '+91 98765 43211',
      open_now: true
    },
    {
      id: '3',
      name: 'Trendy Wear',
      category: 'Clothing Store',
      address: '78 Shopping Complex, Mumbai',
      coordinates: { lat: 19.0720, lng: 72.8750 },
      distance: '3.5',
      rating: 4.3,
      reviews: 156,
      phone: '+91 98765 43212',
      open_now: false
    },
    {
      id: '4',
      name: 'Silk & Cotton House',
      category: 'Fabric Store',
      address: '23 Textile Market, Mumbai',
      coordinates: { lat: 19.0780, lng: 72.8790 },
      distance: '1.8',
      rating: 4.6,
      reviews: 312,
      phone: '+91 98765 43213',
      open_now: true
    },
    {
      id: '5',
      name: 'Premium Fabrics',
      category: 'Fabric Store',
      address: '67 Fabric Lane, Mumbai',
      coordinates: { lat: 19.0750, lng: 72.8765 },
      distance: '2.3',
      rating: 4.8,
      reviews: 278,
      phone: '+91 98765 43214',
      open_now: true
    },
    {
      id: '6',
      name: 'Kids World Toys',
      category: 'Toy Store',
      address: '89 Children Plaza, Mumbai',
      coordinates: { lat: 19.0790, lng: 72.8785 },
      distance: '1.5',
      rating: 4.9,
      reviews: 421,
      phone: '+91 98765 43215',
      open_now: true
    },
    {
      id: '7',
      name: 'Happy Toys',
      category: 'Toy Store',
      address: '34 Play Street, Mumbai',
      coordinates: { lat: 19.0770, lng: 72.8760 },
      distance: '2.7',
      rating: 4.4,
      reviews: 198,
      phone: '+91 98765 43216',
      open_now: true
    },
    {
      id: '8',
      name: 'Spice Garden',
      category: 'Restaurant',
      address: '12 Food Street, Mumbai',
      coordinates: { lat: 19.0755, lng: 72.8780 },
      distance: '0.8',
      rating: 4.6,
      reviews: 567,
      phone: '+91 98765 43217',
      open_now: true
    },
    {
      id: '9',
      name: 'The Dining Room',
      category: 'Restaurant',
      address: '56 Culinary Lane, Mumbai',
      coordinates: { lat: 19.0800, lng: 72.8795 },
      distance: '2.0',
      rating: 4.7,
      reviews: 489,
      phone: '+91 98765 43218',
      open_now: true
    },
    {
      id: '10',
      name: 'Tech Electronics',
      category: 'Electronics Store',
      address: '91 Tech Plaza, Mumbai',
      coordinates: { lat: 19.0765, lng: 72.8770 },
      distance: '1.4',
      rating: 4.5,
      reviews: 345,
      phone: '+91 98765 43219',
      open_now: true
    },
    {
      id: '11',
      name: 'City Hardware',
      category: 'Hardware Store',
      address: '15 Builder Street, Mumbai',
      coordinates: { lat: 19.0775, lng: 72.8755 },
      distance: '1.9',
      rating: 4.3,
      reviews: 167,
      phone: '+91 98765 43220',
      open_now: true
    },
    {
      id: '12',
      name: 'Book Haven',
      category: 'Book Store',
      address: '42 Reader Lane, Mumbai',
      coordinates: { lat: 19.0785, lng: 72.8772 },
      distance: '1.6',
      rating: 4.8,
      reviews: 412,
      phone: '+91 98765 43221',
      open_now: true
    },
    {
      id: '13',
      name: 'Health Plus Pharmacy',
      category: 'Pharmacy',
      address: '28 Medical Street, Mumbai',
      coordinates: { lat: 19.0768, lng: 72.8788 },
      distance: '1.3',
      rating: 4.6,
      reviews: 289,
      phone: '+91 98765 43222',
      open_now: true
    },
    {
      id: '14',
      name: 'Cozy Cafe',
      category: 'Cafe',
      address: '33 Coffee Plaza, Mumbai',
      coordinates: { lat: 19.0758, lng: 72.8768 },
      distance: '1.1',
      rating: 4.7,
      reviews: 523,
      phone: '+91 98765 43223',
      open_now: true
    }
  ];

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

  const handleSearch = (query: string) => {
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

    setIsSearching(true);
    setSearchQuery(query);

    // Simulate API call with dynamic search
    setTimeout(() => {
      const searchLower = query.toLowerCase();
      
      // Search across name, category, and address
      const results = allMockDealers.filter(dealer => 
        dealer.name.toLowerCase().includes(searchLower) ||
        dealer.category.toLowerCase().includes(searchLower) ||
        dealer.address.toLowerCase().includes(searchLower)
      );
      
      // Filter by radius
      const filteredResults = results.filter(dealer => 
        parseFloat(dealer.distance) <= selectedRadius
      );

      setDealers(filteredResults);
      setIsSearching(false);

      if (filteredResults.length === 0) {
        toast({
          title: "No results found",
          description: "Try expanding your search radius or different keywords.",
        });
      }
    }, 800);
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
