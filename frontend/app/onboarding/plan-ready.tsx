import { useRouter } from "expo-router";
import { View, Text, StyleSheet, ScrollView, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "@/src/components/OnboardingUI";
import { Colors, Spacing, Radius, Fonts } from "@/src/theme";
import { useOnboarding } from "@/src/context/OnboardingContext";

export default function PlanReady() {
  const router = useRouter();
  const { state } = useOnboarding();
  const days = state.days_per_week ?? 3;
  const dur = { rapido: 20, curto: 35, medio: 50, longo: 75 }[state.duration_pref || "medio"];
  const kcal = { rapido: 180, curto: 320, medio: 480, longo: 700 }[state.duration_pref || "medio"];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }} testID="plan-ready-screen">
      <ImageBackground
        source={{ uri: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1080&q=80" }}
        style={{ height: 220 }}
        imageStyle={{ opacity: 0.5 }}
      >
        <LinearGradient
          colors={["transparent", Colors.surface]}
          locations={[0.4, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView edges={["top"]} style={{ padding: Spacing.lg }}>
          <View style={styles.badge}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.brand} />
            <Text style={styles.badgeText}>PLANO PRONTO</Text>
          </View>
          <Text style={styles.headline}>SEU PLANO{"\n"}PERSONALIZADO</Text>
        </SafeAreaView>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stats}>
          <Stat label="Dias/semana" value={`${days}`} />
          <Stat label="Duração" value={`${dur}min`} />
          <Stat label="Calorias" value={`${kcal}`} />
        </View>

        <Text style={styles.section}>Prévia — Dia 1</Text>
        <View style={styles.preview}>
          <ExerciseRow name="Supino Reto com Barra" info="4 x 10 · 24kg" />
          <ExerciseRow name="Puxada Frontal" info="4 x 10 · 26kg" />
          <View style={styles.blurBox}>
            <LinearGradient
              colors={["rgba(9,12,18,0)", Colors.surface]}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.lockRow}>
              <Ionicons name="lock-closed" size={18} color={Colors.brand} />
              <Text style={styles.lockText}>+ 5 exercícios · desbloqueie seu plano completo</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={["bottom"]} style={styles.footer}>
        <PrimaryButton title="Continuar" onPress={() => router.push("/paywall")} testID="plan-continue-btn" />
      </SafeAreaView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ExerciseRow({ name, info }: { name: string; info: string }) {
  return (
    <View style={styles.exRow}>
      <View style={styles.exIcon}>
        <Ionicons name="barbell" size={18} color={Colors.brand} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.exName}>{name}</Text>
        <Text style={styles.exInfo}>{info}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.brandTint,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: Colors.brand,
  },
  badgeText: { color: Colors.brand, fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1 },
  headline: { color: Colors.onSurface, fontFamily: Fonts.display, fontSize: 40, lineHeight: 42, marginTop: Spacing.md, letterSpacing: 1 },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  stats: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.xl },
  stat: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  statValue: { color: Colors.brand, fontFamily: Fonts.display, fontSize: 26 },
  statLabel: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.medium, fontSize: 11 },
  section: { color: Colors.onSurface, fontFamily: Fonts.bold, fontSize: 16, marginBottom: Spacing.md },
  preview: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    position: "relative",
  },
  exRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  exIcon: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: Colors.brandTint,
    alignItems: "center", justifyContent: "center",
  },
  exName: { color: Colors.onSurface, fontFamily: Fonts.bold, fontSize: 14 },
  exInfo: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.medium, fontSize: 12 },
  blurBox: { padding: Spacing.lg, opacity: 0.6 },
  lockRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, justifyContent: "center" },
  lockText: { color: Colors.brand, fontFamily: Fonts.semibold, fontSize: 13 },
  footer: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
});
