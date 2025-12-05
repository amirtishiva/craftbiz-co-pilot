import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles, ShoppingBag, Store } from "lucide-react";

type UserRole = 'buyer' | 'seller';

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>('buyer');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Redirect based on role
        redirectBasedOnRole(session.user.id);
      }
    });
  }, [navigate]);

  const redirectBasedOnRole = async (userId: string) => {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    const isSeller = roles?.some(r => r.role === 'seller');
    
    if (isSeller) {
      navigate("/dashboard");
    } else {
      navigate("/dashboard"); // Buyers also go to dashboard, but will see limited UI
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast.success("Welcome back!");
        
        // Redirect based on user role
        if (data.user) {
          await redirectBasedOnRole(data.user.id);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              selected_role: selectedRole
            }
          }
        });

        if (error) throw error;
        
        // Check if session was created (auto-confirm email enabled)
        if (data.session) {
          toast.success("Account created! Welcome to CraftBiz!");
          navigate("/dashboard");
        } else {
          toast.success("Please check your email to confirm your account");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">CraftBiz</h1>
          </div>
          <CardTitle>{isLogin ? "Welcome Back" : "Get Started"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Sign in to continue building your business"
              : "Create an account to start your journey"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {/* Role Selection - Only show during signup */}
            {!isLogin && (
              <div className="space-y-3">
                <Label>I want to...</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('buyer')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedRole === 'buyer'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <ShoppingBag className={`h-6 w-6 mb-2 ${selectedRole === 'buyer' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="font-medium text-sm">Buy Products</p>
                    <p className="text-xs text-muted-foreground mt-1">Browse & purchase handcrafted items</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('seller')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedRole === 'seller'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Store className={`h-6 w-6 mb-2 ${selectedRole === 'seller' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="font-medium text-sm">Sell Products</p>
                    <p className="text-xs text-muted-foreground mt-1">I'm an artisan wanting to sell</p>
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm space-y-2">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline block w-full"
              aria-label={isLogin ? "Switch to sign up" : "Switch to sign in"}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
            {isLogin && (
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-muted-foreground hover:text-primary hover:underline text-sm block w-full"
                aria-label="Reset password"
              >
                Forgot password?
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
