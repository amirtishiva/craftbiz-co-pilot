import React, { useState } from 'react';
import { ArrowLeft, Store, Sparkles, MapPin, Clock, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSellerProfile } from '@/hooks/useSellerProfile';
import { useToast } from '@/hooks/use-toast';

interface SellerOnboardingProps {
  onComplete: () => void;
  onBack: () => void;
}

const CRAFT_SPECIALTIES = [
  'Pottery & Ceramics',
  'Textiles & Weaving',
  'Jewelry Making',
  'Woodwork & Carving',
  'Metalwork',
  'Leather Crafts',
  'Painting & Art',
  'Embroidery',
  'Basket Weaving',
  'Stone Carving',
  'Glass Work',
  'Paper Crafts',
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
];

const SellerOnboarding: React.FC<SellerOnboardingProps> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    shop_name: '',
    shop_tagline: '',
    artisan_story: '',
    craft_specialty: [] as string[],
    years_of_experience: '',
    city: '',
    state: '',
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const { createSellerProfile, isLoading } = useSellerProfile();
  const { toast } = useToast();

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        toast({
          title: "Location captured",
          description: "Your location has been saved for the artisan map",
        });
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: "Location access denied",
          description: "You can still enter your city and state manually",
          variant: "destructive",
        });
        setIsGettingLocation(false);
      }
    );
  };

  const handleSubmit = async () => {
    const result = await createSellerProfile({
      shop_name: formData.shop_name,
      shop_tagline: formData.shop_tagline || undefined,
      artisan_story: formData.artisan_story || undefined,
      craft_specialty: formData.craft_specialty.length > 0 ? formData.craft_specialty : undefined,
      years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : undefined,
      latitude: coordinates?.lat,
      longitude: coordinates?.lng,
    });

    if (result.success) {
      onComplete();
    }
  };

  const addSpecialty = (specialty: string) => {
    if (!formData.craft_specialty.includes(specialty)) {
      setFormData({
        ...formData,
        craft_specialty: [...formData.craft_specialty, specialty]
      });
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData({
      ...formData,
      craft_specialty: formData.craft_specialty.filter(s => s !== specialty)
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Marketplace
      </Button>

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Become a Seller</CardTitle>
          <p className="text-muted-foreground">
            Share your craft with the world and connect with customers who value handmade products
          </p>
          
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-colors ${
                  s === step ? 'bg-primary' : s < step ? 'bg-primary/50' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="shop_name">Shop Name *</Label>
                <Input
                  id="shop_name"
                  placeholder="e.g., Rajasthani Pottery Studio"
                  value={formData.shop_name}
                  onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="shop_tagline">Shop Tagline</Label>
                <Input
                  id="shop_tagline"
                  placeholder="e.g., Handcrafted with Love Since 1990"
                  value={formData.shop_tagline}
                  onChange={(e) => setFormData({ ...formData, shop_tagline: e.target.value })}
                />
              </div>

              <div>
                <Label>Craft Specialties</Label>
                <Select onValueChange={addSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your craft specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    {CRAFT_SPECIALTIES.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.craft_specialty.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.craft_specialty.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1"
                      >
                        {specialty}
                        <button
                          onClick={() => removeSpecialty(specialty)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="years_of_experience">Years of Experience</Label>
                <Input
                  id="years_of_experience"
                  type="number"
                  placeholder="e.g., 15"
                  value={formData.years_of_experience}
                  onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                />
              </div>

              <Button
                className="w-full"
                onClick={() => setStep(2)}
                disabled={!formData.shop_name}
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-primary/5 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Your Location
                </h4>
                <p className="text-sm text-muted-foreground">
                  Help customers discover you on the Artisan Map by adding your location
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="e.g., Jaipur"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => setFormData({ ...formData, state: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
              >
                <Navigation className="h-4 w-4 mr-2" />
                {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
              </Button>

              {coordinates && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm text-green-600">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Location captured successfully!
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button className="flex-1" onClick={() => setStep(3)}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="artisan_story">Your Artisan Story</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Share your journey as a craftsperson. This helps customers connect with your work.
                </p>
                <Textarea
                  id="artisan_story"
                  placeholder="Tell us about your craft journey, your inspiration, and what makes your work unique..."
                  value={formData.artisan_story}
                  onChange={(e) => setFormData({ ...formData, artisan_story: e.target.value })}
                  className="min-h-[150px]"
                />
              </div>

              {/* Benefits */}
              <div className="bg-primary/5 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-foreground">Why tell your story?</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                    <span>Products with stories sell 30% more</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary mt-0.5" />
                    <span>Connect with customers who value authenticity</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-primary mt-0.5" />
                    <span>Stand out from mass-produced products</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create My Shop'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerOnboarding;
