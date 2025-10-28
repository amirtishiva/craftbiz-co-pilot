import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  MapPin, 
  Search, 
  Star,
  Phone,
  Mail,
  Building,
  Route,
  Loader2,
  Navigation
} from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LocationPermissionPrompt from './LocationPermissionPrompt';
import NoResultsFound from './NoResultsFound';
import OfflineIndicator from './OfflineIndicator';
import { cache, isOnline } from '@/utils/cache';

type Libraries = ("places" | "geometry" | "drawing" | "visualization")[];
const GOOGLE_MAPS_LIBRARIES: Libraries = ['places'];

interface SupplierData {
  id: string;
  name: string;
  category: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  rating: number;
  reviews: number;
  verified: boolean;
  distance: string | null;
  latitude: number | null;
  longitude: number | null;
  specialties: string[];
  minOrder: string;
  deliveryTime: string;
  website_url?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '600px'
};

const SuppliersList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all-categories');
  const [selectedCity, setSelectedCity] = useState('all-cities');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierData | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const { toast } = useToast();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  const categories = [
    'Textiles & Fabrics',
    'Raw Materials',
    'Packaging',
    'Electronics',
    'Machinery',
    'Printing Services',
    'Logistics',
    'Marketing Materials'
  ];

  const cities = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Chennai',
    'Kolkata',
    'Pune',
    'Hyderabad',
    'Ahmedabad'
  ];

  // Detect user location
  useEffect(() => {
    if (navigator.geolocation && viewMode === 'map') {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, [viewMode]);

  // Fetch suppliers from database
  useEffect(() => {
    const fetchSuppliers = async () => {
      // Try to load from cache first if offline
      if (!isOnline()) {
        const cachedSuppliers = cache.get<SupplierData[]>('suppliers');
        if (cachedSuppliers) {
          setSuppliers(cachedSuppliers);
          setLoading(false);
          toast({
            title: "Offline Mode",
            description: "Showing cached supplier data.",
          });
          return;
        }
      }

      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .order('rating', { ascending: false });

        if (error) throw error;

        // Transform database data to match component structure
        const transformedSuppliers = data?.map((supplier: any) => ({
          id: supplier.id,
          name: supplier.name,
          category: supplier.category,
          city: supplier.city || 'N/A',
          address: supplier.address || 'Address not available',
          phone: supplier.contact_phone || '',
          email: supplier.contact_email || '',
          rating: supplier.rating || 0,
          reviews: Math.floor(Math.random() * 200), // Mock reviews count
          minOrder: '500 units',
          deliveryTime: '5-7 days',
          specialties: [supplier.description || supplier.category],
          verified: supplier.rating && supplier.rating >= 4.5,
          distance: null,
          latitude: supplier.latitude,
          longitude: supplier.longitude
        })) || [];

        setSuppliers(transformedSuppliers);
        
        // Cache the suppliers for offline use
        cache.set('suppliers', transformedSuppliers);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        toast({
          title: "Error loading suppliers",
          description: "Failed to load supplier data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, [toast]);

  // Fit map bounds when suppliers or map changes
  useEffect(() => {
    if (map && suppliers.length > 0 && viewMode === 'map') {
      const bounds = new google.maps.LatLngBounds();
      suppliers.forEach(supplier => {
        if (supplier.latitude && supplier.longitude) {
          bounds.extend({ lat: supplier.latitude, lng: supplier.longitude });
        }
      });
      if (userLocation) {
        bounds.extend(userLocation);
      }
      map.fitBounds(bounds);
    }
  }, [map, suppliers, viewMode, userLocation]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all-categories');
    setSelectedCity('all-cities');
  };

  const handleCitySelect = async (city: string) => {
    setSelectedCity(city);
    
    // Try to geocode the city for map centering
    try {
      const { data } = await supabase.functions.invoke('geocode-address', {
        body: { address: `${city}, India` }
      });
      
      if (data?.success && data.data) {
        setUserLocation({
          lat: data.data.latitude,
          lng: data.data.longitude
        });
      }
    } catch (error) {
      console.error('Failed to geocode city:', error);
    }
  };

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast({
            title: "Location detected",
            description: "Your location has been successfully detected.",
          });
        },
        (error) => {
          toast({
            title: "Location access denied",
            description: "Please enable location or select your city manually.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.specialties.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || selectedCategory === 'all-categories' || supplier.category === selectedCategory;
    const matchesCity = !selectedCity || selectedCity === 'all-cities' || supplier.city === selectedCity;
    
    return matchesSearch && matchesCategory && matchesCity;
  });

  return (
    <div>
      <OfflineIndicator />
      
      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers or materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Search suppliers"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-categories">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-cities">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                className="flex-1"
              >
                List View
              </Button>
              <Button 
                variant={viewMode === 'map' ? 'default' : 'outline'}
                onClick={() => setViewMode('map')}
                className="flex-1"
              >
                Map View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'list' ? (
        /* List View */
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading suppliers...</p>
              </CardContent>
            </Card>
          ) : filteredSuppliers.length === 0 ? (
            <NoResultsFound
              searchQuery={searchQuery}
              category={selectedCategory !== 'all-categories' ? selectedCategory : undefined}
              city={selectedCity !== 'all-cities' ? selectedCity : undefined}
              onClearFilters={handleClearFilters}
            />
          ) : (
            filteredSuppliers.map((supplier) => (
              <Card key={supplier.id} className="hover:shadow-medium transition-smooth">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     {/* Supplier Info */}
                    <div className="lg:col-span-2">
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-foreground">{supplier.name}</h3>
                          {supplier.verified && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-2">{supplier.category}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {supplier.city}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {supplier.rating} ({supplier.reviews} reviews)
                          </div>
                          {supplier.distance && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <Navigation className="h-4 w-4" />
                              {supplier.distance} km away
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact & Actions */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Button 
                          variant="craft" 
                          className="w-full"
                          asChild
                        >
                          <a href={`tel:${supplier.phone}`}>
                            <Phone className="mr-2 h-4 w-4" />
                            Contact Supplier
                          </a>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          asChild
                        >
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(supplier.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Route className="mr-2 h-4 w-4" />
                            Get Directions
                          </a>
                        </Button>
                      </div>

                      <div className="p-3 bg-muted rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${supplier.phone}`} className="text-muted-foreground hover:text-foreground transition-colors">
                            {supplier.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${supplier.email}`} className="text-muted-foreground hover:text-foreground transition-colors">
                            {supplier.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground text-xs">{supplier.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* Map View */
        !userLocation && viewMode === 'map' ? (
          <LocationPermissionPrompt
            onEnableLocation={requestLocation}
            onCitySelect={handleCitySelect}
          />
        ) : (
          <Card>
            <CardContent className="pt-6">
              {!isLoaded ? (
                <div className="h-[600px] bg-muted rounded-lg flex items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : filteredSuppliers.filter(s => s.latitude && s.longitude).length === 0 ? (
              <div className="h-[600px] bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Locations Available</h3>
                  <p className="text-muted-foreground">
                    No suppliers with location data match your filters
                  </p>
                </div>
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={userLocation || { lat: 20.5937, lng: 78.9629 }} // India center as fallback
                zoom={5}
                onLoad={(map) => setMap(map)}
                options={{
                  disableDefaultUI: false,
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: true,
                }}
              >
                {/* User Location Marker */}
                {userLocation && (
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
                )}

                {/* Supplier Markers */}
                {filteredSuppliers
                  .filter(supplier => supplier.latitude && supplier.longitude)
                  .map((supplier) => (
                    <Marker
                      key={supplier.id}
                      position={{ lat: supplier.latitude!, lng: supplier.longitude! }}
                      onClick={() => setSelectedSupplier(supplier)}
                      icon={{
                        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                        scale: 6,
                        fillColor: selectedSupplier?.id === supplier.id ? '#DC2626' : '#EF4444',
                        fillOpacity: 1,
                        strokeColor: '#FFFFFF',
                        strokeWeight: 2,
                        rotation: 180,
                      }}
                      title={supplier.name}
                    />
                  ))}

                {/* Info Window for Selected Supplier */}
                {selectedSupplier && selectedSupplier.latitude && selectedSupplier.longitude && (
                  <InfoWindow
                    position={{ lat: selectedSupplier.latitude, lng: selectedSupplier.longitude }}
                    onCloseClick={() => setSelectedSupplier(null)}
                  >
                    <div className="p-2 max-w-xs">
                      <h4 className="font-bold text-sm mb-1">{selectedSupplier.name}</h4>
                      <p className="text-xs text-gray-600 mb-2">{selectedSupplier.category}</p>
                      
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= selectedSupplier.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-xs text-gray-600 ml-1">
                          ({selectedSupplier.reviews})
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-700 mb-2">{selectedSupplier.address}</p>
                      
                      <div className="flex gap-2 mt-3">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${selectedSupplier.latitude},${selectedSupplier.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-primary text-white text-xs px-3 py-1.5 rounded hover:bg-primary/90 flex items-center justify-center gap-1"
                        >
                          <Navigation className="h-3 w-3" />
                          Directions
                        </a>
                        {selectedSupplier.phone && (
                          <a
                            href={`tel:${selectedSupplier.phone}`}
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
              )}
            </CardContent>
          </Card>
        )
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <Building className="h-8 w-8 mx-auto mb-2 text-accent-orange" />
            <div className="text-2xl font-bold text-foreground">{suppliers.length}</div>
            <div className="text-sm text-muted-foreground">Total Suppliers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-foreground">{cities.length}</div>
            <div className="text-sm text-muted-foreground">Cities Covered</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Truck className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-foreground">{categories.length}</div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold text-foreground">4.7</div>
            <div className="text-sm text-muted-foreground">Avg Rating</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuppliersList;
