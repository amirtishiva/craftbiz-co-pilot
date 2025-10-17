import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import artisanWoodworker from '@/assets/artisan-woodworker.jpg';
import artisanTextile from '@/assets/artisan-textile.jpg';
import artisanPotter from '@/assets/artisan-potter.jpg';
import artisanMetalworker from '@/assets/artisan-metalworker.jpg';
import artisanGlassblower from '@/assets/artisan-glassblower.jpg';
import artisanLeatherworker from '@/assets/artisan-leatherworker.jpg';
import artisanStonemason from '@/assets/artisan-stonemason.jpg';
import artisanJewelry from '@/assets/artisan-jewelry.jpg';
import artisanBasketweaver from '@/assets/artisan-basketweaver.jpg';
import artisanEmbroidery from '@/assets/artisan-embroidery.jpg';

const artisanImages = [
  artisanWoodworker,
  artisanTextile,
  artisanPotter,
  artisanMetalworker,
  artisanGlassblower,
  artisanLeatherworker,
  artisanStonemason,
  artisanJewelry,
  artisanBasketweaver,
  artisanEmbroidery,
];

const Landing = () => {
  const navigate = useNavigate();
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('craftbiz_user');
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    // Auto-scroll animation for carousel
    const interval = setInterval(() => {
      setScrollPosition((prev) => (prev + 1) % (artisanImages.length * 320));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    navigate('/auth?mode=signup');
  };

  const handleLogin = () => {
    navigate('/auth?mode=login');
  };

  const handleSignUp = () => {
    navigate('/auth?mode=signup');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">CraftBiz</span>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleLogin}>
              Log In
            </Button>
            <Button variant="default" onClick={handleSignUp}>
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-24">
          {/* Hero Headline */}
          <h1 className="text-center text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 max-w-4xl">
            Start any small business today.
          </h1>

          {/* Subheadline */}
          <p className="text-center text-lg sm:text-xl text-muted-foreground mb-12 max-w-3xl leading-relaxed">
            Transform your business idea into a launch-ready business kit with AI-powered tools designed for Indian entrepreneurs.
          </p>

          {/* Artisan Image Carousel */}
          <div className="w-full max-w-6xl mb-12 overflow-hidden">
            <div 
              className="flex gap-4 transition-transform duration-1000 ease-in-out"
              style={{ transform: `translateX(-${scrollPosition}px)` }}
            >
              {[...artisanImages, ...artisanImages].map((image, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-[300px] h-[200px] rounded-lg overflow-hidden shadow-medium hover-scale"
                  style={{
                    transform: index % 2 === 0 ? 'rotate(-2deg)' : 'rotate(2deg)',
                  }}
                >
                  <img
                    src={image}
                    alt={`Artisan craftsmanship ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Playful Annotations */}
          <div className="relative mb-8">
            <svg
              className="absolute -top-12 -left-24 hidden lg:block text-primary/60"
              width="120"
              height="60"
              viewBox="0 0 120 60"
              fill="none"
            >
              <path
                d="M10 30 Q 30 10, 60 30 T 110 30"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray="4 4"
              />
              <text x="20" y="15" className="text-sm fill-current font-handwriting">
                Elevate your brand
              </text>
            </svg>

            <svg
              className="absolute -bottom-16 -right-20 hidden lg:block text-primary/60"
              width="100"
              height="80"
              viewBox="0 0 100 80"
              fill="none"
            >
              <path
                d="M10 50 Q 30 30, 50 50"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray="4 4"
              />
              <text x="15" y="30" className="text-sm fill-current font-handwriting">
                It's Free
              </text>
            </svg>

            {/* CTA Button */}
            <Button
              size="lg"
              className="text-lg px-8 py-6 shadow-strong hover:scale-105 transition-smooth"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
          </div>

          {/* Additional Info */}
          <p className="text-sm text-muted-foreground mt-4">
            Already have an account?{' '}
            <button
              onClick={handleLogin}
              className="text-primary hover:underline font-medium"
            >
              Log in
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Landing;
