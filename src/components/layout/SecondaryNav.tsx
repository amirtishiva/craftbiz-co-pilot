import React from 'react';
import { 
  Lightbulb, 
  PlusCircle, 
  FileText,
  Palette,
  Megaphone,
  Truck
} from 'lucide-react';

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
  ];

  return (
    <div className="border-b border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-smooth whitespace-nowrap ${
                  activeTab === item.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default SecondaryNav;
