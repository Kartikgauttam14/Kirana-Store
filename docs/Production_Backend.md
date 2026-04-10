# Production-Ready Backend Guide for KiranaAI

To build a production-ready backend that works seamlessly with your mobile app (even after creating an APK), I recommend using **Supabase**. It is a powerful, open-source Firebase alternative based on PostgreSQL that provides built-in Auth, Real-time, and Storage.

## 1. Core Technology Stack
- **Database**: PostgreSQL (provided by Supabase)
- **Authentication**: Supabase Auth (Supports Phone OTP, Email, Google)
- **Real-time**: Supabase Realtime (WebSockets for live order updates)
- **Storage**: Supabase Storage (for product images and receipts)
- **Hosting**: Supabase Cloud or self-hosted Docker

---

## 2. Setting Up Supabase

### Step 1: Create a Project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note your `Project URL` and `anon key` (found in Project Settings -> API).

### Step 3: Initialize Supabase Client
Create a file at `@/lib/supabase.ts`:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

---

## 3. Production Configuration (Crucial for APK)

When you build an APK, the app moves from your local network to the internet. Follow these steps to ensure connectivity:

### A. Environment Variables
Use `.env.production` for your production URL. Expo automatically picks up `EXPO_PUBLIC_` variables.
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

### B. Network Security (Android)
Android blocks non-HTTPS traffic by default. **Always use HTTPS URLs** for production. Supabase URLs are HTTPS by default, so you are safe.

### C. Build Configuration
Ensure your `app.json` has the correct `bundleIdentifier` and `package` name, as Supabase Auth redirects rely on these.

---

## 4. Real-time Features (Live Orders)
To show live order updates to the Store Owner, use Supabase Realtime:

```typescript
// Subscribe to new orders
const channel = supabase
  .channel('schema-db-changes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'orders',
    },
    (payload) => {
      console.log('New order received!', payload.new);
      // Update your UI state or show a notification
    }
  )
  .subscribe();
```

---

## 5. Security (Row Level Security)
In production, never allow direct public access to your tables. Enable **RLS** in the Supabase Dashboard:

```sql
-- Example: Only owners can see their own store's orders
CREATE POLICY "Owners can see their store orders" 
ON orders FOR SELECT 
USING (auth.uid() = store_owner_id);
```

---

## 6. Deployment Workflow
1. **Push Backend Changes**: Apply your migrations to the Supabase production environment.
2. **Build APK**: Run `eas build --platform android --profile production`.
3. **Distribute**: Upload to Play Store or share the APK.
