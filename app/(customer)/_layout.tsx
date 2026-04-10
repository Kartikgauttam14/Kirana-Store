import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs, useRouter, Redirect } from "expo-router";
import React, { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useColors } from "@/hooks/useColors";

export default function CustomerLayout() {
  const colors = useColors();
  const { role, token } = useAuthStore();
  const router = useRouter();
  const cartCount = useCartStore((s) => s.getItemCount());
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  useEffect(() => {
    if (role && role !== "CUSTOMER") {
      router.replace("/(owner)/dashboard");
    }
  }, [role]);

  if (!token) {
    return <Redirect href="/(auth)/role-select" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "rgba(1,8,22,0.7)" : colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          height: isWeb ? 84 : undefined,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
          ) : null,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Feather name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stores/index"
        options={{
          title: "Stores",
          tabBarIcon: ({ color }) => <Feather name="map-pin" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart/index"
        options={{
          title: "Cart",
          tabBarIcon: ({ color }) => <Feather name="shopping-cart" size={22} color={color} />,
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => <Feather name="package" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Feather name="user" size={22} color={color} />,
        }}
      />
      <Tabs.Screen name="stores/[storeId]/index" options={{ href: null }} />
      <Tabs.Screen name="orders/[orderId]" options={{ href: null }} />
      <Tabs.Screen name="profile/addresses" options={{ href: null }} />
      <Tabs.Screen name="profile/wallet" options={{ href: null }} />
      <Tabs.Screen name="profile/referral" options={{ href: null }} />
      <Tabs.Screen name="profile/privacy" options={{ href: null }} />
      <Tabs.Screen name="profile/help" options={{ href: null }} />
      <Tabs.Screen name="profile/edit" options={{ href: null }} />
      <Tabs.Screen name="search/index" options={{ href: null }} />
    </Tabs>
  );
}
