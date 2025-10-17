import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'signup'>(
    (searchParams.get('mode') as 'login' | 'signup') || 'signup'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('craftbiz_user');
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Front-end validation
    if (!email || !password) {
      toast.error('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    // Simulate authentication delay
    setTimeout(() => {
      if (mode === 'signup') {
        // Mock signup - store user in localStorage
        const userData = {
          email,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem('craftbiz_user', JSON.stringify(userData));
        toast.success('Account created successfully! Please log in.');
        // Navigate to login page after signup
        setMode('login');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        // Mock login - check if user exists
        const existingUser = localStorage.getItem('craftbiz_user');
        if (existingUser) {
          toast.success('Logged in successfully!');
          navigate('/dashboard');
        } else {
          toast.error('No account found. Please sign up first.');
        }
      }
      setIsLoading(false);
    }, 1000);
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">CraftBiz</span>
          </div>
        </div>
      </header>

      {/* Auth Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-strong">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {mode === 'login' ? 'Welcome back' : 'Create an account'}
            </CardTitle>
            <CardDescription className="text-center">
              {mode === 'login'
                ? 'Enter your credentials to access your account'
                : 'Enter your details to get started'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : mode === 'login' ? 'Log In' : 'Sign Up'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-muted-foreground text-center">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={toggleMode}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={toggleMode}
                    className="text-primary hover:underline font-medium"
                  >
                    Log in
                  </button>
                </>
              )}
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Auth;
