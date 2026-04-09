# Implementation Plan - Applying New Brand Identity

This plan outlines the steps to replace the generic `Feather` "shopping-bag" icons with the newly designed `BrandLogo` component across all key screens and components of the Kirana-AI application.

## User Review Required

> [!IMPORTANT]
> The `BrandLogo` component is SVG-based. I will ensure it is correctly sized to match the existing UI layouts (ranging from splash screen size to smaller header sizes).

## Proposed Changes

### 1. Update Splash / Landing Screen

#### [MODIFY] [index.tsx](file:///c:/Users/vikas/Downloads/kirana-ai-project/artifacts/kirana-ai/app/index.tsx)
- Replace the `Feather` "shopping-bag" icon inside the white circle with the `<BrandLogo />` component.
- Adjust the `size` prop to fit the 96x96 circle (approx `size={64}`).

### 2. Update Role Selection Screen

#### [MODIFY] [role-select.tsx](file:///c:/Users/vikas/Downloads/kirana-ai-project/artifacts/kirana-ai/app/(auth)/role-select.tsx)
- Replace the logo inside the `LinearGradient` (lines 58-63) with `<BrandLogo />`.
- Use `size={56}` to match the existing visual weight.

### 3. Update Store Header (Owner View)

#### [MODIFY] [StoreHeader.tsx](file:///c:/Users/vikas/Downloads/kirana-ai-project/artifacts/kirana-ai/components/owner/StoreHeader.tsx)
- Replace the small icon in the header (lines 35-37) with `<BrandLogo />`.
- Use a small `size={24}` for the header context.

### 4. Update Profile Screen (Customer View)

#### [MODIFY] [index.tsx](file:///c:/Users/vikas/Downloads/kirana-ai-project/artifacts/kirana-ai/app/(customer)/profile/index.tsx)
- Replace any branding icons in the profile view with the new logo.

### 5. Update Store Detail Screen (Customer View)

#### [MODIFY] [index.tsx](file:///c:/Users/vikas/Downloads/kirana-ai-project/artifacts/kirana-ai/app/(customer)/stores/[storeId]/index.tsx)
- Replace branding icons or placeholders in the store view.

## Open Questions

- Are there any specific landing/marketing pages outside the main app flow that should also feature the logo?
- Should I keep the "logo circle/background" styles or let the `BrandLogo` stand on its own in some places? (Proposed: I will keep the backgrounds for now to maintain layout consistency).

## Verification Plan

### Manual Verification
- I will use the **browser subagent** to navigate through the app (Splash -> Role Select -> Home) and capture screenshots to verify the logo looks correct in all sizes and contexts.
- I will check both Light and Dark modes if applicable.
