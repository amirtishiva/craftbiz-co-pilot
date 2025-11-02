import React from 'react';
import { 
  Lightbulb, 
  PlusCircle, 
  FileText,
  Palette,
  Megaphone,
  Truck,
  ShoppingBag
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SecondaryNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SecondaryNav: React.FC<SecondaryNavProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Lightbulb },
    { id: 'idea', label: 'Your Idea', icon: PlusCircle },
    { id: 'business-plan', label: 'Business Plan', icon: FileText },
    { id: 'design-studio', label: 'Design Studio', icon: Palette },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, comingSoon: true },
  ];

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
                  onClick={() => !item.comingSoon && onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 md:px-6 py-3 text-xs sm:text-sm font-medium border-b-2 transition-smooth whitespace-nowrap ${
                    activeTab === item.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  } ${item.comingSoon ? 'cursor-default opacity-75' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                  {item.comingSoon && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      Coming Soon
                    </Badge>
                  )}
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
