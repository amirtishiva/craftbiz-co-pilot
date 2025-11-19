import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Linkedin } from 'lucide-react';
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
import teamAmirtiShiva from '@/assets/team-amirti-shiva.jpg';
import teamSandeepKumar from '@/assets/team-sandeep-kumar.jpg';
import teamLathish from '@/assets/team-lathish.jpg';
import teamManoj from '@/assets/team-manoj.jpg';

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

const teamMembers = [
  {
    name: 'Amirti Shiva',
    role: 'Founder | AI-ML Enthusiast',
    image: teamAmirtiShiva,
    linkedin: 'https://www.linkedin.com/in/shiva666/',
  },
  {
    name: 'B. Sandeep Kumar',
    role: 'Co-Founder | AI-ML Enthusiast',
    image: teamSandeepKumar,
    linkedin: 'https://www.linkedin.com/in/b-sandeep-kumar-b56612265/',
  },
  {
    name: 'K. Lathish',
    role: 'Co-Founder | Data Scientist',
    image: teamLathish,
    linkedin: 'https://www.linkedin.com/in/kotlalathish/',
  },
  {
    name: 'Gottipalli Manoj',
    role: 'Co-Founder | Data Scientist | Front-end Developer',
    image: teamManoj,
    linkedin: 'https://www.linkedin.com/in/gottipalli-manoj-315a3a260/',
  },
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

        {/* Team Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-center text-foreground mb-4">
              Meet Our Team
            </h2>
            <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
              A passionate group of students committed to empowering Indian entrepreneurs with AI-powered business tools.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <Card 
                  key={index} 
                  className="group hover:shadow-xl transition-all duration-300 border-border overflow-hidden"
                >
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="relative mb-6 w-40 h-40 rounded-full overflow-hidden ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all duration-300">
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {member.name}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-4 min-h-[3rem]">
                      {member.role}
                    </p>
                    
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                      <span className="text-sm font-medium">Connect on LinkedIn</span>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
