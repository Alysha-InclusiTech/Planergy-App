export const PlannerColors = {
  light: {
    primary: '#5B8FF9',
    primaryHover: '#4A7FE8',
    text: '#37352F',
    textSecondary: '#787774',
    bg: '#F7F6F3',
    surface: '#FFFFFF',
    border: '#E3E2DF',
    danger: '#EF4444',
    dangerBg: '#FEE2E2',
    success: '#10B981',
    successBg: '#D1FAE5',
    warningBg: '#FEF3C7',
    onPrimary: '#FFFFFF',
  },
  dark: {
    primary: '#5B8FF9',
    primaryHover: '#6E9CFA',
    text: '#F2F1ED',
    textSecondary: '#A8A69F',
    bg: '#17181C',
    surface: '#212226',
    border: '#33343A',
    danger: '#F87171',
    dangerBg: '#3A1E1E',
    success: '#34D399',
    successBg: '#1B3A2C',
    warningBg: '#3A2F1B',
    onPrimary: '#FFFFFF',
  },
} as const;

export type PlannerTheme = typeof PlannerColors.light;

export const ENERGY_COLORS = {
  1: '#10B981',
  2: '#F59E0B',
  3: '#EF4444',
} as const;
