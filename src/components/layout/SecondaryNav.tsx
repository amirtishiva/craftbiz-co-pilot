import React from 'react';
import { 
  Lightbulb, 
  PlusCircle, 
  FileText,
  Palette,
  Megaphone,
  Truck,
  Store
} from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';

interface SecondaryNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SecondaryNav: React.FC<SecondaryNavProps> = ({ activeTab, onTabChange }) => {
  const { isSeller, isLoading } = useUserRoles();

  // Seller nav items - NO marketplace access
  const sellerNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Lightbulb },
    { id: 'idea', label: 'Your Idea', icon: PlusCircle },
    { id: 'business-plan', label: 'Business Plan', icon: FileText },
    { id: 'design-studio', label: 'Design Studio', icon: Palette },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'seller-dashboard', label: 'My Shop', icon: Store },
  ];

  // Use seller nav items (marketplace removed for sellers)
  const navItems = sellerNavItems;

  return (
    <div className="bg-background pb-4">
      <div className="container mx-auto px-4">
        <div className="bg-card border border-border rounded-lg shadow-sm">
          <nav className="flex justify-center overflow-x-auto scrollbar-hide px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 md:px-6 py-3 text-xs sm:text-sm font-medium border-b-2 transition-smooth whitespace-nowrap ${
                    activeTab === item.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default SecondaryNav;
