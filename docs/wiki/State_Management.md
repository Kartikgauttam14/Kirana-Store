# State Management (Zustand Patterns) 🧠

Kirana-AI uses **Zustand** for predictable, lightweight state management. We prefer Zustand over Redux for its simplicity, performance in React Native environments, and ease of use with the Liquid Glass UI.

## 📦 Global Stores

### 🛒 `useCartStore` (`cartStore.ts`)
Manages the shopping cart for customers.
- **Logic**: Implements a "One Cart, One Store" policy. If a user tries to add an item from Store B while already having items from Store A, the store returns a `store_conflict`.
- **Primary Actions**: `addItem`, `removeItem`, `updateQty`, `clearCart`.
- **Selectors**: `getTotal`, `getItemCount`.

### 🔐 `useAuthStore` (`authStore.ts`)
Manages user sessions, role selection, and profile information.
- **Roles**: `CUSTOMER`, `STORE_OWNER`, `ADMIN`.
- **Persistence**: Persists user data locally to handle app restarts gracefully.

### 📦 `useInventoryStore` (`inventoryStore.ts`)
Used by Store Owners to manage their digital catalog.
- **Functions**: Handles adding, editing, and deleting products.
- **Search**: Includes optimized local search filters for quick inventory lookups.

### 📊 `useBillingStore` (`billingStore.ts`)
Powers the owner-side checkout and invoicing system.
- **Logic**: Handles barcode mockups and calculation of itemized billing for walk-in customers.

## 🛠️ Implementation Patterns

### 1. Atomic Updates
We use functional updates to ensure state consistency:
```typescript
set((state) => ({ ...state, count: state.count + 1 }))
```

### 2. Derived State
Computation-heavy logic is handled inside the store (e.g., `getTotal`) to keep UI components thin.

### 3. Error Handling
Actions like `addItem` return string literals (`"added" | "store_conflict"`) instead of throwing errors, allowing UI components to handle logic with simple `switch` statements or conditional rendering.

---

> [!IMPORTANT]
> Always check for the `store_conflict` state when calling `addItem` from the `useCartStore` to avoid mixing inventory from different local Kirana stores.
