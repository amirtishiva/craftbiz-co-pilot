import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, SlidersHorizontal, IndianRupee, Heart, GitCompare, ShoppingCart, Sparkles } from 'lucide-react';
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
import BuyerOrderHistory from './BuyerOrderHistory';

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
  { value: 'rating', label: 'Seller Rating' },
  { value: 'popularity', label: 'Most Popular' },
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
      case 'rating':
        return { sortBy: 'rating', sortOrder: 'desc' as const };
      case 'popularity':
        return { sortBy: 'popularity', sortOrder: 'desc' as const };
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
        <div className="max-w-4xl mx-auto pb-16 sm:pb-0 px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Button variant="ghost" onClick={() => setView('browse')} className="mb-4">
            ← Back to Shop
          </Button>
          <BuyerOrderHistory />
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
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pb-20 sm:pb-8">
        {/* Offline Indicator */}
        <OfflineIndicator 
          isOffline={isOffline} 
          isCached={isCached} 
          cacheTimestamp={cacheTimestamp}
          pendingSyncCount={pendingCount}
          isSyncing={isSyncing}
          onSyncNow={syncNow}
        />

        {/* Modern Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border-b border-border/50">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
              {/* Title Section */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    CraftBiz Marketplace
                  </h1>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
                  Discover authentic handcrafted products from skilled Indian artisans
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {comparisonCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsComparisonModalOpen(true)}
                    className="gap-2 bg-background/80 backdrop-blur-sm hover:bg-background border-border/50 shadow-sm"
                  >
                    <GitCompare className="h-4 w-4" />
                    <span className="hidden sm:inline">Compare</span>
                    <Badge variant="secondary" className="h-5 min-w-[20px] flex items-center justify-center text-xs bg-primary/10 text-primary">
                      {comparisonCount}
                    </Badge>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCartOpen(true)}
                  className="gap-2 bg-background/80 backdrop-blur-sm hover:bg-background border-border/50 shadow-sm"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">Cart</span>
                  {cart.length > 0 && (
                    <Badge variant="secondary" className="h-5 min-w-[20px] flex items-center justify-center text-xs bg-primary/10 text-primary">
                      {cart.length}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView('wishlist')}
                  className="gap-2 bg-background/80 backdrop-blur-sm hover:bg-background border-border/50 shadow-sm"
                >
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Wishlist</span>
                  {wishlistCount > 0 && (
                    <Badge variant="secondary" className="h-5 min-w-[20px] flex items-center justify-center text-xs bg-primary/10 text-primary">
                      {wishlistCount}
                    </Badge>
                  )}
                </Button>
                <NotificationBell />
              </div>
            </div>

            {/* Category Pills - Modern Horizontal Scroll */}
            <div className="mt-6 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                {CRAFT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => handleCategoryChange(cat.value)}
                    disabled={isOffline}
                    className={`snap-start flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 shadow-sm ${
                      selectedCategory === cat.value
                        ? 'bg-primary text-primary-foreground shadow-primary/25'
                        : 'bg-background/80 backdrop-blur-sm text-foreground hover:bg-background hover:shadow-md border border-border/50'
                    } disabled:opacity-50`}
                  >
                    <span className="text-base">{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search & Filters Card */}
          <div className={`bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 sm:p-5 mb-6 shadow-sm ${showSearchPanel ? 'block' : 'hidden sm:block'}`}>
            <div className="flex flex-col gap-4">
              {/* Search Input Row */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <SearchAutocomplete
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSearch={(query) => {
                      setSearchQuery(query);
                      handleSearch();
                    }}
                    disabled={isOffline}
                    className="w-full"
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  className="h-10 px-6 rounded-xl shadow-sm"
                  disabled={isOffline}
                >
                  <Search className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Search</span>
                </Button>
              </div>
              
              {/* Filters Row */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Price Range Select */}
                <Select value={selectedPriceRange} onValueChange={handlePriceRangeChange} disabled={isOffline}>
                  <SelectTrigger className="w-[140px] sm:w-[160px] h-10 rounded-xl bg-background/50 border-border/50">
                    <IndianRupee className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
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
                  <SelectTrigger className="w-[140px] sm:w-[170px] h-10 rounded-xl bg-background/50 border-border/50">
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
                    <Button variant="outline" size="sm" className="h-10 gap-2 rounded-xl bg-background/50 border-border/50" disabled={isOffline}>
                      <SlidersHorizontal className="h-4 w-4" />
                      <span className="hidden sm:inline">More Filters</span>
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary/10 text-primary">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="overflow-y-auto">
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
                              className="pl-7 rounded-xl"
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
                              className="pl-7 rounded-xl"
                            />
                          </div>
                        </div>
                        <Button onClick={handleCustomPriceApply} className="w-full rounded-xl" size="sm">
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
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all ${
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
                          className="w-full rounded-xl"
                        >
                          Apply Filters
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            clearAllFilters();
                            setIsFilterOpen(false);
                          }}
                          className="w-full rounded-xl"
                        >
                          Clear All Filters
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Mobile Cart & Wishlist */}
                <div className="flex gap-2 sm:hidden">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsCartOpen(true)}
                    className="h-10 gap-1.5 rounded-xl"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {cart.length > 0 && (
                      <span className="text-xs">{cart.length}</span>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setView('wishlist')}
                    className="h-10 gap-1.5 rounded-xl"
                  >
                    <Heart className="h-4 w-4" />
                    {wishlistCount > 0 && (
                      <span className="text-xs">{wishlistCount}</span>
                    )}
                  </Button>
                </div>

                {/* Clear Filters - Show when filters are active */}
                {(activeFilterCount > 0 || searchQuery) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="h-10 text-muted-foreground hover:text-foreground gap-1 rounded-xl"
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
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-sm text-muted-foreground font-medium">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border-0">
                  Search: "{searchQuery}"
                  <button onClick={() => { setSearchQuery(''); executeSearch(); }} className="hover:bg-primary/20 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border-0">
                  {CRAFT_CATEGORIES.find(c => c.value === selectedCategory)?.emoji} {CRAFT_CATEGORIES.find(c => c.value === selectedCategory)?.label}
                  <button onClick={() => handleCategoryChange('all')} className="hover:bg-primary/20 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(minPrice !== undefined || maxPrice !== undefined) && (
                <Badge variant="secondary" className="gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border-0">
                  {minPrice !== undefined && maxPrice !== undefined
                    ? `₹${minPrice} - ₹${maxPrice}`
                    : minPrice !== undefined
                    ? `₹${minPrice}+`
                    : `Under ₹${maxPrice}`}
                  <button onClick={() => handlePriceRangeChange('all')} className="hover:bg-primary/20 rounded-full p-0.5">
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
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-muted-foreground font-medium">
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
        </div>

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
