import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InventoryAlert {
  productId: string;
  productTitle: string;
  currentStock: number;
  status: 'out_of_stock' | 'low_stock' | 'in_stock';
}

const LOW_STOCK_THRESHOLD = 5;

export const useInventoryAlerts = () => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const checkInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile) return;

      const { data: products, error } = await supabase
        .from('products')
        .select('id, title, stock_quantity, status')
        .eq('seller_id', profile.id);

      if (error) throw error;

      const inventoryAlerts: InventoryAlert[] = [];
      const productsToUpdate: { id: string; newStatus: string }[] = [];

      products?.forEach(product => {
        const stock = product.stock_quantity || 0;
        
        if (stock === 0) {
          inventoryAlerts.push({
            productId: product.id,
            productTitle: product.title,
            currentStock: stock,
            status: 'out_of_stock',
          });
          
          // Auto-change status to draft if out of stock and currently active
          if (product.status === 'active') {
            productsToUpdate.push({ id: product.id, newStatus: 'draft' });
          }
        } else if (stock <= LOW_STOCK_THRESHOLD) {
          inventoryAlerts.push({
            productId: product.id,
            productTitle: product.title,
            currentStock: stock,
            status: 'low_stock',
          });
        }
      });

      // Update products that are out of stock
      for (const update of productsToUpdate) {
        await supabase
          .from('products')
          .update({ status: update.newStatus })
          .eq('id', update.id);
      }

      if (productsToUpdate.length > 0) {
        toast({
          title: 'Inventory Alert',
          description: `${productsToUpdate.length} product(s) moved to draft due to zero stock`,
          variant: 'destructive',
        });
      }

      setAlerts(inventoryAlerts);
    } catch (error) {
      console.error('Error checking inventory:', error);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateStock = async (productId: string, newQuantity: number) => {
    try {
      const updates: any = { stock_quantity: newQuantity };
      
      // If restocking from zero, allow reactivating
      if (newQuantity > 0) {
        // Don't auto-activate, just allow manual activation
      } else {
        // Auto-deactivate if stock becomes zero
        updates.status = 'draft';
      }

      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId);

      if (error) throw error;

      // Refresh alerts
      await checkInventory();

      toast({
        title: 'Stock Updated',
        description: newQuantity === 0 
          ? 'Product moved to draft (out of stock)'
          : `Stock updated to ${newQuantity}`,
      });

      return true;
    } catch (error: any) {
      console.error('Error updating stock:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update stock',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    checkInventory();
  }, [checkInventory]);

  return {
    alerts,
    isLoading,
    checkInventory,
    updateStock,
    lowStockCount: alerts.filter(a => a.status === 'low_stock').length,
    outOfStockCount: alerts.filter(a => a.status === 'out_of_stock').length,
  };
};
