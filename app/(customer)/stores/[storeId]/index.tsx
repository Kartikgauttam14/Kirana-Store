import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInRight, FadeInUp, ZoomIn } from "react-native-reanimated";
import { BlurView } from "expo-blur";

import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { useCartStore } from "@/store/cartStore";
import { PRODUCT_CATEGORIES } from "@/constants/categories";
import { formatCurrency } from "@/utils/formatCurrency";
import { Product } from "@/types/inventory.types";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { GlassCard } from "@/components/ui/GlassCard";

export default function StoreDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  const { stores, getProductsForStore } = useData();
  const { addItem, items, getTotal, clearCart, updateQty } = useCartStore();

  const store = stores.find((s) => s.id === storeId);
  const products = useMemo(
    () => getProductsForStore(storeId ?? ""),
    [storeId, getProductsForStore]
  );

  const [selectedCategory, setSelectedCategory] = useState("all");
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category))];
    return cats.map(c => PRODUCT_CATEGORIES.find(pc => pc.id === c) || { id: c, label: c, icon: 'package' });
  }, [products]);

  const filtered = useMemo(() => {
    if (selectedCategory === "all") return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const handleAddToCart = (product: Product) => {
    if (product.currentStock <= 0) {
      Alert.alert("Out of Stock", `${product.name} is currently out of stock`);
      return;
    }
    const result = addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.sellingPrice,
        quantity: 1,
        unit: product.unit,
        gstRate: product.gstRate,
        currentStock: product.currentStock,
      },
      storeId ?? "",
      store?.name ?? ""
    );
    if (result === "store_conflict") {
      Alert.alert(
        "Different Store",
        `Your cart has items from "${useCartStore.getState().storeName}". Clear cart?`,
        [
          { text: "No", style: "cancel" },
          { text: "Clear & Add", style: "destructive", onPress: () => {
            clearCart();
            addItem({
                productId: product.id,
                name: product.name,
                price: product.sellingPrice,
                quantity: 1,
                unit: product.unit,
                gstRate: product.gstRate,
                currentStock: product.currentStock,
              }, storeId ?? "", store?.name ?? "");
          }},
        ]
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getCartQty = (productId: string) =>
    items.find((i) => i.productId === productId)?.quantity ?? 0;

  if (!store) return <EmptyState icon="home" title="Store not found" />;

  return (
    <View style={[styles.container, { backgroundColor: colors.gray100 }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Dynamic Hero Header */}
      <View style={[styles.heroSection, { paddingTop: insets.top + 10 }]}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.heroGlow, { backgroundColor: colors.success + '40' }]} />
        
        <View style={styles.heroTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
            <Feather name="chevron-left" size={26} color="#fff" />
          </TouchableOpacity>
          <View style={styles.storeLogoBox}>
            <GlassCard intensity={40} borderRadius={20} style={styles.logoGlass}>
               <BrandLogo size={40} />
            </GlassCard>
          </View>
        </View>

        <Animated.View entering={FadeInDown.delay(100)} style={styles.heroInfo}>
           <Text style={styles.storeName}>{store.name}</Text>
           <View style={styles.locationRow}>
              <Feather name="map-pin" size={12} color="rgba(255,255,255,0.7)" />
              <Text style={styles.storeAddr}>{store.address}</Text>
           </View>
           <View style={styles.storeMeta}>
             <View style={styles.metaBadge}>
                <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                <Text style={styles.metaBadgeText}>{ (store.rating || 0).toFixed(1) }</Text>
             </View>
             <View style={styles.metaBadge}>
                <Feather name="clock" size={13} color="#fff" />
                <Text style={styles.metaBadgeText}>{store.openTime} - {store.closeTime}</Text>
             </View>
             <LinearGradient
                colors={store.isOpen ? [colors.success, '#10B981'] : ['#EF4444', '#B91C1C']}
                style={styles.statusBadge}
             >
                <Text style={styles.statusText}>{store.isOpen ? "OPEN" : "CLOSED"}</Text>
             </LinearGradient>
           </View>
        </Animated.View>
      </View>

      <View style={styles.productsWrapper}>
        <View style={styles.filterSection}>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catRow}>
             <TouchableOpacity
               style={[styles.catChip, selectedCategory === "all" && { backgroundColor: colors.primary, borderColor: colors.primary }]}
               onPress={() => {
                 setSelectedCategory("all");
                 Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
               }}
               activeOpacity={0.8}
             >
               <Text style={[styles.catText, { color: selectedCategory === "all" ? "#fff" : colors.textSecondary }]}>All Items</Text>
             </TouchableOpacity>
             {categories.map((cat) => (
               <TouchableOpacity
                 key={cat.id}
                 style={[styles.catChip, selectedCategory === cat.id && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                 onPress={() => {
                   setSelectedCategory(cat.id);
                   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                 }}
                 activeOpacity={0.8}
               >
                 <MaterialCommunityIcons 
                    name={cat.icon as any} 
                    size={16} 
                    color={selectedCategory === cat.id ? "#fff" : colors.textSecondary} 
                 />
                 <Text style={[styles.catText, { color: selectedCategory === cat.id ? "#fff" : colors.textSecondary }]}>
                   {cat.label}
                 </Text>
               </TouchableOpacity>
             ))}
           </ScrollView>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.productGridRow}
          renderItem={({ item, index }) => {
            const qty = getCartQty(item.id);
            const isOutOfStock = item.currentStock <= 0;
            return (
              <Animated.View 
                entering={ZoomIn.delay(100 + index * 50)}
                style={styles.productCard}
              >
                <GlassCard intensity={8} borderRadius={32} style={styles.glassInner}>
                   <View style={[styles.productIconBox, { backgroundColor: colors.primary + "08" }]}>
                      <MaterialCommunityIcons name="cube-outline" size={42} color={colors.primary} />
                      {isOutOfStock && <View style={styles.stockOverlay}><Text style={styles.stockOverlayText}>OUT</Text></View>}
                   </View>
                   
                   <View style={styles.productInfo}>
                      <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={2}>{item.name}</Text>
                      <View style={styles.priceRow}>
                        <Text style={[styles.productPrice, { color: colors.primary }]}>{formatCurrency(item.sellingPrice)}</Text>
                        <Text style={[styles.productUnit, { color: colors.textPlaceholder }]}>/ {item.unit}</Text>
                      </View>
                   </View>
                   
                   {isOutOfStock ? (
                     <View style={[styles.unavailableBtn, { backgroundColor: colors.gray300 }]}>
                        <Text style={[styles.unavailableText, { color: colors.textPlaceholder }]}>Unavailable</Text>
                     </View>
                   ) : qty > 0 ? (
                     <View style={[styles.qtyControl, { backgroundColor: colors.primary }]}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, qty - 1)}>
                           <Feather name="minus" size={18} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{qty}</Text>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => handleAddToCart(item)}>
                           <Feather name="plus" size={18} color="#fff" />
                        </TouchableOpacity>
                     </View>
                   ) : (
                     <TouchableOpacity 
                        style={[styles.addBtn, { backgroundColor: colors.primary }]} 
                        onPress={() => handleAddToCart(item)}
                        activeOpacity={0.8}
                     >
                        <Feather name="plus" size={18} color="#fff" />
                        <Text style={styles.addBtnText}>ADD</Text>
                     </TouchableOpacity>
                   )}
                </GlassCard>
              </Animated.View>
            );
          }}
          contentContainerStyle={[styles.productList, { paddingBottom: insets.bottom + 140 }]}
          ListEmptyComponent={<EmptyState icon="package" title="No products here" />}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {cartCount > 0 && (
        <Animated.View 
          entering={FadeInUp.springify()}
          style={[styles.cartBarWrapper, { bottom: insets.bottom + 20 }]}
        >
          <TouchableOpacity
            style={styles.cartBar}
            onPress={() => router.push("/(customer)/cart/index" as any)}
            activeOpacity={0.9}
          >
            <LinearGradient
               colors={[colors.secondary, colors.accent]}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 0 }}
               style={styles.cartGradient}
            >
               <View style={styles.cartContent}>
                  <View style={styles.cartLeft}>
                     <View style={styles.cartIconCircle}>
                        <MaterialCommunityIcons name="basket" size={24} color="#fff" />
                        <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount}</Text></View>
                     </View>
                     <View>
                        <Text style={styles.cartCountTitle}>{cartCount} items selected</Text>
                        <Text style={styles.cartTotalText}>{formatCurrency(getTotal())}</Text>
                     </View>
                  </View>
                  <View style={styles.cartRight}>
                     <Text style={styles.viewCartText}>VIEW CART</Text>
                     <View style={styles.arrowCircle}>
                        <Feather name="chevron-right" size={18} color={colors.secondary} />
                     </View>
                  </View>
               </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroSection: {
    padding: 24,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  storeLogoBox: {
    width: 60,
    height: 60,
  },
  logoGlass: {
     flex: 1,
     alignItems: 'center',
     justifyContent: 'center',
  },
  heroInfo: {
     gap: 8,
  },
  storeName: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  storeAddr: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  storeMeta: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 12 },
  metaBadge: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 6,
     backgroundColor: 'rgba(255,255,255,0.15)',
     paddingHorizontal: 10,
     paddingVertical: 6,
     borderRadius: 12,
  },
  metaBadgeText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  statusBadge: {
     paddingHorizontal: 12,
     paddingVertical: 6,
     borderRadius: 12,
  },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  productsWrapper: { flex: 1, marginTop: -24 },
  filterSection: { paddingVertical: 14 },
  catScroll: { maxHeight: 80 },
  catRow: { paddingHorizontal: 20, gap: 10 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    backgroundColor: 'transparent',
    elevation: 2,
  },
  catText: { fontSize: 13, fontWeight: '800' },
  productList: { paddingHorizontal: 16, paddingTop: 4 },
  productGridRow: { justifyContent: 'space-between', marginBottom: 16 },
  productCard: { width: '48.5%' },
  glassInner: { padding: 16, gap: 12, height: 280, justifyContent: 'space-between' },
  productIconBox: {
     width: '100%',
     height: 110,
     borderRadius: 24,
     alignItems: 'center',
     justifyContent: 'center',
     overflow: 'hidden',
  },
  stockOverlay: { backgroundColor: 'rgba(239, 68, 68, 0.8)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, position: 'absolute' },
  stockOverlayText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  productInfo: { gap: 6 },
  productName: { fontSize: 15, fontWeight: '800', lineHeight: 20 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  productPrice: { fontSize: 18, fontWeight: '900' },
  productUnit: { fontSize: 12, fontWeight: '700' },
  addBtn: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     gap: 10,
     height: 44,
     borderRadius: 16,
     elevation: 4,
     shadowColor: '#B46414',
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.15,
     shadowRadius: 12,
  },
  addBtnText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
  unavailableBtn: {
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableText: { fontSize: 13, fontWeight: '800' },
  qtyControl: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'space-between',
     height: 44,
     borderRadius: 16,
     paddingHorizontal: 8,
     elevation: 4,
  },
  qtyBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  qtyText: { color: '#fff', fontSize: 17, fontWeight: '900' },
  cartBarWrapper: {
     position: 'absolute',
     left: 16,
     right: 16,
     zIndex: 100,
  },
  cartBar: {
     borderRadius: 28,
     overflow: 'hidden',
  },
  cartGradient: { padding: 18 },
  cartContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  cartIconCircle: {
     width: 52,
     height: 52,
     borderRadius: 20,
     backgroundColor: 'rgba(255,255,255,0.2)',
     alignItems: 'center',
     justifyContent: 'center',
  },
  cartBadge: {
     position: 'absolute',
     top: -6,
     right: -6,
     backgroundColor: colors.primary,
     borderRadius: 12,
     paddingHorizontal: 6,
     paddingVertical: 2,
     borderWidth: 2,
     borderColor: '#6366F1',
  },
  cartBadgeText: { color: '#6366F1', fontSize: 10, fontWeight: '900' },
  cartCountTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  cartTotalText: { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: -2 },
  cartRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  viewCartText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
  arrowCircle: {
     width: 32,
     height: 32,
     borderRadius: 16,
     backgroundColor: colors.primary,
     alignItems: 'center',
     justifyContent: 'center',
  },
});
