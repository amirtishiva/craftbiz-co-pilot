/**
 * Conflict resolution utilities for sync actions
 */

import { supabase } from '@/integrations/supabase/client';
import { SyncAction } from './backgroundSync';

export interface ConflictInfo {
  actionId: string;
  type: SyncAction['type'];
  localData: Record<string, unknown>;
  serverData: Record<string, unknown> | null;
  conflictType: 'modified' | 'deleted' | 'none';
  resolvedAt?: number;
}

export type ConflictResolutionStrategy = 'local' | 'server' | 'merge' | 'skip';

/**
 * Check for conflicts before syncing a cart action
 */
export const checkCartConflict = async (
  action: SyncAction
): Promise<ConflictInfo> => {
  const { type, payload, id } = action;

  try {
    switch (type) {
      case 'update_cart': {
        const itemId = payload.itemId as string;
        const { data: serverItem } = await supabase
          .from('cart_items')
          .select('*')
          .eq('id', itemId)
          .single();

        if (!serverItem) {
          return {
            actionId: id,
            type,
            localData: payload,
            serverData: null,
            conflictType: 'deleted'
          };
        }

        // Check if quantity was modified on server
        const localQuantity = payload.quantity as number;
        if (serverItem.quantity !== localQuantity) {
          return {
            actionId: id,
            type,
            localData: payload,
            serverData: serverItem,
            conflictType: 'modified'
          };
        }

        return {
          actionId: id,
          type,
          localData: payload,
          serverData: serverItem,
          conflictType: 'none'
        };
      }

      case 'remove_from_cart': {
        const itemId = payload.itemId as string;
        const { data: serverItem } = await supabase
          .from('cart_items')
          .select('*')
          .eq('id', itemId)
          .single();

        if (!serverItem) {
          // Already deleted on server - no conflict, just skip
          return {
            actionId: id,
            type,
            localData: payload,
            serverData: null,
            conflictType: 'deleted'
          };
        }

        return {
          actionId: id,
          type,
          localData: payload,
          serverData: serverItem,
          conflictType: 'none'
        };
      }

      case 'add_to_cart': {
        const productId = payload.productId as string;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return {
            actionId: id,
            type,
            localData: payload,
            serverData: null,
            conflictType: 'none'
          };
        }

        // Check if item already exists in cart
        const { data: existingItem } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .single();

        if (existingItem) {
          return {
            actionId: id,
            type,
            localData: payload,
            serverData: existingItem,
            conflictType: 'modified'
          };
        }

        return {
          actionId: id,
          type,
          localData: payload,
          serverData: null,
          conflictType: 'none'
        };
      }

      default:
        return {
          actionId: id,
          type,
          localData: payload,
          serverData: null,
          conflictType: 'none'
        };
    }
  } catch (error) {
    console.error('Error checking conflict:', error);
    return {
      actionId: id,
      type,
      localData: payload,
      serverData: null,
      conflictType: 'none'
    };
  }
};

/**
 * Resolve a cart conflict based on the chosen strategy
 */
export const resolveCartConflict = async (
  conflict: ConflictInfo,
  strategy: ConflictResolutionStrategy
): Promise<{ success: boolean; error?: string }> => {
  const { type, localData, serverData } = conflict;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    switch (strategy) {
      case 'skip':
        // Don't apply the local change
        return { success: true };

      case 'server':
        // Keep server data, discard local change
        return { success: true };

      case 'local':
        // Apply local change, overwrite server
        return await applyLocalChange(type, localData, user.id);

      case 'merge':
        // Merge quantities for cart items
        if (type === 'add_to_cart' && serverData) {
          const mergedQuantity = ((serverData.quantity as number) || 1) + ((localData.quantity as number) || 1);
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: mergedQuantity })
            .eq('id', serverData.id as string);
          
          if (error) return { success: false, error: error.message };
          return { success: true };
        }
        // Fall back to local for non-mergeable conflicts
        return await applyLocalChange(type, localData, user.id);

      default:
        return { success: false, error: 'Unknown strategy' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Apply local change to the server
 */
const applyLocalChange = async (
  type: SyncAction['type'],
  localData: Record<string, unknown>,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    switch (type) {
      case 'add_to_cart': {
        const { productId, quantity, customizationNotes } = localData;
        const { error } = await supabase.from('cart_items').upsert({
          user_id: userId,
          product_id: productId as string,
          quantity: (quantity as number) || 1,
          customization_notes: customizationNotes as string || null
        }, { onConflict: 'user_id,product_id' });
        
        if (error) return { success: false, error: error.message };
        return { success: true };
      }

      case 'update_cart': {
        const { itemId, quantity } = localData;
        if ((quantity as number) <= 0) {
          const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', itemId as string);
          if (error) return { success: false, error: error.message };
        } else {
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: quantity as number })
            .eq('id', itemId as string);
          if (error) return { success: false, error: error.message };
        }
        return { success: true };
      }

      case 'remove_from_cart': {
        const { itemId } = localData;
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId as string);
        if (error) return { success: false, error: error.message };
        return { success: true };
      }

      case 'toggle_wishlist': {
        const { productId } = localData;
        const { data: existing } = await supabase
          .from('wishlists')
          .select('id')
          .eq('user_id', userId)
          .eq('product_id', productId as string)
          .single();

        if (existing) {
          const { error } = await supabase
            .from('wishlists')
            .delete()
            .eq('id', existing.id);
          if (error) return { success: false, error: error.message };
        } else {
          const { error } = await supabase
            .from('wishlists')
            .insert({ user_id: userId, product_id: productId as string });
          if (error) return { success: false, error: error.message };
        }
        return { success: true };
      }

      default:
        return { success: false, error: 'Unknown action type' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Auto-resolve conflicts with sensible defaults
 */
export const autoResolveConflict = (conflict: ConflictInfo): ConflictResolutionStrategy => {
  const { type, conflictType } = conflict;

  switch (conflictType) {
    case 'deleted':
      // If item was deleted on server, skip the local change
      if (type === 'remove_from_cart') return 'skip';
      if (type === 'update_cart') return 'skip';
      // For add_to_cart, still try to add
      return 'local';

    case 'modified':
      // For cart additions where item exists, merge quantities
      if (type === 'add_to_cart') return 'merge';
      // For updates, prefer local (user's most recent action)
      if (type === 'update_cart') return 'local';
      return 'local';

    case 'none':
    default:
      return 'local';
  }
};
