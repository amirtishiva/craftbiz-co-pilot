import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Sparkles, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useMarketplace } from '@/hooks/useMarketplace';
import { useToast } from '@/hooks/use-toast';

interface ProductFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  { value: 'pottery', label: 'Pottery & Ceramics' },
  { value: 'textiles', label: 'Textiles & Weaving' },
  { value: 'jewelry', label: 'Jewelry & Accessories' },
  { value: 'woodwork', label: 'Woodwork & Carving' },
  { value: 'metalwork', label: 'Metalwork' },
  { value: 'leather', label: 'Leather Goods' },
  { value: 'paintings', label: 'Paintings & Art' },
  { value: 'handicrafts', label: 'Handicrafts' },
  { value: 'home-decor', label: 'Home Decor' },
];

const ProductForm: React.FC<ProductFormProps> = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    story: '',
    craft_heritage: '',
    category: '',
    price: '',
    stock_quantity: '1',
    is_customizable: false,
    materials_used: '',
    creation_time_hours: ''
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { generateProductListing } = useMarketplace();
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast({
        title: 'Too many images',
        description: 'You can upload a maximum of 5 images',
        variant: 'destructive'
      });
      return;
    }

    setImages([...images, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreview(imagePreview.filter((_, i) => i !== index));
  };

  const handleGenerateWithAI = async () => {
    if (!formData.title || !formData.category) {
      toast({
        title: 'Missing information',
        description: 'Please enter a product name and category first',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      let imageBase64: string | undefined;
      if (images.length > 0) {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve) => {
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(images[0]);
        });
      }

      const result = await generateProductListing({
        productName: formData.title,
        category: formData.category,
        imageBase64,
        craftType: formData.category,
        materials: formData.materials_used
      });

      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          title: result.data.title || prev.title,
          description: result.data.description || prev.description,
          story: result.data.story || prev.story,
          craft_heritage: result.data.craft_heritage || prev.craft_heritage,
          price: result.data.suggested_price_min?.toString() || prev.price
        }));
      }
    } catch (error) {
      console.error('AI generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (status: 'draft' | 'active') => {
    if (!formData.title || !formData.category || !formData.price) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in title, category, and price',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get profile id
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Create product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          seller_id: profile.id,
          title: formData.title,
          description: formData.description || null,
          story: formData.story || null,
          craft_heritage: formData.craft_heritage || null,
          category: formData.category,
          price: parseFloat(formData.price),
          stock_quantity: parseInt(formData.stock_quantity) || 1,
          is_customizable: formData.is_customizable,
          materials_used: formData.materials_used ? formData.materials_used.split(',').map(m => m.trim()) : null,
          creation_time_hours: formData.creation_time_hours ? parseInt(formData.creation_time_hours) : null,
          status
        })
        .select()
        .single();

      if (productError) throw productError;

      // Upload images
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${product.id}/${Date.now()}_${i}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, file);

          if (uploadError) {
            console.error('Image upload error:', uploadError);
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);

          // Save image reference
          await supabase
            .from('product_images')
            .insert({
              product_id: product.id,
              image_url: publicUrl,
              is_primary: i === 0,
              display_order: i
            });
        }
      }

      toast({
        title: status === 'active' ? 'Product Published!' : 'Draft Saved',
        description: status === 'active' 
          ? 'Your product is now live on the marketplace'
          : 'Your product has been saved as a draft'
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create product',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Images */}
          <div>
            <Label>Product Images (max 5)</Label>
            <div className="mt-2 grid grid-cols-5 gap-4">
              {imagePreview.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 text-xs bg-primary text-primary-foreground px-1 rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}
              {images.length < 5 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center text-muted-foreground hover:text-primary"
                >
                  <Upload className="h-6 w-6 mb-1" />
                  <span className="text-xs">Upload</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Hand-painted Terracotta Vase"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="e.g., 1500"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>

          {/* AI Generate Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateWithAI}
            disabled={isGenerating || !formData.title || !formData.category}
            className="w-full"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Description with AI'}
          </Button>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your product in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[100px]"
            />
          </div>

          {/* Story */}
          <div>
            <Label htmlFor="story">Your Story (What inspired this product?)</Label>
            <Textarea
              id="story"
              placeholder="Share the story behind this creation..."
              value={formData.story}
              onChange={(e) => setFormData({ ...formData, story: e.target.value })}
              className="min-h-[80px]"
            />
          </div>

          {/* Craft Heritage */}
          <div>
            <Label htmlFor="craft_heritage">Craft Heritage</Label>
            <Textarea
              id="craft_heritage"
              placeholder="Describe the cultural significance of this craft..."
              value={formData.craft_heritage}
              onChange={(e) => setFormData({ ...formData, craft_heritage: e.target.value })}
              className="min-h-[80px]"
            />
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="creation_time">Creation Time (hours)</Label>
              <Input
                id="creation_time"
                type="number"
                placeholder="e.g., 8"
                value={formData.creation_time_hours}
                onChange={(e) => setFormData({ ...formData, creation_time_hours: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="materials">Materials Used (comma-separated)</Label>
            <Input
              id="materials"
              placeholder="e.g., Clay, Natural dyes, Bamboo"
              value={formData.materials_used}
              onChange={(e) => setFormData({ ...formData, materials_used: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="customizable"
              checked={formData.is_customizable}
              onCheckedChange={(checked) => setFormData({ ...formData, is_customizable: checked })}
            />
            <Label htmlFor="customizable">Accept custom orders for this product</Label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting}
            >
              Save as Draft
            </Button>
            <Button
              className="flex-1"
              onClick={() => handleSubmit('active')}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Publish Product
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductForm;
