import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs, useRouter, Redirect } from "expo-router";
import React, { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { useAuthStore } from "@/store/authStore";
import { useColors } from "@/hooks/useColors";

export default function OwnerLayout() {
  const colors = useColors();
  const { role, token } = useAuthStore();
  const router = useRouter();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  useEffect(() => {
    if (role && role !== "STORE_OWNER") {
      router.replace("/(customer)/home");
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
        tabBarInactiveTintColor: colors.textPlaceholder,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700", marginTop: -2 },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.95)",
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          height: isWeb ? 84 : 65,
          paddingBottom: isIOS ? 20 : 8,
          paddingTop: 8,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={40}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(255,255,255,0.9)" }]} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="dashboard/index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard-variant" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inventory/index"
        options={{
          title: "Inventory",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="cube-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="billing/index"
        options={{
          title: "Billing",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="receipt-text-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="forecast/index"
        options={{
          title: "Insights",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="brain" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics/index"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="finance" size={24} color={color} />,
        }}
      />
      <Tabs.Screen name="inventory/add-product" options={{ href: null }} />
      <Tabs.Screen name="inventory/edit-product" options={{ href: null }} />
      <Tabs.Screen name="billing/history" options={{ href: null }} />
      <Tabs.Screen name="billing/khata" options={{ href: null }} />
    </Tabs>
  );
}
