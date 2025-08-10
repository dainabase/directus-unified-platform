/**
 * Feature Flags System for @dainabase/ui
 * Allows enabling/disabling features at runtime
 */

// Available feature flags
export const FEATURE_FLAGS = {
  // Component features
  ENABLE_DATA_GRID_EXPERIMENTAL: 'enable_data_grid_experimental',
  ENABLE_CHARTS_3D: 'enable_charts_3d',
  ENABLE_AI_COMPONENTS: 'enable_ai_components',
  ENABLE_ANIMATION_HEAVY: 'enable_animation_heavy',
  
  // Theme features
  ENABLE_CUSTOM_THEMES: 'enable_custom_themes',
  ENABLE_THEME_BUILDER: 'enable_theme_builder',
  ENABLE_COLOR_PICKER: 'enable_color_picker',
  
  // Performance features
  ENABLE_VIRTUALIZATION: 'enable_virtualization',
  ENABLE_WEB_WORKERS: 'enable_web_workers',
  ENABLE_LAZY_LOADING: 'enable_lazy_loading',
  ENABLE_PREFETCH: 'enable_prefetch',
  
  // Accessibility features
  ENABLE_SCREEN_READER_ENHANCED: 'enable_screen_reader_enhanced',
  ENABLE_KEYBOARD_NAVIGATION_HINTS: 'enable_keyboard_navigation_hints',
  ENABLE_HIGH_CONTRAST_AUTO: 'enable_high_contrast_auto',
  
  // Developer features
  ENABLE_DEBUG_MODE: 'enable_debug_mode',
  ENABLE_PERFORMANCE_MONITOR: 'enable_performance_monitor',
  ENABLE_COMPONENT_INSPECTOR: 'enable_component_inspector',
  ENABLE_STYLE_DEBUGGER: 'enable_style_debugger',
} as const;

export type FeatureFlag = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS];

// Storage key prefix
const STORAGE_PREFIX = 'ds_feature_';

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  // Check environment variable first
  if (typeof process !== 'undefined' && process.env) {
    const envVar = process.env[`REACT_APP_${flag.toUpperCase()}`];
    if (envVar !== undefined) {
      return envVar === 'true' || envVar === '1';
    }
  }

  // Check localStorage (browser only)
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${flag}`);
      if (stored !== null) {
        return stored === 'true';
      }
    } catch (e) {
      // localStorage might be disabled
      console.warn('localStorage not available:', e);
    }
  }

  // Check URL parameters (browser only)
  if (typeof window !== 'undefined' && window.location) {
    const params = new URLSearchParams(window.location.search);
    const param = params.get(`feature_${flag}`);
    if (param !== null) {
      return param === 'true' || param === '1';
    }
  }

  // Default values for specific flags
  const defaults: Partial<Record<FeatureFlag, boolean>> = {
    [FEATURE_FLAGS.ENABLE_VIRTUALIZATION]: true,
    [FEATURE_FLAGS.ENABLE_LAZY_LOADING]: true,
    [FEATURE_FLAGS.ENABLE_PREFETCH]: false,
    [FEATURE_FLAGS.ENABLE_DEBUG_MODE]: false,
  };

  return defaults[flag] ?? false;
}

/**
 * Enable a feature flag
 */
export function enableFeature(flag: FeatureFlag): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${flag}`, 'true');
    } catch (e) {
      console.warn('Could not save feature flag:', e);
    }
  }
}

/**
 * Disable a feature flag
 */
export function disableFeature(flag: FeatureFlag): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${flag}`, 'false');
    } catch (e) {
      console.warn('Could not save feature flag:', e);
    }
  }
}

/**
 * Toggle a feature flag
 */
export function toggleFeature(flag: FeatureFlag): boolean {
  const currentState = isFeatureEnabled(flag);
  if (currentState) {
    disableFeature(flag);
  } else {
    enableFeature(flag);
  }
  return !currentState;
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): FeatureFlag[] {
  return Object.values(FEATURE_FLAGS).filter(flag => isFeatureEnabled(flag));
}

/**
 * Reset all feature flags to defaults
 */
export function resetAllFeatures(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      Object.values(FEATURE_FLAGS).forEach(flag => {
        localStorage.removeItem(`${STORAGE_PREFIX}${flag}`);
      });
    } catch (e) {
      console.warn('Could not reset feature flags:', e);
    }
  }
}

/**
 * React hook for using feature flags
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  if (typeof window !== 'undefined') {
    // In a real implementation, this would use React state and update on changes
    // For now, it's a simple wrapper
    return isFeatureEnabled(flag);
  }
  return false;
}

/**
 * HOC for conditionally rendering components based on feature flags
 */
export function withFeatureFlag<P extends object>(
  flag: FeatureFlag,
  Component: React.ComponentType<P>,
  FallbackComponent?: React.ComponentType<P>
): React.ComponentType<P> {
  return (props: P) => {
    const isEnabled = isFeatureEnabled(flag);
    
    if (isEnabled) {
      return <Component {...props} />;
    }
    
    if (FallbackComponent) {
      return <FallbackComponent {...props} />;
    }
    
    return null;
  };
}

/**
 * Development only: Show feature flags panel
 */
export function showFeatureFlagsPanel(): void {
  if (!isFeatureEnabled(FEATURE_FLAGS.ENABLE_DEBUG_MODE)) {
    console.warn('Feature flags panel is only available in debug mode');
    return;
  }

  // In a real implementation, this would show a UI panel
  console.log('Enabled features:', getEnabledFeatures());
  console.log('All features:', Object.values(FEATURE_FLAGS));
}
