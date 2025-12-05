import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  initSyncDB,
  queueSyncAction,
  getPendingSyncActions,
  removeSyncAction,
  updateRetryCount,
  getPendingCount,
  SyncAction
} from '@/utils/backgroundSync';
import {
  checkCartConflict,
  resolveCartConflict,
  autoResolveConflict,
  ConflictInfo
} from '@/utils/conflictResolution';

interface UseBackgroundSyncReturn {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  conflicts: ConflictInfo[];
  queueCartAction: (type: SyncAction['type'], payload: Record<string, unknown>) => Promise<void>;
  syncNow: () => Promise<void>;
  resolveConflict: (conflict: ConflictInfo, strategy: 'local' | 'server' | 'merge' | 'skip') => Promise<void>;
  dismissConflict: (actionId: string) => void;
}

export const useBackgroundSync = (): UseBackgroundSyncReturn => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [conflicts, setConflicts] = useState<ConflictInfo[]>([]);

  // Initialize DB and load pending count
  useEffect(() => {
    const init = async () => {
      await initSyncDB();
      const count = await getPendingCount();
      setPendingCount(count);
    };
    init();
  }, []);

  // Process a single sync action with conflict detection
  const processActionWithConflictCheck = async (action: SyncAction): Promise<{ success: boolean; conflict?: ConflictInfo }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    try {
      // Check for conflicts
      const conflict = await checkCartConflict(action);
      
      if (conflict.conflictType !== 'none') {
        // Auto-resolve with sensible defaults
        const strategy = autoResolveConflict(conflict);
        const result = await resolveCartConflict(conflict, strategy);
        
        if (!result.success) {
          // If auto-resolve failed, report the conflict
          return { success: false, conflict };
        }
        return { success: true };
      }

      // No conflict, process normally
      switch (action.type) {
        case 'add_to_cart': {
          const { productId, quantity, customizationNotes } = action.payload;
          const { error } = await supabase.from('cart_items').upsert({
            user_id: user.id,
            product_id: productId as string,
            quantity: (quantity as number) || 1,
            customization_notes: customizationNotes as string || null
          }, { onConflict: 'user_id,product_id' });
          if (error) throw error;
          break;
        }

        case 'update_cart': {
          const { itemId, quantity } = action.payload;
          if ((quantity as number) <= 0) {
            const { error } = await supabase
              .from('cart_items')
              .delete()
              .eq('id', itemId as string);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('cart_items')
              .update({ quantity: quantity as number })
              .eq('id', itemId as string);
            if (error) throw error;
          }
          break;
        }

        case 'remove_from_cart': {
          const { itemId } = action.payload;
          const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', itemId as string);
          if (error) throw error;
          break;
        }

        case 'toggle_wishlist': {
          const { productId } = action.payload;
          const { data: existing } = await supabase
            .from('wishlists')
            .select('id')
            .eq('user_id', user.id)
            .eq('product_id', productId as string)
            .single();

          if (existing) {
            const { error } = await supabase
              .from('wishlists')
              .delete()
              .eq('id', existing.id);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('wishlists')
              .insert({
                user_id: user.id,
                product_id: productId as string
              });
            if (error) throw error;
          }
          break;
        }

        default:
          console.warn('Unknown sync action type:', action.type);
          return { success: false };
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to process sync action:', error);
      return { success: false };
    }
  };

  // Sync all pending actions
  const syncNow = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;

    setIsSyncing(true);
    let successCount = 0;
    let failCount = 0;
    const newConflicts: ConflictInfo[] = [];

    try {
      const actions = await getPendingSyncActions();
      
      for (const action of actions) {
        if (action.retryCount >= 3) {
          await removeSyncAction(action.id);
          failCount++;
          continue;
        }

        const result = await processActionWithConflictCheck(action);
        
        if (result.success) {
          await removeSyncAction(action.id);
          successCount++;
        } else if (result.conflict) {
          newConflicts.push(result.conflict);
          await updateRetryCount(action.id);
        } else {
          await updateRetryCount(action.id);
          failCount++;
        }
      }

      const newCount = await getPendingCount();
      setPendingCount(newCount);

      if (newConflicts.length > 0) {
        setConflicts(prev => [...prev, ...newConflicts]);
      }

      if (successCount > 0) {
        toast.success(`Synced ${successCount} offline action${successCount > 1 ? 's' : ''}`);
      }
      if (failCount > 0 && newCount > 0) {
        toast.error(`${failCount} action${failCount > 1 ? 's' : ''} failed to sync`);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  // Manually resolve a conflict
  const resolveConflictManually = useCallback(async (
    conflict: ConflictInfo,
    strategy: 'local' | 'server' | 'merge' | 'skip'
  ) => {
    const result = await resolveCartConflict(conflict, strategy);
    
    if (result.success) {
      await removeSyncAction(conflict.actionId);
      setConflicts(prev => prev.filter(c => c.actionId !== conflict.actionId));
      const newCount = await getPendingCount();
      setPendingCount(newCount);
      toast.success('Conflict resolved');
    } else {
      toast.error(result.error || 'Failed to resolve conflict');
    }
  }, []);

  // Dismiss a conflict without resolving
  const dismissConflict = useCallback((actionId: string) => {
    setConflicts(prev => prev.filter(c => c.actionId !== actionId));
  }, []);

  // Queue a cart action for sync
  const queueCartAction = useCallback(async (
    type: SyncAction['type'],
    payload: Record<string, unknown>
  ) => {
    await queueSyncAction(type, payload);
    const count = await getPendingCount();
    setPendingCount(count);
    toast.info('Action queued for sync when online');
  }, []);

  // Monitor online/offline status and auto-sync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing...');
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You are offline. Actions will sync when back online.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.onLine) {
      getPendingCount().then(count => {
        if (count > 0) {
          syncNow();
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncNow]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    conflicts,
    queueCartAction,
    syncNow,
    resolveConflict: resolveConflictManually,
    dismissConflict
  };
};
