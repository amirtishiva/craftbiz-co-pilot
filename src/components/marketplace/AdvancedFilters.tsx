import React, { useState, useEffect } from 'react';
import { Star, Paintbrush, Settings } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';

interface AdvancedFiltersProps {
  selectedMaterials: string[];
  onMaterialsChange: (materials: string[]) => void;
  minRating: number | undefined;
  onRatingChange: (rating: number | undefined) => void;
  customizableOnly: boolean;
  onCustomizableChange: (value: boolean) => void;
  verifiedOnly: boolean;
  onVerifiedChange: (value: boolean) => void;
}

const RATING_OPTIONS = [
  { value: 4, label: '4+ Stars' },
  { value: 3, label: '3+ Stars' },
  { value: 2, label: '2+ Stars' },
];

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  selectedMaterials,
  onMaterialsChange,
  minRating,
  onRatingChange,
  customizableOnly,
  onCustomizableChange,
  verifiedOnly,
  onVerifiedChange
}) => {
  const [availableMaterials, setAvailableMaterials] = useState<string[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);

  // Fetch available materials from products
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('materials_used')
          .eq('status', 'active')
          .not('materials_used', 'is', null);

        if (error) throw error;

        // Extract and flatten all unique materials
        const allMaterials = data?.flatMap(p => p.materials_used || []) || [];
        const uniqueMaterials = [...new Set(allMaterials)].sort();
        setAvailableMaterials(uniqueMaterials);
      } catch (error) {
        console.error('Error fetching materials:', error);
      } finally {
        setIsLoadingMaterials(false);
      }
    };

    fetchMaterials();
  }, []);

  const toggleMaterial = (material: string) => {
    if (selectedMaterials.includes(material)) {
      onMaterialsChange(selectedMaterials.filter(m => m !== material));
    } else {
      onMaterialsChange([...selectedMaterials, material]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Seller Rating Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500" />
          Minimum Seller Rating
        </Label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onRatingChange(undefined)}
            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
              minRating === undefined
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Any Rating
          </button>
          {RATING_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onRatingChange(option.value)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${
                minRating === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Materials Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Paintbrush className="h-4 w-4" />
          Materials
        </Label>
        {isLoadingMaterials ? (
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-7 w-20 bg-muted animate-pulse rounded-full" />
            ))}
          </div>
        ) : availableMaterials.length > 0 ? (
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {availableMaterials.map((material) => (
              <button
                key={material}
                onClick={() => toggleMaterial(material)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  selectedMaterials.includes(material)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {material}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No materials available</p>
        )}
        {selectedMaterials.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Selected:</span>
            {selectedMaterials.map((material) => (
              <Badge key={material} variant="secondary" className="text-xs">
                {material}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Product Options */}
      <div className="space-y-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Product Options
        </Label>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="customizable" className="text-sm cursor-pointer">
              Customizable Products Only
            </Label>
            <p className="text-xs text-muted-foreground">
              Show products that can be personalized
            </p>
          </div>
          <Switch
            id="customizable"
            checked={customizableOnly}
            onCheckedChange={onCustomizableChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="verified" className="text-sm cursor-pointer">
              Verified Sellers Only
            </Label>
            <p className="text-xs text-muted-foreground">
              Show products from verified artisans
            </p>
          </div>
          <Switch
            id="verified"
            checked={verifiedOnly}
            onCheckedChange={onVerifiedChange}
          />
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;
