import React, { useState, useEffect } from 'react';
import { Camera, Save, Loader2, MapPin, Phone, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSellerProfile } from '@/hooks/useSellerProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ShopSettings: React.FC = () => {
  const { sellerProfile, updateSellerProfile, isLoading } = useSellerProfile();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    shop_name: '',
    shop_tagline: '',
    artisan_story: '',
    years_of_experience: 0,
    craft_specialty: [] as string[],
    location: '',
    phone: '',
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sellerProfile) {
      setFormData(prev => ({
        ...prev,
        shop_name: sellerProfile.shop_name || '',
        shop_tagline: sellerProfile.shop_tagline || '',
        artisan_story: sellerProfile.artisan_story || '',
        years_of_experience: sellerProfile.years_of_experience || 0,
        craft_specialty: sellerProfile.craft_specialty || [],
      }));
    }
    fetchProfileData();
  }, [sellerProfile]);

  const fetchProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url, location, phone')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        setAvatarUrl(profile.avatar_url);
        setFormData(prev => ({
          ...prev,
          location: profile.location || '',
          phone: profile.phone || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({
        title: 'Photo updated',
        description: 'Your shop photo has been updated',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload photo',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update seller profile
      await updateSellerProfile({
        shop_name: formData.shop_name,
        shop_tagline: formData.shop_tagline || null,
        artisan_story: formData.artisan_story || null,
        years_of_experience: formData.years_of_experience || null,
        craft_specialty: formData.craft_specialty.length > 0 ? formData.craft_specialty : null,
      });

      // Update profiles table with location and phone (buyer-visible fields)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          location: formData.location || null,
          phone: formData.phone || null,
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      toast({
        title: 'Shop settings saved',
        description: 'Your shop information has been updated',
      });
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: 'Save failed',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSpecialtyChange = (value: string) => {
    const specialties = value.split(',').map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, craft_specialty: specialties }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shop Profile Photo</CardTitle>
          <CardDescription className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Visible to buyers in the marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Shop" className="h-full w-full object-cover" />
                ) : (
                  <Camera className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Recommended: Square image, at least 200x200px
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shop Information</CardTitle>
          <CardDescription className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            This information is visible to buyers in the marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shop_name">Shop Name *</Label>
                <Input
                  id="shop_name"
                  value={formData.shop_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, shop_name: e.target.value }))}
                  placeholder="Your shop name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="years_of_experience">Years of Experience</Label>
                <Input
                  id="years_of_experience"
                  type="number"
                  min="0"
                  value={formData.years_of_experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, years_of_experience: parseInt(e.target.value) || 0 }))}
                  placeholder="Years of craft experience"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shop_tagline">Shop Tagline</Label>
              <Input
                id="shop_tagline"
                value={formData.shop_tagline}
                onChange={(e) => setFormData(prev => ({ ...prev, shop_tagline: e.target.value }))}
                placeholder="A short description of your shop"
                maxLength={150}
              />
              <p className="text-xs text-muted-foreground">
                {formData.shop_tagline.length}/150 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="craft_specialty">Craft Specialties</Label>
              <Input
                id="craft_specialty"
                value={formData.craft_specialty.join(', ')}
                onChange={(e) => handleSpecialtyChange(e.target.value)}
                placeholder="e.g., Pottery, Woodwork, Embroidery (comma-separated)"
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple specialties with commas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="artisan_story">Your Story</Label>
              <Textarea
                id="artisan_story"
                value={formData.artisan_story}
                onChange={(e) => setFormData(prev => ({ ...prev, artisan_story: e.target.value }))}
                placeholder="Share your journey as an artisan, your craft heritage, and what makes your work special..."
                rows={5}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground">
                {formData.artisan_story.length}/2000 characters
              </p>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Contact & Location
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Shop Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State"
                  />
                  <p className="text-xs text-muted-foreground">
                    Displayed to buyers on your products
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Contact Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 00000 00000"
                  />
                  <p className="text-xs text-muted-foreground">
                    For order inquiries from buyers
                  </p>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={saving || isLoading}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopSettings;
