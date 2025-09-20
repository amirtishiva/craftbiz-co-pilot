import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Truck, 
  MapPin, 
  Search, 
  Filter,
  Star,
  Phone,
  Mail,
  ExternalLink,
  Heart,
  Building,
  Package,
  Clock,
  Route
} from 'lucide-react';

const SuppliersMap: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all-categories');
  const [selectedCity, setSelectedCity] = useState('all-cities');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

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

  const suppliers = [
    {
      id: 1,
      name: 'Rajesh Textile Mills',
      category: 'Textiles & Fabrics',
      city: 'Mumbai',
      address: 'Dadar East, Mumbai, Maharashtra',
      phone: '+91 98765 43210',
      email: 'contact@rjmtextiles.com',
      rating: 4.8,
      reviews: 127,
      minOrder: '500 units',
      deliveryTime: '7-10 days',
      specialties: ['Cotton Fabrics', 'Silk', 'Handloom'],
      verified: true,
      distance: '2.3 km'
    },
    {
      id: 2,
      name: 'Singh Packaging Solutions',
      category: 'Packaging',
      city: 'Delhi',
      address: 'Lajpat Nagar, New Delhi',
      phone: '+91 87654 32109',
      email: 'info@singhpack.com',
      rating: 4.6,
      reviews: 89,
      minOrder: '1000 pieces',
      deliveryTime: '3-5 days',
      specialties: ['Eco-friendly Packaging', 'Custom Boxes', 'Labels'],
      verified: true,
      distance: '5.1 km'
    },
    {
      id: 3,
      name: 'Craft Raw Materials Co.',
      category: 'Raw Materials',
      city: 'Bangalore',
      address: 'Commercial Street, Bangalore',
      phone: '+91 76543 21098',
      email: 'sales@craftraw.co.in',
      rating: 4.5,
      reviews: 156,
      minOrder: '50 kg',
      deliveryTime: '5-7 days',
      specialties: ['Natural Dyes', 'Clay', 'Wood', 'Metal Components'],
      verified: false,
      distance: '8.7 km'
    },
    {
      id: 4,
      name: 'Modern Print House',
      category: 'Printing Services',
      city: 'Chennai',
      address: 'T. Nagar, Chennai, Tamil Nadu',
      phone: '+91 65432 10987',
      email: 'orders@modernprint.in',
      rating: 4.7,
      reviews: 203,
      minOrder: '100 pieces',
      deliveryTime: '2-4 days',
      specialties: ['Digital Printing', 'Business Cards', 'Brochures', 'Banners'],
      verified: true,
      distance: '3.2 km'
    }
  ];

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.specialties.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || selectedCategory === 'all-categories' || supplier.category === selectedCategory;
    const matchesCity = !selectedCity || selectedCity === 'all-cities' || supplier.city === selectedCity;
    
    return matchesSearch && matchesCategory && matchesCity;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Truck className="h-8 w-8 text-orange-600" />
          <h1 className="text-3xl font-bold text-foreground">Local Suppliers & Dealers</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Connect with verified local suppliers for your business needs
        </p>
      </div>

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
          {filteredSuppliers.length === 0 ? (
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
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-foreground">{supplier.name}</h3>
                            {supplier.verified && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-2">{supplier.category}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {supplier.city} • {supplier.distance}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              {supplier.rating} ({supplier.reviews} reviews)
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-xs text-muted-foreground">Min Order</div>
                            <div className="text-sm font-medium">{supplier.minOrder}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-xs text-muted-foreground">Delivery</div>
                            <div className="text-sm font-medium">{supplier.deliveryTime}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-xs text-muted-foreground">Location</div>
                            <div className="text-sm font-medium">{supplier.city}</div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Specialties</h4>
                        <div className="flex flex-wrap gap-2">
                          {supplier.specialties.map((specialty, index) => (
                            <span
                              key={index}
                              className="bg-accent text-accent-foreground px-2 py-1 rounded-md text-xs"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Contact & Actions */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Button variant="craft" className="w-full">
                          <Phone className="mr-2 h-4 w-4" />
                          Contact Supplier
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Route className="mr-2 h-4 w-4" />
                          Get Directions
                        </Button>
                      </div>

                      <div className="p-3 bg-muted rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{supplier.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{supplier.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground text-xs">{supplier.address}</span>
                        </div>
                      </div>

                      <Button variant="ghost" className="w-full">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Full Profile
                      </Button>
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
            <Package className="h-8 w-8 mx-auto mb-2 text-green-600" />
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

export default SuppliersMap;