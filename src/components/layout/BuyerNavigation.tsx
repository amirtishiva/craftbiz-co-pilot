import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sparkles, User, LogOut, Settings, UserCircle } from "lucide-react";
import { toast } from "sonner";
import NotificationBell from "@/components/marketplace/NotificationBell";

interface BuyerNavigationProps {
  onTabChange: (tab: string) => void;
}

const BuyerNavigation = ({ onTabChange }: BuyerNavigationProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Error logging out");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            CraftBiz
          </span>
        </div>

        {/* Right side - Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationBell />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-muted/50 hover:bg-muted"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl p-2">
              <DropdownMenuItem 
                onClick={() => onTabChange('profile')}
                className="rounded-lg py-2.5 px-3 cursor-pointer"
              >
                <UserCircle className="mr-2.5 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onTabChange('account')}
                className="rounded-lg py-2.5 px-3 cursor-pointer"
              >
                <Settings className="mr-2.5 h-4 w-4" />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="rounded-lg py-2.5 px-3 cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2.5 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default BuyerNavigation;
