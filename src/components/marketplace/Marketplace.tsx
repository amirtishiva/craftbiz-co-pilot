import React from 'react';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Marketplace: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Card className="border-2 border-dashed border-muted">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative mb-6">
            <ShoppingBag className="h-24 w-24 text-muted-foreground/30" />
            <Sparkles className="h-8 w-8 text-accent-orange absolute -top-2 -right-2" />
          </div>
          
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Marketplace Coming Soon
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mb-2">
            Post your products, set your rates, and sell directly to customers
          </p>
          
          <p className="text-sm text-muted-foreground max-w-xl">
            We're building an amazing marketplace where artisans can showcase and sell their craft products. Stay tuned!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Marketplace;
