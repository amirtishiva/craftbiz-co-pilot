/**
 * Push notification utilities for web push
 */

import { supabase } from '@/integrations/supabase/client';

// VAPID public key - this should be generated and stored securely
// For now, we'll use a placeholder that you should replace with your actual key
const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY';

/**
 * Check if push notifications are supported
 */
export const isPushSupported = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

/**
 * Check current notification permission
 */
export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported');
  }

  const permission = await Notification.requestPermission();
  return permission;
};

/**
 * Subscribe to push notifications
 */
export const subscribeToPush = async (): Promise<PushSubscription | null> => {
  if (!isPushSupported()) {
    console.warn('Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    let subscription = await (registration as any).pushManager.getSubscription();
    
    if (!subscription) {
      // Subscribe to push notifications
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer
      });
    }

    // Save subscription to backend
    await saveSubscriptionToServer(subscription);
    
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    return null;
  }
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPush = async (): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await (registration as any).pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      await removeSubscriptionFromServer(subscription);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push:', error);
    return false;
  }
};

/**
 * Save push subscription to backend
 */
const saveSubscriptionToServer = async (subscription: PushSubscription): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Store in localStorage for now (in production, send to server)
  const subscriptionData = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
      auth: arrayBufferToBase64(subscription.getKey('auth'))
    },
    userId: user.id,
    createdAt: new Date().toISOString()
  };

  localStorage.setItem('push_subscription', JSON.stringify(subscriptionData));
};

/**
 * Remove push subscription from backend
 */
const removeSubscriptionFromServer = async (subscription: PushSubscription): Promise<void> => {
  localStorage.removeItem('push_subscription');
};

/**
 * Show local notification (for in-app notifications)
 */
export const showLocalNotification = async (
  title: string,
  options?: NotificationOptions
): Promise<void> => {
  if (getNotificationPermission() !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      ...options
    });
  } catch (error) {
    // Fallback to regular notification
    new Notification(title, {
      icon: '/pwa-192x192.png',
      ...options
    });
  }
};

/**
 * Utility: Convert VAPID key to Uint8Array
 */
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Utility: Convert ArrayBuffer to Base64
 */
const arrayBufferToBase64 = (buffer: ArrayBuffer | null): string => {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

/**
 * Notification types for the app
 */
export type NotificationType = 
  | 'new_order' 
  | 'order_update' 
  | 'new_message' 
  | 'custom_request' 
  | 'review_received'
  | 'product_sold';

/**
 * Show app-specific notification
 */
export const showAppNotification = async (
  type: NotificationType,
  data: Record<string, any>
): Promise<void> => {
  const notificationConfig: Record<NotificationType, { title: string; body: string; tag: string }> = {
    new_order: {
      title: 'New Order Received!',
      body: `You have a new order worth ₹${data.amount || 0}`,
      tag: 'order'
    },
    order_update: {
      title: 'Order Update',
      body: `Your order status changed to: ${data.status || 'Updated'}`,
      tag: 'order'
    },
    new_message: {
      title: 'New Message',
      body: data.preview || 'You have a new message',
      tag: 'message'
    },
    custom_request: {
      title: 'Custom Order Request',
      body: 'Someone wants a custom item from you!',
      tag: 'custom'
    },
    review_received: {
      title: 'New Review',
      body: `You received a ${data.rating || 5}-star review!`,
      tag: 'review'
    },
    product_sold: {
      title: 'Product Sold!',
      body: `"${data.productName || 'Your product'}" has been sold`,
      tag: 'sale'
    }
  };

  const config = notificationConfig[type];
  if (!config) return;

  await showLocalNotification(config.title, {
    body: config.body,
    tag: config.tag,
    data: { type, ...data },
    requireInteraction: type === 'new_order' || type === 'custom_request'
  });
};
