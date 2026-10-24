export const theme = {
  colors: {
    primaryDark: '#0B132B',
    primary: '#0F172A',
    surfaceDark: '#1E293B',
    surfaceBorder: '#334155',

    // Accents
    accent: '#06B6D4',
    accentHover: '#0891B2',
    accentLight: '#E0F2FE',
    accentSecondary: '#0284C7',

    // Surfaces & Backgrounds
    background: '#F8FAFC',
    card: '#FFFFFF',
    cardBorder: '#E2E8F0',
    cardBorderHover: '#CBD5E1',

    // Text
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',

    // Semantics
    success: '#10B981',
    successLight: '#ECFDF5',
    warning: '#F59E0B',
    warningLight: '#FFFBEB',
    danger: '#EF4444',
    dangerLight: '#FEF2F2',
    info: '#3B82F6',
    infoLight: '#EFF6FF',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    hero: 32,
  },

  radii: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },

  typography: {
    hero: {
      fontSize: 28,
      fontWeight: '800' as const,
      lineHeight: 34,
      letterSpacing: -0.5,
    },
    h1: {
      fontSize: 24,
      fontWeight: '800' as const,
      lineHeight: 30,
    },
    h2: {
      fontSize: 20,
      fontWeight: '700' as const,
      lineHeight: 26,
    },
    h3: {
      fontSize: 17,
      fontWeight: '700' as const,
      lineHeight: 22,
    },
    body: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 22,
    },
    bodyMedium: {
      fontSize: 15,
      fontWeight: '600' as const,
      lineHeight: 22,
    },
    caption: {
      fontSize: 13,
      fontWeight: '500' as const,
      lineHeight: 18,
    },
    subtext: {
      fontSize: 11,
      fontWeight: '600' as const,
      lineHeight: 15,
    },
  },

  shadows: {
    card: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    hover: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
      elevation: 4,
    },
  },
};
