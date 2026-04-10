const colors = {
  light: {
    text: "#F8FAFC",
    tint: "#10B981", // Organic Green

    background: "#010816", // Deep Onyx Black
    foreground: "#F8FAFC",

    card: "#0A121F", // Deep Space Blue/Black
    cardForeground: "#F8FAFC",

    primary: "#10B981", // Organic Green
    primaryForeground: "#FFFFFF",
    primaryLight: "#10B98120",

    secondary: "#6366F1", // Indigo
    secondaryForeground: "#FFFFFF",
    secondaryLight: "#6366F120",

    accent: "#F59E0B", // Amber
    accentForeground: "#FFFFFF",
    accentLight: "#F59E0B20",

    success: "#10B981",
    successLight: "#10B98120",
    warning: "#F59E0B",
    warningLight: "#F59E0B20",
    danger: "#EF4444",
    dangerLight: "#EF444420",

    muted: "#1E293B",
    mutedForeground: "#94A3B8",

    destructive: "#EF4444",
    destructiveForeground: "#FFFFFF",

    border: "#FFFFFF1A",
    input: "#FFFFFF1A",

    dark: "#010816",
    gray900: "#000000",
    gray600: "#475569",
    gray300: "#94A3B8",
    gray100: "#1E293B",
    white: "#FFFFFF",

    // Premium Backgrounds
    deepBackground: "#000000",
    sapphire: "#020617",
    
    textPrimary: "#FFFFFF",
    textSecondary: "#94A3B8",
    textPlaceholder: "#64748B",

    rupee: "#10B981",
    lowStock: "#F59E0B",
    outOfStock: "#EF4444",
    inStock: "#10B981",

    tabBar: "#010816",
    tabBarBorder: "#FFFFFF1A",
    overlay: "#000000CC",
    
    // Liquid Glass Specials
    glassBorder: "#FFFFFF20",
    glassSurface: "#FFFFFF10",
    glassCardDark: "#00000040",
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  shadows: {
    soft: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    premium: {
      shadowColor: "#6366F1",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 8,
    }
  }
};

export default colors;
