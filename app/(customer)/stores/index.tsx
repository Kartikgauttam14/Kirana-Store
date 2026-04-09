import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StoreCard } from "@/components/customer/StoreCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

export default function StoresScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { stores } = useData();
  const [search, setSearch] = useState("");
  const [showOpenOnly, setShowOpenOnly] = useState(false);

  const filtered = useMemo(() => {
    let list = stores.filter((s) => s.isActive);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q)
      );
    }
    if (showOpenOnly) list = list.filter((s) => s.isOpen);
    return list.map((s) => ({ ...s, distance: 0.3 + Math.random() * 3 }));
  }, [stores, search, showOpenOnly]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) },
      ]}
    >
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Nearby Stores</Text>
        <Text style={[styles.count, { color: colors.textSecondary }]}>{filtered.length} stores</Text>
      </View>

      <View style={[styles.searchRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBar, { borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search stores..."
            placeholderTextColor={colors.textPlaceholder}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.filterBtn,
            { backgroundColor: showOpenOnly ? colors.primary : colors.muted },
          ]}
          onPress={() => setShowOpenOnly(!showOpenOnly)}
        >
          <Feather name="clock" size={14} color={showOpenOnly ? "#fff" : colors.mutedForeground} />
          <Text style={[styles.filterBtnText, { color: showOpenOnly ? "#fff" : colors.mutedForeground }]}>
            Open
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StoreCard
            store={item}
            onPress={() =>
              router.push({
                pathname: "/(customer)/stores/[storeId]/index",
                params: { storeId: item.id },
              } as any)
            }
          />
        )}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 100 },
        ]}
        ListEmptyComponent={
          <EmptyState
            icon="map-pin"
            title="No stores found"
            subtitle={search ? "Try a different search" : "No stores available in your area"}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 26, fontWeight: "800" },
  count: { fontSize: 13, marginTop: 2 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderBottomWidth: 1,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 10,
  },
  searchInput: { flex: 1, fontSize: 15 },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  filterBtnText: { fontSize: 13, fontWeight: "600" },
  list: { paddingTop: 12 },
});
