import { useCallback } from 'react';
import { haptic, hapticTap, hapticSelection, hapticSuccess, hapticWarning, hapticError, hapticImpact, HapticStyle } from '@/utils/haptics';

/**
 * Hook for using haptic feedback in components
 */
export const useHaptic = () => {
  const trigger = useCallback((style: HapticStyle = 'light') => {
    haptic(style);
  }, []);

  const tap = useCallback(() => {
    hapticTap();
  }, []);

  const selection = useCallback(() => {
    hapticSelection();
  }, []);

  const success = useCallback(() => {
    hapticSuccess();
  }, []);

  const warning = useCallback(() => {
    hapticWarning();
  }, []);

  const error = useCallback(() => {
    hapticError();
  }, []);

  const impact = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    hapticImpact(intensity);
  }, []);

  return {
    trigger,
    tap,
    selection,
    success,
    warning,
    error,
    impact
  };
};
