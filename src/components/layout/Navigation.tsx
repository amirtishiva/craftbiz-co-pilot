import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogout = () => {
    localStorage.removeItem('craftbiz_user');
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav className="bg-card border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-primary">CraftBiz</h1>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              {t('nav.logout')}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;