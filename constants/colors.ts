const colors = {
  light: {
    text: "#0F172A",
    tint: "#10B981", // Organic Green

    background: "#F8FAFC",
    foreground: "#0F172A",

    card: "#FFFFFF",
    cardForeground: "#0F172A",

    primary: "#10B981", // Organic Green (Trust, Freshness)
    primaryForeground: "#FFFFFF",
    primaryLight: "#D1FAE5",

    secondary: "#6366F1", // Indigo (Tech, Intelligence)
    secondaryForeground: "#FFFFFF",
    secondaryLight: "#EEF2FF",

    accent: "#F59E0B", // Amber (Energy, Action)
    accentForeground: "#FFFFFF",
    accentLight: "#FEF3C7",

    success: "#10B981",
    successLight: "#D1FAE5",
    warning: "#F59E0B",
    warningLight: "#FEF3C7",
    danger: "#EF4444",
    dangerLight: "#FEE2E2",

    muted: "#F1F5F9",
    mutedForeground: "#64748B",

    destructive: "#EF4444",
    destructiveForeground: "#FFFFFF",

    border: "rgba(226, 232, 240, 0.8)",
    input: "#E2E8F0",

    dark: "#0F172A",
    gray900: "#010816",
    gray600: "#475569",
    gray300: "#CBD5E1",
    gray100: "#F1F7FF",
    white: "#FFFFFF",

    // Premium Backgrounds
    deepBackground: "#020617",
    sapphire: "#0F172A",
    
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    textPlaceholder: "#94A3B8",

    rupee: "#10B981",
    lowStock: "#F59E0B",
    outOfStock: "#EF4444",
    inStock: "#10B981",

    tabBar: "#FFFFFF",
    tabBarBorder: "#E2E8F0",
    overlay: "rgba(15, 23, 42, 0.5)",
    
    // Liquid Glass Specials
    glassBorder: "rgba(255, 255, 255, 0.2)",
    glassSurface: "rgba(255, 255, 255, 0.08)",
    glassCardDark: "rgba(255, 255, 255, 0.05)",
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
