import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useColors } from "@/hooks/useColors";
import { Store } from "@/types/store.types";
import { BrandLogo } from "@/components/ui/BrandLogo";

interface StoreCardProps {
  store: Store;
  onPress: () => void;
}

export function StoreCard({ store, onPress }: StoreCardProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.white }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <View style={[styles.imagePlaceholder, { backgroundColor: colors.gray100 }]}>
          <BrandLogo size={48} />
        </View>
        <LinearGradient
          colors={["rgba(0,0,0,0.4)", "transparent"]}
          style={styles.imageOverlay}
        />
        <View style={[styles.timeBadge, { backgroundColor: colors.white }]}>
          <Text style={[styles.timeText, { color: colors.textPrimary }]}>
            12 MINS
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
            {store.name}
          </Text>
          <View style={[styles.ratingBadge, { backgroundColor: "#EBFBEE" }]}>
            <Text style={[styles.ratingText, { color: "#2E7D32" }]}>{store.rating.toFixed(1)}</Text>
            <Feather name="star" size={10} color="#2E7D32" />
          </View>
        </View>

        <Text style={[styles.address, { color: colors.textSecondary }]} numberOfLines={1}>
          {store.address}, {store.city}
        </Text>

        <View style={styles.footer}>
          <View style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primaryLight }]}>
              <Feather name="zap" size={10} color={colors.primary} />
            </View>
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>Free Delivery</Text>
          </View>
          <View style={styles.dot} />
          <Text style={[styles.featureText, { color: colors.textSecondary }]}>
            {store.distance?.toFixed(1) ?? "0.8"} km
          </Text>
        </View>

        {!store.isOpen && (
          <View style={[styles.closedOverlay, { backgroundColor: "rgba(255,255,255,0.7)" }]}>
            <View style={styles.closedBadge}>
              <Text style={styles.closedText}>CLOSED</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      web: {
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      }
    })
  },
  imageContainer: {
    width: 110,
    height: 110,
    position: "relative",
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  timeBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timeText: {
    fontSize: 10,
    fontWeight: "900",
  },
  content: {
    flex: 1,
    padding: 14,
    justifyContent: "center",
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  name: { fontSize: 17, fontWeight: "800", flex: 1 },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "800",
  },
  address: { fontSize: 13, fontWeight: "500", opacity: 0.7 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  featureIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 12,
    fontWeight: "600",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#CBD5E1",
  },
  closedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  closedBadge: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  closedText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },
});
