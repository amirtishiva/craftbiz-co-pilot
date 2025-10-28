import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';

interface NoResultsFoundProps {
  searchQuery?: string;
  category?: string;
  city?: string;
  onClearFilters: () => void;
  onExpandRadius?: () => void;
}

const NoResultsFound: React.FC<NoResultsFoundProps> = ({
  searchQuery,
  category,
  city,
  onClearFilters,
  onExpandRadius
}) => {
  return (
    <Card>
      <CardContent className="pt-6 text-center py-12">
        <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
        <p className="text-muted-foreground mb-6">
          {searchQuery || category || city
            ? "We couldn't find any suppliers matching your criteria."
            : "No suppliers available at the moment."}
        </p>

        <div className="space-y-3 max-w-md mx-auto">
          <p className="text-sm font-medium text-muted-foreground mb-2">Try the following:</p>
          
          <div className="grid gap-2">
            {(searchQuery || category || city) && (
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="w-full"
              >
                Clear all filters
              </Button>
            )}
            
            {onExpandRadius && (
              <Button
                variant="outline"
                onClick={onExpandRadius}
                className="w-full"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Expand search radius
              </Button>
            )}
            
            <p className="text-xs text-muted-foreground mt-4">
              Or try different search terms or categories
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoResultsFound;