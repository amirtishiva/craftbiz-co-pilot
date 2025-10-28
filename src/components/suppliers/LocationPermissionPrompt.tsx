import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, MapPin, Navigation } from 'lucide-react';

interface LocationPermissionPromptProps {
  onEnableLocation: () => void;
  onCitySelect?: (city: string) => void;
  showCityFallback?: boolean;
}

const cities = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Chennai',
  'Kolkata',
  'Pune',
  'Hyderabad',
  'Ahmedabad'
];

const LocationPermissionPrompt: React.FC<LocationPermissionPromptProps> = ({ 
  onEnableLocation, 
  onCitySelect,
  showCityFallback = true 
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-amber-500" />
          <h3 className="text-lg font-semibold mb-2">Location Access Required</h3>
          <p className="text-muted-foreground mb-6">
            Enable location services to find suppliers and dealers near you
          </p>
          
          <div className="space-y-4 max-w-md mx-auto">
            <Button 
              onClick={onEnableLocation}
              className="w-full"
              size="lg"
            >
              <Navigation className="mr-2 h-5 w-5" />
              Enable Location
            </Button>

            {showCityFallback && onCitySelect && (
              <>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-sm text-muted-foreground">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Select your city manually:</p>
                  <Select onValueChange={onCitySelect}>
                    <SelectTrigger className="w-full">
                      <MapPin className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Choose your city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationPermissionPrompt;