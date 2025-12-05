/**
 * Haptic feedback utility for native-like mobile experience
 * Uses the Vibration API when available
 */

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

const hapticPatterns: Record<HapticStyle, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  warning: [30, 50, 30],
  error: [50, 100, 50, 100, 50],
  selection: 5
};

/**
 * Check if haptic feedback is supported
 */
export const isHapticSupported = (): boolean => {
  return 'vibrate' in navigator;
};

/**
 * Trigger haptic feedback
 * @param style - The style of haptic feedback
 */
export const haptic = (style: HapticStyle = 'light'): void => {
  if (!isHapticSupported()) return;
  
  try {
    const pattern = hapticPatterns[style];
    navigator.vibrate(pattern);
  } catch (error) {
    // Silently fail if vibration is not allowed
    console.debug('Haptic feedback not available:', error);
  }
};

/**
 * Trigger light tap feedback (for buttons, selections)
 */
export const hapticTap = (): void => haptic('light');

/**
 * Trigger selection feedback (for toggles, switches)
 */
export const hapticSelection = (): void => haptic('selection');

/**
 * Trigger success feedback
 */
export const hapticSuccess = (): void => haptic('success');

/**
 * Trigger warning feedback
 */
export const hapticWarning = (): void => haptic('warning');

/**
 * Trigger error feedback
 */
export const hapticError = (): void => haptic('error');

/**
 * Trigger impact feedback (for confirmations, important actions)
 */
export const hapticImpact = (intensity: 'light' | 'medium' | 'heavy' = 'medium'): void => {
  haptic(intensity);
};
