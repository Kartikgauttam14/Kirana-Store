import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { BlurView } from "expo-blur";

import { useAuthStore } from "@/store/authStore";
import { useColors } from "@/hooks/useColors";
import { GlassCard } from "@/components/ui/GlassCard";
import { supabase } from "@/lib/supabase";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const language = useAuthStore((s) => s.language);
  const setLanguage = useAuthStore((s) => s.setLanguage);

  const handleLogout = async () => {
    const doLogout = async () => {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.log("Supabase logout error:", e);
      }
      logout();
    };

    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to logout?")) {
        doLogout();
      }
    } else {
      Alert.alert("Logout", "Are you sure you want to exit from KiranaAI?", [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: doLogout }
      ]);
    }
  };

  const menuItems: Array<{
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    onPress?: () => void;
    color?: string;
  }> = [
    { icon: "map-marker-radius-outline", label: language === 'hi' ? "मेरे पते" : "Saved Addresses", color: colors.secondary, onPress: () => router.push("/(customer)/profile/addresses" as any) },
    { icon: "shopping-outline", label: language === 'hi' ? "मेरे ऑर्डर" : "My Orders", onPress: () => router.push("/(customer)/orders/index" as any), color: colors.primary },
    { icon: "wallet-outline", label: language === 'hi' ? "बटुआ" : "Kirana Wallet", color: '#F59E0B', onPress: () => router.push("/(customer)/profile/wallet" as any) },
    { icon: "gift-outline", label: language === 'hi' ? "रेफ़र करें" : "Refer & Earn", color: '#10B981', onPress: () => router.push("/(customer)/profile/referral" as any) },
    { icon: "shield-check-outline", label: language === 'hi' ? "सुरक्षा" : "Privacy & Safety", color: '#6366F1', onPress: () => router.push("/(customer)/profile/privacy" as any) },
    { icon: "help-circle-outline", label: language === 'hi' ? "सहायता" : "Help Support", color: '#94A3B8', onPress: () => router.push("/(customer)/profile/help" as any) },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Premium Header */}
      <BlurView
        intensity={80}
        tint="dark"
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 20 : 0) }]}
      >
         <View style={styles.headerContent}>
            <View>
              <Text style={[styles.subtitle, { color: colors.primary }]}>
                {language === 'hi' ? "खाता सेटिंग" : "Account Settings"}
              </Text>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                {language === 'hi' ? "मेरी प्रोफाइल" : "My Profile"}
              </Text>
            </View>
            <View style={[styles.logoBtn, { backgroundColor: colors.primary + '10' }]}>
               <BrandLogo size={28} />
            </View>
         </View>
      </BlurView>

      <ScrollView 
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <GlassCard intensity={30} borderRadius={32} style={styles.profileCard}>
            <LinearGradient
               colors={[colors.primary, '#059669']}
               start={{ x:0, y:0 }}
               end={{ x:1, y:1 }}
               style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {user?.name?.slice(0, 1).toUpperCase() ?? "U"}
              </Text>
              <View style={styles.badge}>
                <MaterialCommunityIcons name="check-decagram" size={18} color="#fff" />
              </View>
            </LinearGradient>
            <View style={styles.userInfo}>
               <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name ?? "Guest User"}</Text>
               <View style={styles.phoneRow}>
                 <MaterialCommunityIcons name="phone" size={14} color={colors.textSecondary} />
                 <Text style={[styles.userPhone, { color: colors.textSecondary }]}>+91 {user?.phone ?? "XXXXXXXXXX"}</Text>
               </View>
               <TouchableOpacity 
                 style={[styles.editBtn, { backgroundColor: colors.primary + '15' }]}
                 onPress={() => router.push("/(customer)/profile/edit" as any)}
               >
                  <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 13 }}>Edit Details</Text>
               </TouchableOpacity>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Language Selection */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <GlassCard style={styles.langSection} intensity={12} borderRadius={24}>
            <View style={styles.sectionHeader}>
               <MaterialCommunityIcons name="translate" size={20} color={colors.primary} />
               <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                 {language === "hi" ? "भाषा चुनें" : "Select Language"}
               </Text>
            </View>
            <View style={styles.langRow}>
              <TouchableOpacity
                style={[
                  styles.langBtn,
                  { backgroundColor: language === "en" ? colors.primary : colors.gray100 },
                ]}
                onPress={() => setLanguage("en")}
              >
                <Text style={[styles.langBtnText, { color: language === "en" ? "#fff" : colors.textSecondary }]}>
                  English
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.langBtn,
                  { backgroundColor: language === "hi" ? colors.primary : colors.gray100 },
                ]}
                onPress={() => setLanguage("hi")}
              >
                <Text style={[styles.langBtnText, { color: language === "hi" ? "#fff" : colors.textSecondary }]}>
                  हिंदी
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Menu Items */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <GlassCard style={styles.menu} intensity={20} borderRadius={28}>
            {menuItems.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.menuItem,
                  i < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border + '15' },
                ]}
                onPress={item.onPress}
              >
                <View style={[styles.menuIcon, { backgroundColor: (item.color ?? colors.primary) + '12' }]}>
                  <MaterialCommunityIcons name={item.icon} size={22} color={item.color ?? colors.primary} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                <Feather name="chevron-right" size={20} color={colors.textPlaceholder} />
              </TouchableOpacity>
            ))}
          </GlassCard>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View entering={FadeInUp.delay(500)}>
          <TouchableOpacity
            style={styles.logoutBtnWrapper}
            onPress={handleLogout}
          >
            <LinearGradient
               colors={[colors.danger, '#DC2626']}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 0 }}
               style={styles.logoutBtn}
            >
              <MaterialCommunityIcons name="logout-variant" size={22} color="#fff" />
              <Text style={styles.logoutText}>
                {language === 'hi' ? "लॉग आउट करें" : "Log out from Account"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>KiranaAI v1.3.0 Premium</Text>
            <View style={styles.dot} />
            <Text style={styles.versionText}>Powered by Organic Intelligence</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    zIndex: 10,
    ...Platform.select({
      android: { elevation: 8 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
      }
    })
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  logoBtn: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
  },
  subtitle: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2 },
  title: { fontSize: 28, fontWeight: "900", letterSpacing: -0.8 },
  scroll: { gap: 16, padding: 16, paddingTop: 20 },
  profileCard: {
    padding: 24,
    flexDirection: 'row',
    alignItems: "center",
    gap: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarGradient: {
    width: 90,
    height: 90,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      }
    })
  },
  avatarText: { fontSize: 36, fontWeight: "900", color: "#fff" },
  badge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#10B981',
    padding: 4,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#fff',
  },
  userInfo: { flex:1, gap: 4 },
  userName: { fontSize: 24, fontWeight: "900", letterSpacing: -0.4 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userPhone: { fontSize: 15, fontWeight: '700', opacity: 0.8 },
  editBtn: { 
    marginTop: 10, 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  langSection: {
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 13, fontWeight: "900", textTransform: 'uppercase', letterSpacing: 1 },
  langRow: { flexDirection: "row", gap: 12 },
  langBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: 'center',
    ...Platform.select({
      android: { elevation: 2 },
    })
  },
  langBtnText: { fontWeight: "800", fontSize: 15 },
  menu: {
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 20,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: "800", letterSpacing: -0.2 },
  logoutBtnWrapper: {
     marginTop: 12,
     borderRadius: 24,
     overflow: 'hidden',
     ...Platform.select({
       ios: {
         shadowColor: '#EF4444',
         shadowOffset: { width: 0, height: 10 },
         shadowOpacity: 0.25,
         shadowRadius: 15,
       }
     })
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 22,
  },
  logoutText: { color: "#fff", fontSize: 18, fontWeight: "900", letterSpacing: -0.5 },
  versionContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    marginTop: 24,
    opacity: 0.4
  },
  versionText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#000' },
});

