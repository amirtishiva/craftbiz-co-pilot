import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Sparkles, ShoppingCart, Store, Map } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMarketplace, Product } from '@/hooks/useMarketplace';
import { useSellerProfile } from '@/hooks/useSellerProfile';
import ProductGrid from './ProductGrid';
import SellerOnboarding from './SellerOnboarding';
import SellerDashboard from './SellerDashboard';
import ShoppingCartDrawer from './ShoppingCartDrawer';
import ArtisanMap from './ArtisanMap';

const CRAFT_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'pottery', label: 'Pottery & Ceramics' },
  { value: 'textiles', label: 'Textiles & Weaving' },
  { value: 'jewelry', label: 'Jewelry & Accessories' },
  { value: 'woodwork', label: 'Woodwork & Carving' },
  { value: 'metalwork', label: 'Metalwork' },
  { value: 'leather', label: 'Leather Goods' },
  { value: 'paintings', label: 'Paintings & Art' },
  { value: 'handicrafts', label: 'Handicrafts' },
  { value: 'home-decor', label: 'Home Decor' },
];

const MarketplaceHome: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [view, setView] = useState<'browse' | 'seller-onboarding' | 'seller-dashboard' | 'artisan-map'>('browse');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { isLoading, products, searchProducts, cart, fetchCart } = useMarketplace();
  const { isSeller, sellerProfile, isLoading: sellerLoading } = useSellerProfile();

  useEffect(() => {
    searchProducts({ category: selectedCategory, sortBy });
    fetchCart();
  }, []);

  const handleSearch = () => {
    searchProducts({
      query: searchQuery,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      sortBy
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    searchProducts({
      query: searchQuery,
      category: category !== 'all' ? category : undefined,
      sortBy
    });
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    searchProducts({
      query: searchQuery,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      sortBy: sort
    });
  };

  if (view === 'seller-onboarding') {
    return <SellerOnboarding onComplete={() => setView('seller-dashboard')} onBack={() => setView('browse')} />;
  }

  if (view === 'seller-dashboard') {
    return <SellerDashboard onBack={() => setView('browse')} />;
  }

  if (view === 'artisan-map') {
    return (
      <ArtisanMap 
        onBack={() => setView('browse')} 
        onSelectSeller={(sellerId) => {
          // Could filter products by seller here
          setView('browse');
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Store className="h-8 w-8 text-primary" />
            Craft Stories Marketplace
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover authentic handcrafted products from skilled Indian artisans
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setView('artisan-map')}
          >
            <Map className="h-5 w-5 mr-2" />
            Find Artisans
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setIsCartOpen(true)}
            className="relative"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Cart
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Button>
          
          {isSeller ? (
            <Button onClick={() => setView('seller-dashboard')}>
              <Store className="h-5 w-5 mr-2" />
              Seller Dashboard
            </Button>
          ) : (
            <Button onClick={() => setView('seller-onboarding')}>
              <Sparkles className="h-5 w-5 mr-2" />
              Start Selling
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for handcrafted products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CRAFT_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Newest</SelectItem>
              <SelectItem value="price">Price: Low to High</SelectItem>
              <SelectItem value="title">Name</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleSearch}>
            Search
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <ProductGrid 
        products={products} 
        isLoading={isLoading}
        onRefresh={handleSearch}
      />

      {/* Shopping Cart Drawer */}
      <ShoppingCartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </div>
  );
};

export default MarketplaceHome;
