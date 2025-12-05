import React from 'react';
import { Bell, BellOff, Smartphone, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';

const NotificationSettings: React.FC = () => {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe
  } = usePushNotifications();

  const handleToggle = async (enabled: boolean) => {
    if (enabled) {
      const success = await subscribe();
      if (success) {
        toast.success('Push notifications enabled');
      } else {
        toast.error('Failed to enable push notifications');
      }
    } else {
      const success = await unsubscribe();
      if (success) {
        toast.success('Push notifications disabled');
      } else {
        toast.error('Failed to disable push notifications');
      }
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported on this device or browser.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get notified about new orders, messages, and marketplace updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive push notifications on this device
            </p>
          </div>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <Switch
              checked={isSubscribed}
              onCheckedChange={handleToggle}
              disabled={permission === 'denied'}
            />
          )}
        </div>

        {/* Permission Denied Warning */}
        {permission === 'denied' && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm text-destructive">
              Notifications are blocked for this site. Please enable them in your browser settings.
            </p>
          </div>
        )}

        {/* Notification Categories */}
        {isSubscribed && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-medium">Notification Types</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">New Orders</Label>
                  <p className="text-xs text-muted-foreground">When you receive a new order</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Order Updates</Label>
                  <p className="text-xs text-muted-foreground">Status changes for your orders</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Custom Requests</Label>
                  <p className="text-xs text-muted-foreground">New custom order requests</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Reviews</Label>
                  <p className="text-xs text-muted-foreground">When you receive a new review</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Marketplace Updates</Label>
                  <p className="text-xs text-muted-foreground">New products and promotions</p>
                </div>
                <Switch defaultChecked={false} />
              </div>
            </div>
          </div>
        )}

        {/* Test Notification Button */}
        {isSubscribed && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              new Notification('CraftBiz', {
                body: 'Notifications are working!',
                icon: '/pwa-192x192.png'
              });
            }}
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Send Test Notification
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
