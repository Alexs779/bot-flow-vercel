/**
 * Haptic feedback utilities for Telegram WebApp
 * Provides tactile feedback for user interactions
 */

type HapticImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
type HapticNotificationType = 'error' | 'success' | 'warning'

export const haptics = {
  /**
   * Trigger impact haptic feedback
   * @param style - Impact style (light, medium, heavy, rigid, soft)
   */
  impact(style: HapticImpactStyle = 'light'): void {
    try {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style)
    } catch (error) {
      console.debug('Haptic feedback not available:', error)
    }
  },

  /**
   * Trigger notification haptic feedback
   * @param type - Notification type (error, success, warning)
   */
  notification(type: HapticNotificationType): void {
    try {
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type)
    } catch (error) {
      console.debug('Haptic feedback not available:', error)
    }
  },

  /**
   * Trigger selection changed haptic feedback
   */
  selectionChanged(): void {
    try {
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged()
    } catch (error) {
      console.debug('Haptic feedback not available:', error)
    }
  },

  // Convenience methods
  light: () => haptics.impact('light'),
  medium: () => haptics.impact('medium'),
  heavy: () => haptics.impact('heavy'),
  success: () => haptics.notification('success'),
  error: () => haptics.notification('error'),
  warning: () => haptics.notification('warning'),
}
