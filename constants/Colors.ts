// Aviation-inspired color palette for SkyLaunch
// Design philosophy: Trust, professionalism, clarity

export const colors = {
  // Primary - Deep Navy (trust, professionalism)
  primary: '#1A2B4A',
  primaryLight: '#2D4A7C',
  primaryDark: '#0F1A2E',

  // Secondary - Sky Blue (aviation, clarity)
  secondary: '#4A90D9',
  secondaryLight: '#87CEEB',
  secondaryDark: '#2563EB',

  // Accent - Amber (caution, attention)
  accent: '#F5A623',
  accentLight: '#FCD34D',

  // Status colors
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  info: '#5AC8FA',

  // Neutrals
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  border: '#E2E8F0',

  // Text
  text: '#1A2B4A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',

  // Weather flight conditions (FAA standard)
  vfr: '#34C759',      // Green - VFR, good to fly
  mvfr: '#4A90D9',     // Blue - Marginal VFR
  ifr: '#FF9500',      // Orange - IFR only
  lifr: '#FF3B30',     // Red - Low IFR, dangerous
};

// Light theme
export const lightTheme = {
  ...colors,
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1A2B4A',
  tint: colors.secondary,
  tabIconDefault: colors.textTertiary,
  tabIconSelected: colors.secondary,
};

// Dark theme
export const darkTheme = {
  ...colors,
  background: '#0F172A',
  surface: '#1E293B',
  surfaceSecondary: '#334155',
  border: '#475569',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  tint: colors.secondaryLight,
  tabIconDefault: colors.textTertiary,
  tabIconSelected: colors.secondaryLight,
};

export default {
  light: lightTheme,
  dark: darkTheme,
};
