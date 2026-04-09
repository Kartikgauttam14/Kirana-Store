# Design System & Liquid Glass UI 🎨

The Kirana-AI aesthetic is defined by **Liquid Glass — a fusion of high-transparency glassmorphism, vibrant Indian-inspired gradients, and ultra-crisp vector branding.**

## 💠 The Liquid Glass Concept
Our UI relies on the interplay of depth and transparency. 
- **Backdrop Blur**: We use `expo-blur` and `expo-glass-effect` to create layered surfaces.
- **Micro-Shadows**: Subtle, high-radius shadows to give cards a "floating" feel.
- **Gradients**: Smooth transitions from **Vibrant Orange (#FF6B00)** to deep Tech-Blue hues.

## 🏮 Color Palette

| Name | Hex | Usage |
| :--- | :--- | :--- |
| **Primary Orange** | `#FF6B00` | CTA Buttons, Primary Logos, Brand Highlights |
| **Tech Blue** | `#32C5FF` | AI Indicators, Inventory Pulses, Analytics Charts |
| **Glass Background** | `rgba(255, 255, 255, 0.15)` | Card backgrounds, Sidebar overlays |
| **Surface Dark** | `#0F172A` | Background for analytics and dashboards |

## 📐 Typography
We use a modern, geometric font pairing that balances readability with technical sophistication:
- **Heading**: `Outfit` or `Inter` Bold for clear, impactful titles.
- **Body**: `Inter` Regular for high legibility in product lists and analytics.

## 🌾 The "Hybrid Pulse-Grain" Logo
Implemented in `BrandLogo.tsx` as a pure SVG component, the logo evolves through the following layers:
1. **The Organic Grain**: A silhouette representing tradition and grocery roots.
2. **The Digital Pulse**: A tech-handle indicating digital empowerment.
3. **Data Points**: Integrated cutouts signifying AI-driven insights.

## ✨ Micro-Animations
We use `react-native-reanimated` for "Live" UI elements:
- **Button Bounces**: Subtle scale-down effects on press.
- **Glass Shimmer**: Light sweeping effects across glass cards to indicate loading or premium state.
- **Haptics**: Integration with `expo-haptics` for tactile feedback on critical actions like "Add to Cart".

---

> [!TIP]
> When creating new screens, always wrap glass cards in a `BlurView` to maintain depth consistency across the app.
