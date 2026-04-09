import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAuthStore } from "@/store/authStore";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default function IndexScreen() {
  const router = useRouter();
  const { token, role } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!token) {
        router.replace("/(auth)/role-select");
      } else if (role === "STORE_OWNER") {
        router.replace("/(owner)/dashboard");
      } else {
        router.replace("/(customer)/home");
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={["#FF6B00", "#FF8C00", "#FFA500"]} style={styles.container}>
      <View style={styles.center}>
        <View style={styles.logoCircle}>
          <BrandLogo size={64} />
        </View>
        <Text style={styles.appName}>KiranaAI</Text>
        <Text style={styles.tagline}>Your Smart Kirana Partner</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  appName: {
    fontSize: 40,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },
});
