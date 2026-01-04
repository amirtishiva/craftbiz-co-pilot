import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Upload, User, Info, Camera, MapPin, Phone, Briefcase } from "lucide-react";
import { validateImage } from "@/lib/validation";
import { useUserRoles } from "@/hooks/useUserRoles";

interface Profile {
  avatar_url: string | null;
  business_name: string | null;
  business_type: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
}

export const ProfileSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { isSeller } = useUserRoles();
  const [profile, setProfile] = useState<Profile>({
    avatar_url: null,
    business_name: null,
    business_type: null,
    phone: null,
    location: null,
    bio: null,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        if (data.avatar_url) {
          setPreviewUrl(data.avatar_url);
        }
      }
    } catch (error: any) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return null;

    setUploading(true);
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      toast.error("Failed to upload avatar");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      let avatarUrl = profile.avatar_url;
      
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar(user.id);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          ...profile,
          avatar_url: avatarUrl,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      setAvatarFile(null);
      fetchProfile();
    } catch (error: any) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Profile Settings
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isSeller 
              ? "Manage your personal account information. For marketplace-visible shop settings, go to Shop Settings."
              : "Manage your profile and account information"
            }
          </p>
        </div>

        {isSeller && (
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Info className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-foreground">Seller Tip</p>
                  <p className="text-muted-foreground mt-0.5">
                    To update your shop name, location, and contact info that buyers see in the marketplace, 
                    use the <span className="font-medium text-foreground">Shop Settings</span> tab in your seller dashboard.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <Card className="overflow-hidden border-border/50 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 border-b border-border/50">
              <CardTitle className="text-lg">Profile Picture</CardTitle>
              <CardDescription>
                {isSeller 
                  ? "Your personal profile picture (also used as shop photo if not set separately)"
                  : "Upload your profile picture"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center ring-4 ring-background shadow-lg">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-14 w-14 text-muted-foreground" />
                    )}
                  </div>
                  <Label 
                    htmlFor="avatar" 
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl"
                  >
                    <Camera className="h-8 w-8 text-white" />
                  </Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" className="rounded-xl" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </span>
                    </Button>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG or WEBP. Max 20MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Section */}
          <Card className="overflow-hidden border-border/50 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 border-b border-border/50">
              <CardTitle className="text-lg">{isSeller ? "Personal Details" : "Account Details"}</CardTitle>
              <CardDescription>
                {isSeller 
                  ? "Your personal information (not shown to buyers)"
                  : "Your account information"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="business_name" className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {isSeller ? "Display Name" : "Name"}
                  </Label>
                  <Input
                    id="business_name"
                    value={profile.business_name || ""}
                    onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                    placeholder={isSeller ? "Your name" : "Your name"}
                    className="h-11 rounded-xl bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_type" className="flex items-center gap-2 text-sm font-medium">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    {isSeller ? "Primary Craft" : "Interests"}
                  </Label>
                  <Input
                    id="business_type"
                    value={profile.business_type || ""}
                    onChange={(e) => setProfile({ ...profile, business_type: e.target.value })}
                    placeholder={isSeller ? "e.g., Pottery, Jewelry" : "e.g., Handmade goods, Art"}
                    className="h-11 rounded-xl bg-background/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone || ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+91 00000 00000"
                    className="h-11 rounded-xl bg-background/50"
                  />
                  {isSeller && (
                    <p className="text-xs text-muted-foreground">
                      For account recovery. Update Shop Settings for buyer contact.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={profile.location || ""}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="City, State"
                    className="h-11 rounded-xl bg-background/50"
                  />
                  {isSeller && (
                    <p className="text-xs text-muted-foreground">
                      Update Shop Settings to change marketplace location.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium">{isSeller ? "Personal Bio" : "Bio"}</Label>
                <Textarea
                  id="bio"
                  value={profile.bio || ""}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder={isSeller 
                    ? "A bit about yourself (your artisan story is in Shop Settings)"
                    : "Tell us about yourself..."
                  }
                  className="min-h-[120px] rounded-xl bg-background/50 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={saving || uploading}
              className="h-11 px-8 rounded-xl shadow-sm"
            >
              {saving || uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
