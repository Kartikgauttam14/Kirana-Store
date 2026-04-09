import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { useAuthStore } from "@/store/authStore";
import { useColors } from "@/hooks/useColors";

export default function OwnerLayout() {
  const colors = useColors();
  const role = useAuthStore((s) => s.role);
  const router = useRouter();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  useEffect(() => {
    if (role && role !== "STORE_OWNER") {
      router.replace("/(customer)/home");
    }
  }, [role]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          height: isWeb ? 84 : undefined,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
          ) : null,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="dashboard/index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <Feather name="bar-chart-2" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inventory/index"
        options={{
          title: "Inventory",
          tabBarIcon: ({ color }) => <Feather name="package" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="billing/index"
        options={{
          title: "Billing",
          tabBarIcon: ({ color }) => <Feather name="file-text" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="forecast/index"
        options={{
          title: "AI Forecast",
          tabBarIcon: ({ color }) => <Feather name="cpu" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics/index"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color }) => <Feather name="trending-up" size={22} color={color} />,
        }}
      />
      <Tabs.Screen name="inventory/add-product" options={{ href: null }} />
      <Tabs.Screen name="inventory/edit-product" options={{ href: null }} />
      <Tabs.Screen name="billing/history" options={{ href: null }} />
      <Tabs.Screen name="billing/khata" options={{ href: null }} />
    </Tabs>
  );
}
