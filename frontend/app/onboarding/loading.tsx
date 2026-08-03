import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Spacing, Radius, Fonts } from "@/src/theme";
import { useOnboarding } from "@/src/context/OnboardingContext";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/api/client";

const STEPS = [
  "+1.050.000 usuários no mundo todo escolheram a Aptivafit",
  "Obtendo seus dados corporais e de perfil...",
  "Analisando seu nível de atividade...",
  "Selecionando exercícios ideais para você...",
  "Distribuindo grupos musculares nos dias da semana...",
  "Finalizando cálculos de progressão...",
];

export default function Loading() {
  const router = useRouter();
  const { state } = useOnboarding();
  const { user } = useAuth();
  const [pct, setPct] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const generate = async () => {
      // Only save & generate if authenticated
      try {
        if (user) {
          await api("/onboarding/save", { method: "POST", body: JSON.stringify(state) });
          await api("/plan/generate", { method: "POST" });
        }
      } catch (e) {
        console.warn("Plan gen error", e);
      }
    };
    void generate();

    // Progress animation over ~4s regardless of API
    const t = setInterval(() => {
      setPct((p) => {
        const next = Math.min(100, p + 3);
        setMsgIdx(Math.min(STEPS.length - 1, Math.floor((next / 100) * STEPS.length)));
        if (next >= 100) {
          clearInterval(t);
          setTimeout(() => router.replace("/onboarding/plan-ready"), 400);
        }
        return next;
      });
    }, 120);
    return () => clearInterval(t);
  }, [router, state, user]);

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <View style={styles.center}>
        <View style={styles.ring}>
          <ActivityIndicator size="large" color={Colors.brand} />
          <Text style={styles.pct}>{pct}%</Text>
        </View>
        <Text style={styles.title}>Montando seu plano</Text>
        <Text style={styles.msg}>{STEPS[msgIdx]}</Text>

        <View style={styles.track}>
          <View style={[styles.trackFill, { width: `${pct}%` }]} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface, padding: Spacing.lg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.lg },
  ring: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 4, borderColor: Colors.brand,
    alignItems: "center", justifyContent: "center",
  },
  pct: { color: Colors.brand, fontFamily: Fonts.display, fontSize: 56, marginTop: 6 },
  title: { color: Colors.onSurface, fontFamily: Fonts.extrabold, fontSize: 24 },
  msg: { color: Colors.onSurfaceSecondary, fontFamily: Fonts.regular, fontSize: 14, textAlign: "center", paddingHorizontal: Spacing.lg, minHeight: 40 },
  track: {
    height: 8, backgroundColor: Colors.surfaceTertiary,
    borderRadius: Radius.pill,
    width: "100%",
    overflow: "hidden",
  },
  trackFill: { height: "100%", backgroundColor: Colors.brand, borderRadius: Radius.pill },
});
