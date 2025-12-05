import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Store } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMarketplace } from '@/hooks/useMarketplace';
import { useOfflineProducts } from '@/hooks/useOfflineProducts';
import ProductGrid from './ProductGrid';
import ShoppingCartDrawer from './ShoppingCartDrawer';
import ArtisanMap from './ArtisanMap';
import BuyerCustomOrders from './BuyerCustomOrders';
import NotificationBell from './NotificationBell';
import MobileBottomNav from './MobileBottomNav';
import OfflineIndicator from './OfflineIndicator';

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
  const [view, setView] = useState<'browse' | 'search' | 'artisan-map' | 'my-orders' | 'cart'>('browse');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  const { isLoading, products, searchProducts, cart, fetchCart } = useMarketplace();
  const { cachedProducts, isOffline, isCached, cacheTimestamp, cacheProductsData } = useOfflineProducts();

  // Use cached products when offline
  const displayProducts = isOffline && cachedProducts.length > 0 ? cachedProducts : products;

  useEffect(() => {
    searchProducts({ category: selectedCategory, sortBy });
    fetchCart();
  }, []);

  // Cache products when they're loaded
  useEffect(() => {
    if (products.length > 0 && !isOffline) {
      cacheProductsData(products);
    }
  }, [products, isOffline, cacheProductsData]);

  const handleSearch = useCallback(() => {
    searchProducts({
      query: searchQuery,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      sortBy
    });
  }, [searchQuery, selectedCategory, sortBy, searchProducts]);

  const handleRefresh = useCallback(async () => {
    await searchProducts({
      query: searchQuery,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      sortBy
    });
    await fetchCart();
  }, [searchQuery, selectedCategory, sortBy, searchProducts, fetchCart]);

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

  const handleMobileNavChange = (tab: 'browse' | 'search' | 'artisan-map' | 'my-orders' | 'cart') => {
    if (tab === 'cart') {
      setIsCartOpen(true);
    } else if (tab === 'search') {
      setShowSearchPanel(true);
      setView('browse');
    } else {
      setShowSearchPanel(false);
      setView(tab);
    }
  };

  if (view === 'artisan-map') {
    return (
      <>
        <ArtisanMap 
          onBack={() => setView('browse')} 
          onSelectSeller={() => setView('browse')}
        />
        <MobileBottomNav 
          activeTab="artisan-map" 
          onTabChange={handleMobileNavChange}
          cartCount={cart.length}
        />
      </>
    );
  }

  if (view === 'my-orders') {
    return (
      <>
        <div className="pb-16 sm:pb-0">
          <BuyerCustomOrders onBack={() => setView('browse')} />
        </div>
        <MobileBottomNav 
          activeTab="my-orders" 
          onTabChange={handleMobileNavChange}
          cartCount={cart.length}
        />
      </>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-20 sm:pb-8">
        {/* Offline Indicator */}
        <OfflineIndicator 
          isOffline={isOffline} 
          isCached={isCached} 
          cacheTimestamp={cacheTimestamp} 
        />

        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
                <Store className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary flex-shrink-0" />
                <span className="truncate">Craft Stories Marketplace</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1 hidden sm:block">
                Discover authentic handcrafted products from skilled Indian artisans
              </p>
            </div>
            
            {/* Action Buttons - Hidden on mobile, shown on desktop */}
            <div className="hidden sm:flex items-center gap-2 sm:gap-3 flex-wrap">
              <NotificationBell />
            </div>
          </div>
        </div>

        {/* Search & Filters - Always visible on desktop, collapsible on mobile */}
        <div className={`bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 mb-6 sm:mb-8 ${showSearchPanel ? 'block' : 'hidden sm:block'}`}>
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
                disabled={isOffline}
              />
            </div>
            
            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Select value={selectedCategory} onValueChange={handleCategoryChange} disabled={isOffline}>
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
              
              <Select value={sortBy} onValueChange={handleSortChange} disabled={isOffline}>
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
                onClick={() => {
                  handleSearch();
                  setShowSearchPanel(false);
                }} 
                size="sm" 
                className="w-full sm:w-auto h-9 sm:h-10 text-sm"
                disabled={isOffline}
              >
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid with Pull-to-Refresh */}
        <ProductGrid 
          products={displayProducts} 
          isLoading={isLoading && !isOffline}
          onRefresh={handleRefresh}
          enablePullToRefresh={!isOffline}
        />

        {/* Shopping Cart Drawer */}
        <ShoppingCartDrawer 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
        />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        activeTab={showSearchPanel ? 'search' : 'browse'} 
        onTabChange={handleMobileNavChange}
        cartCount={cart.length}
      />
    </>
  );
};

export default BuyerMarketplace;
