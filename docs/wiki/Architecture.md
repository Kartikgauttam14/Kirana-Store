# Architecture & Directory Structure 🏗️

Kirana-AI is built on **Expo SDK 54** using the **Expo Router** for file-based navigation. The application is divided into distinct role-based zones to ensure a clean separation of concerns.

## 📁 Core Directory Map

### `app/` (The Routing Engine)
- **`(auth)/`**: Handles role selection (`role-select.tsx`), login, and registration flows.
- **`(customer)/`**: The express shopping experience. Includes store discovery, product listing, and checkout.
- **`(owner)/`**: The administrative dashboard for shop owners. Handles inventory management and billing.
- **`(tabs)/`**: Shared navigation base (Home, Search, Orders, Profile).

### `components/` (UI Library)
- **`ui/`**: Atomic components like buttons, inputs, and the `BrandLogo.tsx`.
- **`glass/`**: Specialized components implementing the Liquid Glass effect (Cards, Headers).
- **`owner/` & `customer/`**: Role-specific UI elements.

### `design-system/`
Contains our premium design tokens, pre-built chart configurations, and the `kiranaai` custom styling layer that drives the glassmorphic aesthetic.

### `store/`
Zustand stores that manage the global application state (Auth, Cart, Inventory).

### `server/` & `scripts/`
- **`server/`**: A lightweight Node.js mockup server that simulates real-time logistics and backend APIs during development.
- **`scripts/`**: Build and automation utilities.

## 🛰️ Data Flow
1. **User Interaction**: UI components trigger actions in **Zustand stores**.
2. **State Logic**: Stores process the data (e.g., checking for store conflicts in the cart).
3. **Mock Integration**: Stores interact with the `server/` mockup to simulate persistent data.
4. **UI Update**: Components subscribe to stores and re-render with the latest state.

---

> [!NOTE]
> All routing is typed (`typedRoutes: true` in `app.json`), ensuring compile-time safety when navigating between screens.
