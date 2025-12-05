import React from 'react';
import { Store, Map, MessageSquare, ShoppingCart, Search } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'browse' | 'search' | 'artisan-map' | 'my-orders' | 'cart';
  onTabChange: (tab: 'browse' | 'search' | 'artisan-map' | 'my-orders' | 'cart') => void;
  cartCount?: number;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ 
  activeTab, 
  onTabChange,
  cartCount = 0
}) => {
  const navItems = [
    { id: 'browse' as const, label: 'Shop', icon: Store },
    { id: 'search' as const, label: 'Search', icon: Search },
    { id: 'artisan-map' as const, label: 'Artisans', icon: Map },
    { id: 'my-orders' as const, label: 'Orders', icon: MessageSquare },
    { id: 'cart' as const, label: 'Cart', icon: ShoppingCart },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border sm:hidden">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full relative transition-colors ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.id === 'cart' && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[9px] font-medium rounded-full h-4 w-4 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-card" />
    </nav>
  );
};

export default MobileBottomNav;
