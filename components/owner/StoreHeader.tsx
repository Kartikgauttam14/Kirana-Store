import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp, SlideInDown } from "react-native-reanimated";

import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { useAuthStore } from "@/store/authStore";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { GlassCard } from "@/components/ui/GlassCard";
import { supabase } from "@/lib/supabase";

export function StoreHeader() {
  const colors = useColors();
  const router = useRouter();
  const { stores, activeStore, setActiveStore } = useData();
  const insets = useSafeAreaInsets();
  const [showSwitcher, setShowSwitcher] = useState(false);

  const handleLogout = async () => {
    const doLogout = async () => {
      await supabase.auth.signOut().catch(() => {});
      useAuthStore.getState().logout();
    };

    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to exit?")) {
        doLogout();
      }
    } else {
      Alert.alert("Logout", "Are you sure you want to exit?", [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: doLogout }
      ]);
    }
  };

  return (
    <>
      <BlurView
        intensity={60}
        tint="light"
        style={[
          styles.header,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 12 : 8),
            backgroundColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            elevation: 8,
            shadowColor: '#B46414',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.1,
            shadowRadius: 24,
          },
        ]}
      >
        <View style={styles.left}>
          <LinearGradient
            colors={[colors.primary, '#10B981CC']}
            style={styles.logoCircle}
          >
            <BrandLogo size={22} />
          </LinearGradient>
          <View>
            <Text style={[styles.appName, { color: colors.textPrimary }]}>Kirana<Text style={{color: colors.primary}}>AI</Text></Text>
            <View style={styles.taglineRow}>
               <MaterialCommunityIcons name="creation" size={10} color={colors.primary} />
               <Text style={[styles.tagline, { color: colors.textSecondary }]}>Owner Prime</Text>
            </View>
          </View>
        </View>

        <View style={styles.right}>
          <TouchableOpacity
            style={[styles.storePicker, { backgroundColor: colors.gray100 }]}
            onPress={() => setShowSwitcher(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.statusDot, { backgroundColor: activeStore?.isOpen ? colors.success : colors.danger }]} />
            <Text style={[styles.storeName, { color: colors.textPrimary }]} numberOfLines={1}>
              {activeStore?.name ?? "Select Store"}
            </Text>
            <Feather name="chevron-down" size={12} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: colors.danger + "10" }]}
            onPress={handleLogout}
          >
            <MaterialCommunityIcons name="logout-variant" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </BlurView>

      <Modal visible={showSwitcher} transparent animationType="none">
        <View style={styles.overlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setShowSwitcher(false)}
          >
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          </TouchableOpacity>

          <Animated.View entering={SlideInDown} style={styles.sheetContainer}>
             <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + 24 }]}>
               <View style={[styles.handle, { backgroundColor: colors.gray300 }]} />
               <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>Switch Business Account</Text>
               <Text style={[styles.sheetSub, { color: colors.textSecondary }]}>Select the store you want to manage right now</Text>
               
               <View style={styles.storeList}>
                 {stores.map((store) => {
                   const isActive = activeStore?.id === store.id;
                   return (
                     <TouchableOpacity
                       key={store.id}
                       onPress={() => {
                         setActiveStore(store);
                         setShowSwitcher(false);
                       }}
                       activeOpacity={0.8}
                     >
                       <GlassCard 
                         intensity={isActive ? 25 : 8} 
                         borderRadius={24} 
                         style={[
                           styles.storeRow,
                           isActive && { borderColor: colors.primary, borderWidth: 2 }
                         ]}
                       >
                         <LinearGradient
                           colors={isActive ? [colors.primary, colors.success] : [colors.gray300, colors.gray100]}
                           style={styles.storeIcon}
                         >
                           <MaterialCommunityIcons 
                              name="storefront-outline" 
                              size={22} 
                              color={isActive ? "#fff" : colors.textSecondary} 
                           />
                         </LinearGradient>
                         <View style={styles.storeInfo}>
                           <Text style={[styles.storeRowName, { color: colors.textPrimary }]}>{store.name}</Text>
                           <Text style={[styles.storeAddress, { color: colors.textSecondary }]}>{store.city} • {store.isOpen ? "Open" : "Closed"}</Text>
                         </View>
                         {isActive && (
                           <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                             <Feather name="check" size={14} color="#fff" />
                           </View>
                         )}
                       </GlassCard>
                     </TouchableOpacity>
                   );
                 })}
                 
                 <TouchableOpacity 
                   style={[styles.addStoreBtn, { borderColor: colors.primary + '40' }]}
                   onPress={() => { setShowSwitcher(false); router.push("/(owner)/stores/add-store" as any); }}
                 >
                    <Feather name="plus" size={18} color={colors.primary} />
                    <Text style={[styles.addStoreText, { color: colors.primary }]}>Register New Store</Text>
                 </TouchableOpacity>
               </View>
             </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 100,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 14 },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  appName: { fontSize: 22, fontWeight: "900", letterSpacing: -0.8 },
  taglineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: -2 },
  tagline: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5, textTransform: "uppercase" },
  right: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  storePicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    maxWidth: 180,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  storeName: { fontSize: 13, fontWeight: "800", flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetContainer: {
     width: '100%',
  },
  sheet: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 24,
    gap: 16,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  handle: {
    width: 48,
    height: 6,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 8,
  },
  sheetTitle: { fontSize: 24, fontWeight: "900", textAlign: "center", letterSpacing: -0.5 },
  sheetSub: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: 12 },
  storeList: { gap: 12 },
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
  },
  storeIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  storeInfo: { flex: 1, gap: 2 },
  storeRowName: { fontSize: 17, fontWeight: "800" },
  storeAddress: { fontSize: 13, fontWeight: '600' },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  addStoreBtn: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     gap: 10,
     padding: 18,
     borderRadius: 20,
     borderWidth: 2,
     borderStyle: 'dashed',
     marginTop: 8,
  },
  addStoreText: { fontSize: 16, fontWeight: '800' },
});
