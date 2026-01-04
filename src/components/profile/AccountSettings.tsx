import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, LogOut, Mail, Trash2, AlertTriangle, Shield, Key, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { emailSchema } from "@/lib/validation";
import NotificationSettings from "./NotificationSettings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const AccountSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchCurrentEmail();
  }, []);

  const fetchCurrentEmail = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setCurrentEmail(user.email);
      }
    } catch (error: any) {
      console.error("Error fetching email:", error);
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = emailSchema.parse({ email: newEmail });

      if (validatedData.email === currentEmail) {
        toast.error("New email is the same as current email");
        return;
      }

      setEmailLoading(true);

      const { error } = await supabase.auth.updateUser({
        email: validatedData.email,
      });

      if (error) throw error;

      toast.success("Email update initiated. Please check both old and new email for confirmation links.");
      setNewEmail("");
      
      // Refresh current email after update
      setTimeout(() => {
        fetchCurrentEmail();
      }, 1000);
    } catch (error: any) {
      if (error.errors) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to update email");
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast.success("Password updated successfully");
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error("Failed to log out");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error("Please type DELETE to confirm account deletion");
      return;
    }

    setDeleteLoading(true);
    try {
      // Call secure edge function to delete account
      const { data, error } = await supabase.functions.invoke('delete-account');

      if (error) {
        throw new Error(error.message || "Failed to delete account");
      }

      if (!data?.success) {
        throw new Error(data?.error || "Failed to delete account");
      }

      // Sign out and redirect
      await supabase.auth.signOut();
      toast.success("Account deleted successfully");
      navigate("/");
    } catch (error: any) {
      console.error("Delete account error:", error);
      toast.error(error.message || "Failed to delete account. Please contact support.");
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setDeleteConfirmation("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Account Settings
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your account security and preferences
          </p>
        </div>

        {/* Email Section */}
        <Card className="overflow-hidden border-border/50 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Email Address</CardTitle>
                <CardDescription>Update your account email address</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleEmailUpdate} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="currentEmail" className="text-sm font-medium">Current Email</Label>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{currentEmail}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newEmail" className="text-sm font-medium">New Email</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email address"
                  className="h-11 rounded-xl bg-background/50"
                  required
                />
              </div>
              <Button type="submit" disabled={emailLoading} className="rounded-xl h-10">
                {emailLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Email"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card className="overflow-hidden border-border/50 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Key className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    placeholder="Enter new password"
                    className="h-11 rounded-xl bg-background/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    placeholder="Confirm new password"
                    className="h-11 rounded-xl bg-background/50"
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="rounded-xl h-10">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Session Section */}
        <Card className="overflow-hidden border-border/50 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Session</CardTitle>
                <CardDescription>Manage your current session</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Sign out from your account</p>
                <p className="text-xs text-muted-foreground mt-1">You'll need to sign in again to access your account</p>
              </div>
              <Button variant="outline" onClick={handleLogout} className="rounded-xl h-10 w-full sm:w-auto">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <NotificationSettings />

        {/* Danger Zone */}
        <Card className="overflow-hidden border-destructive/30 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-destructive/5 to-destructive/10 border-b border-destructive/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
                <CardDescription>Permanently delete your account and all associated data</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Delete your account</p>
                <p className="text-xs text-muted-foreground mt-1">This action is permanent and cannot be undone</p>
              </div>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="rounded-xl h-10 w-full sm:w-auto">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      Delete Account
                    </DialogTitle>
                    <DialogDescription className="space-y-3 pt-4">
                      <p className="font-semibold text-foreground">This action cannot be undone!</p>
                      <p>This will permanently delete:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Your account and profile</li>
                        <li>All business ideas and plans</li>
                        <li>All design assets and marketing content</li>
                        <li>All uploaded files and data</li>
                      </ul>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="deleteConfirmation" className="text-sm font-medium">
                        Type <span className="font-bold text-destructive">DELETE</span> to confirm
                      </Label>
                      <Input
                        id="deleteConfirmation"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="Type DELETE"
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDeleteDialogOpen(false);
                        setDeleteConfirmation("");
                      }}
                      disabled={deleteLoading}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading || deleteConfirmation !== "DELETE"}
                      className="rounded-xl"
                    >
                      {deleteLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Forever
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
