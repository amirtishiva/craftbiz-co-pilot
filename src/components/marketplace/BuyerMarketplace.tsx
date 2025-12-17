import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Store, X, SlidersHorizontal, IndianRupee, Heart, GitCompare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useMarketplace } from '@/hooks/useMarketplace';
import { useWishlist } from '@/hooks/useWishlist';
import { useProductComparison } from '@/hooks/useProductComparison';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useOfflineProducts } from '@/hooks/useOfflineProducts';
import { useBackgroundSync } from '@/hooks/useBackgroundSync';
import ProductGrid from './ProductGrid';
import ShoppingCartDrawer from './ShoppingCartDrawer';
import ArtisanMap from './ArtisanMap';
import OrderTracking from './OrderTracking';
import NotificationBell from './NotificationBell';
import MobileBottomNav from './MobileBottomNav';
import OfflineIndicator from './OfflineIndicator';
import WishlistView from './WishlistView';
import ComparisonBar from './ComparisonBar';
import ProductComparisonModal from './ProductComparisonModal';
import RecentlyViewedSection from './RecentlyViewedSection';
import QuickViewModal from './QuickViewModal';
import SearchAutocomplete from './SearchAutocomplete';
import AdvancedFilters from './AdvancedFilters';
import ShareProductModal from './ShareProductModal';

const CRAFT_CATEGORIES = [
  { value: 'all', label: 'All Categories', emoji: '✨' },
  { value: 'pottery', label: 'Pottery & Ceramics', emoji: '🏺' },
  { value: 'textiles', label: 'Textiles & Weaving', emoji: '🧵' },
  { value: 'jewelry', label: 'Jewelry & Accessories', emoji: '💍' },
  { value: 'woodwork', label: 'Woodwork & Carving', emoji: '🪵' },
  { value: 'metalwork', label: 'Metalwork', emoji: '⚙️' },
  { value: 'leather', label: 'Leather Goods', emoji: '👜' },
  { value: 'paintings', label: 'Paintings & Art', emoji: '🎨' },
  { value: 'handicrafts', label: 'Handicrafts', emoji: '🎁' },
  { value: 'home-decor', label: 'Home Decor', emoji: '🏠' },
];

const PRICE_RANGES = [
  { value: 'all', label: 'Any Price', min: undefined, max: undefined },
  { value: 'under-500', label: 'Under ₹500', min: undefined, max: 500 },
  { value: '500-1000', label: '₹500 - ₹1,000', min: 500, max: 1000 },
  { value: '1000-2500', label: '₹1,000 - ₹2,500', min: 1000, max: 2500 },
  { value: '2500-5000', label: '₹2,500 - ₹5,000', min: 2500, max: 5000 },
  { value: 'over-5000', label: 'Over ₹5,000', min: 5000, max: undefined },
];

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'title', label: 'Name: A to Z' },
];

const BuyerMarketplace: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [customMinPrice, setCustomMinPrice] = useState('');
  const [customMaxPrice, setCustomMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [view, setView] = useState<'browse' | 'search' | 'artisan-map' | 'my-orders' | 'cart' | 'wishlist'>('browse');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [shareProduct, setShareProduct] = useState<any>(null);
  
  // Advanced filter states
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | undefined>();
  const [customizableOnly, setCustomizableOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const { isLoading, products, searchProducts, cart, fetchCart } = useMarketplace();
  const { wishlistItems, wishlistProductIds, toggleWishlist, count: wishlistCount } = useWishlist();
  const { 
    comparisonProducts, 
    comparisonCount, 
    maxItems: maxComparisonItems,
    toggleComparison, 
    removeFromComparison, 
    clearComparison, 
    isInComparison,
    canAddMore: canAddToComparison
  } = useProductComparison();
  const { recentProducts, addToRecentlyViewed, clearRecentlyViewed } = useRecentlyViewed();
  const { cachedProducts, isOffline, isCached, cacheTimestamp, cacheProductsData } = useOfflineProducts();
  const { pendingCount, isSyncing, syncNow } = useBackgroundSync();

  // Create comparison product IDs set for efficient lookup
  const comparisonProductIds = new Set(comparisonProducts.map(p => p.id));

  // Use cached products when offline
  const displayProducts = isOffline && cachedProducts.length > 0 ? cachedProducts : products;

  // Count active filters
  const activeFilterCount = [
    selectedCategory !== 'all',
    selectedPriceRange !== 'all' || minPrice !== undefined || maxPrice !== undefined,
    selectedMaterials.length > 0,
    minRating !== undefined,
    customizableOnly,
    verifiedOnly
  ].filter(Boolean).length;

  useEffect(() => {
    searchProducts({ category: selectedCategory, sortBy: getSortParams(sortBy).sortBy, sortOrder: getSortParams(sortBy).sortOrder });
    fetchCart();
  }, []);

  // Cache products when they're loaded
  useEffect(() => {
    if (products.length > 0 && !isOffline) {
      cacheProductsData(products);
    }
  }, [products, isOffline, cacheProductsData]);

  const getSortParams = (sort: string) => {
    switch (sort) {
      case 'price_asc':
        return { sortBy: 'price', sortOrder: 'asc' as const };
      case 'price_desc':
        return { sortBy: 'price', sortOrder: 'desc' as const };
      case 'title':
        return { sortBy: 'title', sortOrder: 'asc' as const };
      default:
        return { sortBy: 'created_at', sortOrder: 'desc' as const };
    }
  };

  const executeSearch = useCallback(() => {
    const { sortBy: sortField, sortOrder } = getSortParams(sortBy);
    searchProducts({
      query: searchQuery || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      minPrice,
      maxPrice,
      sortBy: sortField,
      sortOrder,
      materials: selectedMaterials.length > 0 ? selectedMaterials : undefined,
      minRating,
      customizableOnly: customizableOnly || undefined,
      verifiedOnly: verifiedOnly || undefined
    });
  }, [searchQuery, selectedCategory, minPrice, maxPrice, sortBy, selectedMaterials, minRating, customizableOnly, verifiedOnly, searchProducts]);

  const handleSearch = useCallback(() => {
    executeSearch();
    setShowSearchPanel(false);
  }, [executeSearch]);

  const handleRefresh = useCallback(async () => {
    await executeSearch();
    await fetchCart();
  }, [executeSearch, fetchCart]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const { sortBy: sortField, sortOrder } = getSortParams(sortBy);
    searchProducts({
      query: searchQuery || undefined,
      category: category !== 'all' ? category : undefined,
      minPrice,
      maxPrice,
      sortBy: sortField,
      sortOrder,
      materials: selectedMaterials.length > 0 ? selectedMaterials : undefined,
      minRating,
      customizableOnly: customizableOnly || undefined,
      verifiedOnly: verifiedOnly || undefined
    });
  };

  const handlePriceRangeChange = (rangeValue: string) => {
    setSelectedPriceRange(rangeValue);
    const range = PRICE_RANGES.find(r => r.value === rangeValue);
    if (range) {
      setMinPrice(range.min);
      setMaxPrice(range.max);
      setCustomMinPrice(range.min?.toString() || '');
      setCustomMaxPrice(range.max?.toString() || '');
      
      const { sortBy: sortField, sortOrder } = getSortParams(sortBy);
      searchProducts({
        query: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        minPrice: range.min,
        maxPrice: range.max,
        sortBy: sortField,
        sortOrder
      });
    }
  };

  const handleCustomPriceApply = () => {
    const newMin = customMinPrice ? parseInt(customMinPrice) : undefined;
    const newMax = customMaxPrice ? parseInt(customMaxPrice) : undefined;
    setMinPrice(newMin);
    setMaxPrice(newMax);
    setSelectedPriceRange('custom');
    
    const { sortBy: sortField, sortOrder } = getSortParams(sortBy);
    searchProducts({
      query: searchQuery || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      minPrice: newMin,
      maxPrice: newMax,
      sortBy: sortField,
      sortOrder
    });
    setIsFilterOpen(false);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    const { sortBy: sortField, sortOrder } = getSortParams(sort);
    searchProducts({
      query: searchQuery || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      minPrice,
      maxPrice,
      sortBy: sortField,
      sortOrder
    });
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedPriceRange('all');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setCustomMinPrice('');
    setCustomMaxPrice('');
    setSortBy('created_at');
    setSelectedMaterials([]);
    setMinRating(undefined);
    setCustomizableOnly(false);
    setVerifiedOnly(false);
    searchProducts({});
  };

  const handleToggleWishlist = async (productId: string) => {
    await toggleWishlist(productId);
  };

  const handleProductView = (product: any) => {
    addToRecentlyViewed(product);
  };

  const handleRecentProductClick = (product: any) => {
    addToRecentlyViewed(product);
    setSelectedProduct(product);
  };

  const handleApplyAdvancedFilters = () => {
    executeSearch();
    setIsFilterOpen(false);
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
        <div className="pb-16 sm:pb-0 px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <OrderTracking onBack={() => setView('browse')} />
        </div>
        <MobileBottomNav 
          activeTab="my-orders" 
          onTabChange={handleMobileNavChange}
          cartCount={cart.length}
        />
      </>
    );
  }

  if (view === 'wishlist') {
    return (
      <>
        <WishlistView 
          wishlistItems={wishlistItems}
          wishlistProductIds={wishlistProductIds}
          onToggleWishlist={handleToggleWishlist}
          onBack={() => setView('browse')}
        />
        <MobileBottomNav 
          activeTab="browse" 
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
          pendingSyncCount={pendingCount}
          isSyncing={isSyncing}
          onSyncNow={syncNow}
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
              {comparisonCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsComparisonModalOpen(true)}
                  className="gap-2"
                >
                  <GitCompare className="h-4 w-4" />
                  Compare
                  <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] flex items-center justify-center text-xs">
                    {comparisonCount}
                  </Badge>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView('wishlist')}
                className="gap-2"
              >
                <Heart className="h-4 w-4" />
                Wishlist
                {wishlistCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] flex items-center justify-center text-xs">
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
              <NotificationBell />
            </div>
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="mb-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-2">
            {CRAFT_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                disabled={isOffline}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                } disabled:opacity-50`}
              >
                <span>{cat.emoji}</span>
                <span className="hidden sm:inline">{cat.label}</span>
                <span className="sm:hidden">{cat.value === 'all' ? 'All' : cat.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search & Filters */}
        <div className={`bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 ${showSearchPanel ? 'block' : 'hidden sm:block'}`}>
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search Input Row */}
            <div className="flex gap-2">
              <SearchAutocomplete
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={(query) => {
                  setSearchQuery(query);
                  handleSearch();
                }}
                disabled={isOffline}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch} 
                size="sm" 
                className="h-9 sm:h-10 px-4"
                disabled={isOffline}
              >
                Search
              </Button>
            </div>
            
            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Price Range Select */}
              <Select value={selectedPriceRange} onValueChange={handlePriceRangeChange} disabled={isOffline}>
                <SelectTrigger className="w-[140px] sm:w-[160px] h-9 text-sm">
                  <IndianRupee className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort Select */}
              <Select value={sortBy} onValueChange={handleSortChange} disabled={isOffline}>
                <SelectTrigger className="w-[140px] sm:w-[170px] h-9 text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Advanced Filters Button */}
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-2" disabled={isOffline}>
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="hidden sm:inline">More Filters</span>
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Products</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {/* Custom Price Range */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Custom Price Range</Label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                          <Input
                            type="number"
                            placeholder="Min"
                            value={customMinPrice}
                            onChange={(e) => setCustomMinPrice(e.target.value)}
                            className="pl-7"
                          />
                        </div>
                        <span className="text-muted-foreground">to</span>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                          <Input
                            type="number"
                            placeholder="Max"
                            value={customMaxPrice}
                            onChange={(e) => setCustomMaxPrice(e.target.value)}
                            className="pl-7"
                          />
                        </div>
                      </div>
                      <Button onClick={handleCustomPriceApply} className="w-full" size="sm">
                        Apply Price Range
                      </Button>
                    </div>

                    <Separator />

                    {/* Advanced Filters */}
                    <AdvancedFilters
                      selectedMaterials={selectedMaterials}
                      onMaterialsChange={setSelectedMaterials}
                      minRating={minRating}
                      onRatingChange={setMinRating}
                      customizableOnly={customizableOnly}
                      onCustomizableChange={setCustomizableOnly}
                      verifiedOnly={verifiedOnly}
                      onVerifiedChange={setVerifiedOnly}
                    />

                    <Separator />

                    {/* Category Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Category</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {CRAFT_CATEGORIES.map((cat) => (
                          <button
                            key={cat.value}
                            onClick={() => {
                              handleCategoryChange(cat.value);
                            }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                              selectedCategory === cat.value
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            }`}
                          >
                            <span>{cat.emoji}</span>
                            <span className="truncate">{cat.label.split('&')[0].trim()}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Apply and Clear Buttons */}
                    <div className="space-y-2">
                      <Button 
                        onClick={handleApplyAdvancedFilters}
                        className="w-full"
                      >
                        Apply Filters
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          clearAllFilters();
                          setIsFilterOpen(false);
                        }}
                        className="w-full"
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Wishlist Button - Mobile */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setView('wishlist')}
                className="h-9 gap-1.5 sm:hidden"
              >
                <Heart className="h-4 w-4" />
                {wishlistCount > 0 && (
                  <span className="text-xs">{wishlistCount}</span>
                )}
              </Button>

              {/* Clear Filters - Show when filters are active */}
              {(activeFilterCount > 0 || searchQuery) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="h-9 text-muted-foreground hover:text-foreground gap-1"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedCategory !== 'all' || minPrice !== undefined || maxPrice !== undefined || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: "{searchQuery}"
                <button onClick={() => { setSearchQuery(''); executeSearch(); }}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {CRAFT_CATEGORIES.find(c => c.value === selectedCategory)?.emoji} {CRAFT_CATEGORIES.find(c => c.value === selectedCategory)?.label}
                <button onClick={() => handleCategoryChange('all')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(minPrice !== undefined || maxPrice !== undefined) && (
              <Badge variant="secondary" className="gap-1">
                {minPrice !== undefined && maxPrice !== undefined
                  ? `₹${minPrice} - ₹${maxPrice}`
                  : minPrice !== undefined
                  ? `₹${minPrice}+`
                  : `Under ₹${maxPrice}`}
                <button onClick={() => handlePriceRangeChange('all')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Recently Viewed Section */}
        <RecentlyViewedSection
          products={recentProducts}
          onClear={clearRecentlyViewed}
          onProductClick={handleRecentProductClick}
          wishlistProductIds={wishlistProductIds}
        />

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Searching...' : `${displayProducts.length} products found`}
          </p>
        </div>

        {/* Products Grid with Pull-to-Refresh */}
        <ProductGrid 
          products={displayProducts} 
          isLoading={isLoading && !isOffline}
          onRefresh={handleRefresh}
          enablePullToRefresh={!isOffline}
          wishlistProductIds={wishlistProductIds}
          onToggleWishlist={handleToggleWishlist}
          comparisonProductIds={comparisonProductIds}
          onToggleComparison={toggleComparison}
          canAddToComparison={canAddToComparison}
          onProductView={handleProductView}
        />

        {/* Shopping Cart Drawer */}
        <ShoppingCartDrawer 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
        />

        {/* Comparison Bar */}
        <ComparisonBar
          products={comparisonProducts}
          onRemove={removeFromComparison}
          onClear={clearComparison}
          onCompare={() => setIsComparisonModalOpen(true)}
          maxItems={maxComparisonItems}
        />

        {/* Comparison Modal */}
        <ProductComparisonModal
          products={comparisonProducts}
          isOpen={isComparisonModalOpen}
          onClose={() => setIsComparisonModalOpen(false)}
          onRemove={removeFromComparison}
        />

        {/* Quick View Modal for Recently Viewed */}
        {selectedProduct && (
          <QuickViewModal
            product={selectedProduct}
            isOpen={!!selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onViewFull={() => setSelectedProduct(null)}
            isWishlisted={wishlistProductIds.has(selectedProduct.id)}
            onToggleWishlist={async () => {
              await toggleWishlist(selectedProduct.id);
            }}
          />
        )}

        {/* Share Modal */}
        <ShareProductModal
          product={shareProduct}
          isOpen={!!shareProduct}
          onClose={() => setShareProduct(null)}
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
