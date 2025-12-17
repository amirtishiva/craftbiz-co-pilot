import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Linkedin } from 'lucide-react';
import artisanWoodworker from '@/assets/artisan-woodworker.jpg';
import artisanTextile from '@/assets/artisan-textile.jpg';
import artisanPotter from '@/assets/artisan-potter.jpg';
import artisanMetalworker from '@/assets/artisan-metalworker.jpg';
import artisanJewelry from '@/assets/artisan-jewelry.jpg';
import artisanEmbroidery from '@/assets/artisan-embroidery.jpg';
import teamAmirtiShiva from '@/assets/team-amirti-shiva.jpg';
import teamSandeepKumar from '@/assets/team-sandeep-kumar.jpg';
import teamLathish from '@/assets/team-lathish.jpg';
import teamManoj from '@/assets/team-manoj.jpg';

const heroImages = [
  { src: artisanPotter, alt: 'Potter crafting clay' },
  { src: artisanTextile, alt: 'Textile artisan weaving' },
  { src: artisanEmbroidery, alt: 'Traditional embroidery art' },
  { src: artisanJewelry, alt: 'Jewelry craftsman' },
  { src: artisanMetalworker, alt: 'Stone carver at work' },
  { src: artisanWoodworker, alt: 'Embroidery artist' },
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

  useEffect(() => {
    import('@/integrations/supabase/client').then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          navigate('/dashboard');
        }
      });
    });
  }, [navigate]);

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
    <div className="min-h-screen bg-[hsl(32,40%,94%)] relative overflow-hidden">
      {/* Decorative Mandala Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.08] pointer-events-none">
        <svg viewBox="0 0 400 400" className="w-full h-full text-[hsl(25,60%,45%)]">
          <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <circle cx="200" cy="200" r="120" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <circle cx="200" cy="200" r="90" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          {[...Array(12)].map((_, i) => (
            <line key={i} x1="200" y1="20" x2="200" y2="380" stroke="currentColor" strokeWidth="0.3" transform={`rotate(${i * 30} 200 200)`}/>
          ))}
          {[...Array(8)].map((_, i) => (
            <path key={`petal-${i}`} d="M200,50 Q250,200 200,350 Q150,200 200,50" fill="none" stroke="currentColor" strokeWidth="0.4" transform={`rotate(${i * 45} 200 200)`}/>
          ))}
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full py-4 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg width="28" height="36" viewBox="0 0 28 36" fill="none" className="text-[hsl(25,80%,50%)]">
              <path d="M14 0C14 0 4 10 4 20C4 26.627 8.373 32 14 32C19.627 32 24 26.627 24 20C24 10 14 0 14 0Z" fill="currentColor"/>
              <path d="M14 8C14 8 10 14 10 20C10 23.314 11.791 26 14 26C16.209 26 18 23.314 18 20C18 14 14 8 14 8Z" fill="hsl(45,90%,60%)"/>
            </svg>
            <span className="text-2xl font-bold text-[hsl(20,30%,20%)]">CraftBiz</span>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#" className="text-[hsl(20,20%,30%)] hover:text-[hsl(25,80%,50%)] transition-colors font-medium">Craftsmen</a>
            <a href="#" className="text-[hsl(20,20%,30%)] hover:text-[hsl(25,80%,50%)] transition-colors font-medium">Solutions</a>
            <a href="#" className="text-[hsl(20,20%,30%)] hover:text-[hsl(25,80%,50%)] transition-colors font-medium">Pricing</a>
            <a href="#" className="text-[hsl(20,20%,30%)] hover:text-[hsl(25,80%,50%)] transition-colors font-medium">Community</a>
            <a href="#" className="text-[hsl(20,20%,30%)] hover:text-[hsl(25,80%,50%)] transition-colors font-medium">Contact</a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleLogin} 
              className="rounded-full border-[hsl(20,20%,30%)] text-[hsl(20,20%,30%)] hover:bg-[hsl(20,20%,30%)] hover:text-white px-6"
            >
              Log in
            </Button>
            <Button 
              onClick={handleSignUp}
              className="rounded-full bg-[hsl(16,75%,55%)] hover:bg-[hsl(16,75%,45%)] text-white px-6"
            >
              Sign up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 pt-8 pb-16">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center px-5 py-2 rounded-full bg-[hsl(16,75%,55%)] text-white text-sm font-medium">
              Join over 10,000 thriving artisans
            </span>
          </div>

          {/* Headline with decorative elements */}
          <div className="relative max-w-4xl mx-auto mb-6">
            {/* Decorative arrow left */}
            <svg className="absolute -left-16 top-4 hidden xl:block w-12 h-12 text-[hsl(20,30%,25%)]" viewBox="0 0 50 50" fill="none">
              <path d="M5 40 Q20 35 35 25" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M30 22 L36 25 L32 30" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
            
            {/* Decorative star right */}
            <svg className="absolute -right-8 top-0 hidden xl:block w-8 h-8 text-[hsl(20,30%,25%)]" viewBox="0 0 30 30" fill="none">
              <path d="M15 2 L17 12 L27 15 L17 18 L15 28 L13 18 L3 15 L13 12 Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>

            {/* Small star decoration */}
            <svg className="absolute left-8 top-16 hidden xl:block w-5 h-5 text-[hsl(25,60%,50%)]" viewBox="0 0 20 20" fill="none">
              <path d="M10 2 L11 8 L17 10 L11 12 L10 18 L9 12 L3 10 L9 8 Z" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.6"/>
            </svg>

            <h1 className="text-center text-4xl sm:text-5xl lg:text-6xl font-bold text-[hsl(20,30%,15%)] leading-tight tracking-tight">
              Unleash Your Vision: CraftBiz
              <br />
              Empowers Indian Entrepreneurs
            </h1>
          </div>

          {/* Subheadline */}
          <p className="text-center text-lg text-[hsl(20,20%,35%)] mb-10 max-w-2xl mx-auto">
            Transform your ideas into thriving businesses with AI-powered
            <br className="hidden sm:block" />
            tools and local connections
          </p>

          {/* Artisan Image Gallery - Wave Pattern */}
          <div className="relative flex justify-center items-end gap-3 sm:gap-4 mb-8 px-4">
            {/* Decorative brush stroke left */}
            <svg className="absolute -left-4 bottom-20 hidden lg:block w-16 h-24 text-[hsl(25,50%,55%)]" viewBox="0 0 60 90" fill="none">
              <path d="M50 10 Q30 30 40 50 Q50 70 30 85" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5"/>
            </svg>

            {heroImages.map((image, index) => {
              // Create wave pattern: tall-short-tall-short-tall-short
              const heights = [320, 280, 360, 300, 340, 280];
              const height = heights[index] || 300;
              const offsetY = index % 2 === 0 ? 0 : 40;
              
              return (
                <div
                  key={index}
                  className="flex-shrink-0 rounded-2xl overflow-hidden shadow-lg"
                  style={{
                    width: 'clamp(100px, 15vw, 180px)',
                    height: `clamp(${height * 0.6}px, ${height * 0.8}px, ${height}px)`,
                    transform: `translateY(${offsetY}px)`,
                  }}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    loading={index < 3 ? 'eager' : 'lazy'}
                    decoding={index < 3 ? 'sync' : 'async'}
                  />
                </div>
              );
            })}

            {/* Decorative brush stroke right */}
            <svg className="absolute -right-4 bottom-32 hidden lg:block w-16 h-20 text-[hsl(25,50%,55%)]" viewBox="0 0 60 80" fill="none">
              <path d="M10 70 Q30 50 20 30 Q10 10 35 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5"/>
            </svg>
          </div>

          {/* CTA Section */}
          <div className="flex flex-col items-center relative">
            {/* Arrow pointing to button */}
            <svg className="absolute -right-20 -top-4 hidden xl:block w-16 h-16 text-[hsl(20,30%,25%)]" viewBox="0 0 60 60" fill="none">
              <path d="M10 5 Q25 20 45 35" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M40 30 L47 36 L40 42" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>

            <Button
              size="lg"
              onClick={handleGetStarted}
              className="rounded-full bg-[hsl(16,75%,55%)] hover:bg-[hsl(16,75%,45%)] text-white text-lg px-12 py-7 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
            >
              Get Started
            </Button>

            {/* "It's free" handwritten text */}
            <div className="mt-4 relative">
              <span 
                className="text-[hsl(20,30%,25%)] text-lg"
                style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
              >
                It's free
              </span>
              <svg className="absolute -bottom-1 left-0 w-full h-2" viewBox="0 0 60 8" fill="none">
                <path d="M2 5 Q30 2 58 5" stroke="hsl(25,50%,50%)" strokeWidth="2" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
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
                        width={160}
                        height={160}
                        loading="lazy"
                        decoding="async"
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
