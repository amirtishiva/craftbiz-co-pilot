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
    // Check if user is already logged in via Supabase session
    import('@/integrations/supabase/client').then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          navigate('/dashboard');
        }
      });
    });
  }, [navigate]);

  useEffect(() => {
    // Auto-scroll animation for carousel - smooth continuous scrolling
    const interval = setInterval(() => {
      setScrollPosition((prev) => {
        const cardWidth = 326; // 320px width + 6px gap
        const maxScroll = artisanImages.length * cardWidth;
        const newPosition = prev + 1;
        return newPosition >= maxScroll ? 0 : newPosition;
      });
    }, 30);

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
            <Button variant="outline" onClick={handleLogin} className="border-input">
              Log In
            </Button>
            <Button onClick={handleSignUp}>
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 lg:py-28">
          {/* Hero Headline */}
          <h1 className="text-center text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 max-w-4xl tracking-tight leading-tight">
            Start any small business today.
          </h1>

          {/* Subheadline */}
          <p className="text-center text-base sm:text-lg lg:text-xl text-muted-foreground mb-16 max-w-2xl leading-relaxed font-normal">
            Transform your business idea into a launch-ready business kit with AI-powered tools designed for Indian entrepreneurs.
          </p>

          {/* Artisan Image Carousel */}
          <div className="w-full max-w-7xl mb-16 overflow-hidden relative">
            <div 
              className="flex gap-6 transition-transform duration-1000 ease-in-out"
              style={{ transform: `translateX(-${scrollPosition}px)` }}
            >
              {[...artisanImages, ...artisanImages].map((image, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-[240px] sm:w-[280px] lg:w-[320px] h-[320px] sm:h-[360px] lg:h-[400px] rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{
                    transform: `perspective(1000px) rotateY(${index % 3 === 0 ? '2deg' : index % 3 === 1 ? '-2deg' : '0deg'})`,
                  }}
                >
                  <img
                    src={image}
                    alt={`Artisan craftsmanship ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Playful Annotations & CTA */}
          <div className="relative mb-8">
            {/* Annotation: Elevate your brand */}
            <svg
              className="absolute -top-24 -left-32 hidden xl:block text-foreground/70"
              width="140"
              height="80"
              viewBox="0 0 140 80"
              fill="none"
            >
              <path
                d="M10 40 Q 40 20, 80 35"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray="3 3"
              />
              <text x="10" y="20" className="text-sm fill-current" style={{ fontFamily: 'cursive' }}>
                Elevate your brand
              </text>
            </svg>

            {/* Annotation: It's Free */}
            <svg
              className="absolute -bottom-20 -right-24 hidden xl:block text-foreground/70"
              width="120"
              height="90"
              viewBox="0 0 120 90"
              fill="none"
            >
              <path
                d="M60 20 Q 40 40, 50 60"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray="3 3"
              />
              <text x="30" y="25" className="text-sm fill-current" style={{ fontFamily: 'cursive' }}>
                It's Free
              </text>
            </svg>

            {/* CTA Button */}
            <Button
              size="lg"
              className="text-base sm:text-lg px-10 py-6 sm:px-12 sm:py-7 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
          </div>

          {/* Additional Info */}
          <p className="text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <button
              onClick={handleLogin}
              className="text-primary hover:underline font-medium transition-all"
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
