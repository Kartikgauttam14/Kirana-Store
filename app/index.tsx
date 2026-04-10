import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeInUp, ZoomIn } from "react-native-reanimated";

import { useAuthStore } from "@/store/authStore";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useColors } from "@/hooks/useColors";

export default function IndexScreen() {
  const router = useRouter();
  const colors = useColors();
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
    }, 2000);
    return () => clearTimeout(timer);
  }, [token, role]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient 
        colors={['#064E3B', '#022C22', '#020617']} 
        style={StyleSheet.absoluteFill} 
      />
      <Animated.View entering={FadeIn.duration(1000)} style={styles.center}>
        <Animated.View entering={ZoomIn.delay(300).duration(800)} style={styles.logoWrapper}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.logoCard}
          >
            <BrandLogo size={80} />
          </LinearGradient>
        </Animated.View>
        
        <View style={styles.textContainer}>
          <Animated.Text entering={FadeInUp.delay(600)} style={styles.appName}>
            Kirana<Text style={{ color: "#10B981" }}>AI</Text>
          </Animated.Text>
          <Animated.Text entering={FadeInUp.delay(800)} style={styles.tagline}>
            Organic Intelligence for Commerce
          </Animated.Text>
        </View>

        <Animated.View entering={FadeIn.delay(1200)} style={styles.footer}>
           <Text style={styles.footerText}>SECURED BY KIRANAAI CLOUD</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  logoWrapper: {
    marginBottom: 32,
    elevation: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  logoCard: {
    width: 130,
    height: 130,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  textContainer: {
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontSize: 48,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -1.5,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "700",
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  footer: {
     position: 'absolute',
     bottom: 50,
  },
  footerText: {
     color: 'rgba(255,255,255,0.3)',
     fontSize: 10,
     fontWeight: '900',
     letterSpacing: 2,
  }
});
