import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Truck, 
  MapPin, 
  Search, 
  Star,
  Phone,
  Mail,
  Building,
  Route
} from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const SuppliersList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all-categories');
  const [selectedCity, setSelectedCity] = useState('all-cities');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  // Fetch suppliers from database
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .order('name');

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
          distance: 'N/A'
        })) || [];

        setSuppliers(transformedSuppliers);
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

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.specialties.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || selectedCategory === 'all-categories' || supplier.category === selectedCategory;
    const matchesCity = !selectedCity || selectedCity === 'all-cities' || supplier.city === selectedCity;
    
    return matchesSearch && matchesCategory && matchesCity;
  });

  return (
    <div>
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
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Suppliers Found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or browse all suppliers
                </p>
              </CardContent>
            </Card>
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
        <Card>
          <CardContent className="pt-6">
            <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
                <p className="text-muted-foreground mb-4">
                  Map view showing supplier locations will be displayed here
                </p>
                <Button variant="warm">
                  <Route className="mr-2 h-4 w-4" />
                  Enable Location Services
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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
