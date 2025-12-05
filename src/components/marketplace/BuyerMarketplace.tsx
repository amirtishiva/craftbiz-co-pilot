import React, { useState, useEffect } from 'react';
import { Search, Filter, Map, ShoppingCart, MessageSquare, Store } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMarketplace } from '@/hooks/useMarketplace';
import ProductGrid from './ProductGrid';
import ShoppingCartDrawer from './ShoppingCartDrawer';
import ArtisanMap from './ArtisanMap';
import BuyerCustomOrders from './BuyerCustomOrders';
import NotificationBell from './NotificationBell';

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

const BuyerMarketplace: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [view, setView] = useState<'browse' | 'artisan-map' | 'my-orders'>('browse');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { isLoading, products, searchProducts, cart, fetchCart } = useMarketplace();

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

  if (view === 'artisan-map') {
    return (
      <ArtisanMap 
        onBack={() => setView('browse')} 
        onSelectSeller={() => setView('browse')}
      />
    );
  }

  if (view === 'my-orders') {
    return <BuyerCustomOrders onBack={() => setView('browse')} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
              <Store className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary flex-shrink-0" />
              <span className="truncate">Craft Stories Marketplace</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Discover authentic handcrafted products from skilled Indian artisans
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <NotificationBell />
            
            <Button
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm"
              onClick={() => setView('artisan-map')}
            >
              <Map className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Find Artisans</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm"
              onClick={() => setView('my-orders')}
            >
              <MessageSquare className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">My Orders</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Cart</span>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] sm:text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 mb-6 sm:mb-8">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Search Input - Full width on all screens */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <Input
              placeholder="Search for handcrafted products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9 sm:pl-10 text-sm sm:text-base h-9 sm:h-10"
            />
          </div>
          
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-[180px] lg:w-[200px] h-9 sm:h-10 text-sm">
                <Filter className="h-4 w-4 mr-2 flex-shrink-0" />
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
              <SelectTrigger className="w-full sm:w-[140px] lg:w-[160px] h-9 sm:h-10 text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Newest</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="title">Name</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleSearch} 
              size="sm" 
              className="w-full sm:w-auto h-9 sm:h-10 text-sm"
            >
              Search
            </Button>
          </div>
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

export default BuyerMarketplace;
