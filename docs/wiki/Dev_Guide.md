# Development & Deployment Guide 🚀

This guide outlines how to set up the development environment, run the project locally, and contribute to the Kirana-AI codebase.

## 🛠️ Environment Setup

### 1. Prerequisites
- **Node.js**: v18 or higher.
- **Package Manager**: `pnpm` (strongly recommended) or `npm`.
- **Expo Go**: Download the app on iOS/Android to test on real hardware.

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Kartikgauttam14/Kirana-Store.git

# Install dependencies
pnpm install
```

## 🏗️ Commands & Scripts

| Command | Usage |
| :--- | :--- |
| `pnpm dev` | Starts the Expo development server with Replit-specific networking support. |
| `pnpm serve` | Runs the Node.js mockup server for API simulation. |
| `pnpm build` | Prepares the application for production deployment. |
| `pnpm typecheck` | Runs the TypeScript compiler to check for type errors. |

## 🧪 Development Workflow

### Adding a New Screen
1. Create a new `.tsx` file in the appropriate directory under `app/` (e.g., `app/(customer)/new-feature.tsx`).
2. Add the route to the `_layout.tsx` if it needs a specific header or tab icon.
3. Import the `DesignSystem` tokens for styling.

### Creating a Glass Component
When building a "Liquid Glass" component, follow this structure:
1. Use `BlurView` from `expo-blur`.
2. Apply a semi-transparent background (e.g., `rgba(255, 255, 255, 0.1)`).
3. Add a thin `1px` white border with `0.2` opacity for a "polished edge" look.
4. Set shadow opacity slightly higher than standard to compensate for transparency.

## 📦 Deployment
The project is configured for **universal deployment**:
- **Web**: Optimized via `react-native-web`. Use `npx expo export` to generate a static site.
- **Native**: Use [Expo Application Services (EAS)](https://expo.dev/eas) to build and submit to the App Store or Play Store.

---

> [!CAUTION]
> Never commit `.env` files. Ensure you use the provided `.env.example` template when setting up environment variables for production APIs.
