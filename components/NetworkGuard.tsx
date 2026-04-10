import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Platform } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getSyncQueueSize } from "@/lib/syncQueue";

/**
 * NetworkGuard — Displays a subtle banner at the top of the app
 * when there are pending sync items or when the device appears offline.
 *
 * Place this inside the root layout, above the main content.
 */
export function NetworkGuard() {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Check queue size periodically
    const check = async () => {
      const size = await getSyncQueueSize();
      setPendingCount(size);
    };

    check();
    const interval = setInterval(check, 30000); // every 30s
    return () => clearInterval(interval);
  }, []);

  if (pendingCount === 0) return null;

  return (
    <Animated.View
      entering={FadeInDown.springify()}
      exiting={FadeOutUp}
      style={styles.banner}
    >
      <MaterialCommunityIcons name="cloud-sync-outline" size={16} color="#fff" />
      <Text style={styles.text}>
        {pendingCount} change{pendingCount > 1 ? "s" : ""} pending sync
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F59E0B",
    paddingVertical: 6,
    paddingHorizontal: 16,
    ...(Platform.OS === "web"
      ? { position: "fixed" as any, bottom: 0, left: 0, right: 0, zIndex: 9999 }
      : {}),
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
