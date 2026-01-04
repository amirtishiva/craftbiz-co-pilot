import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight,
  Lightbulb,
  Target,
  TrendingUp,
  Users
} from 'lucide-react';

const tips = [
  {
    icon: Lightbulb,
    title: "Start With Your Story",
    description: "Customers connect with the story behind your craft. Share your journey and what makes your work unique.",
    color: "text-stat-ideas",
    bgColor: "bg-stat-ideas/15"
  },
  {
    icon: Target,
    title: "Know Your Audience",
    description: "Understanding who buys handcrafted goods helps you position your products and set the right prices.",
    color: "text-stat-plans",
    bgColor: "bg-stat-plans/15"
  },
  {
    icon: TrendingUp,
    title: "Price for Profit",
    description: "Factor in materials, time, overhead, and your skill level. Don't undervalue your handmade creations.",
    color: "text-stat-designs",
    bgColor: "bg-stat-designs/15"
  },
  {
    icon: Users,
    title: "Build Community",
    description: "Engage with fellow artisans and customers. Communities drive word-of-mouth and repeat business.",
    color: "text-stat-marketing",
    bgColor: "bg-stat-marketing/15"
  }
];

const TipsCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTip = () => {
    setCurrentIndex((prev) => (prev + 1) % tips.length);
  };

  const prevTip = () => {
    setCurrentIndex((prev) => (prev - 1 + tips.length) % tips.length);
  };

  const currentTip = tips[currentIndex];
  const Icon = currentTip.icon;

  return (
    <Card className="bg-gradient-to-br from-card via-card to-accent/20 overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${currentTip.bgColor} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${currentTip.color}`} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Tip {currentIndex + 1} of {tips.length}
            </div>
            <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1">
              {currentTip.title}
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
              {currentTip.description}
            </p>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          <div className="flex gap-1.5">
            {tips.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={prevTip}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={nextTip}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TipsCarousel;
