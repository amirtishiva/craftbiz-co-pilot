import React from 'react';
import { Store, Map, MessageSquare, ShoppingCart, Search } from 'lucide-react';
import { useHaptic } from '@/hooks/useHaptic';

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
  const haptic = useHaptic();

  const navItems = [
    { id: 'browse' as const, label: 'Shop', icon: Store },
    { id: 'search' as const, label: 'Search', icon: Search },
    { id: 'artisan-map' as const, label: 'Artisans', icon: Map },
    { id: 'my-orders' as const, label: 'Orders', icon: MessageSquare },
    { id: 'cart' as const, label: 'Cart', icon: ShoppingCart },
  ];

  const handleTabClick = (tabId: typeof activeTab) => {
    haptic.selection();
    onTabChange(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border sm:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full relative native-button ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              <div className={`relative transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                <Icon className="h-5 w-5" />
                {item.id === 'cart' && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[9px] font-medium rounded-full h-4 w-4 flex items-center justify-center animate-scale-in">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 font-medium transition-all duration-200 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
              {/* Active indicator with animation */}
              <div 
                className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary rounded-full transition-all duration-300 ease-out ${
                  isActive ? 'w-8 opacity-100' : 'w-0 opacity-0'
                }`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
