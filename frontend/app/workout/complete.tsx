import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors, Spacing, Radius, Fonts } from "@/src/theme";

function fmtTime(s: number) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}min ${sec}s`;
}

export default function Complete() {
  const router = useRouter();
  const { duration, volume, reps, count } = useLocalSearchParams<{ duration: string; volume: string; reps: string; count: string }>();
  const dur = Number(duration || 0);
  const vol = Number(volume || 0);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }} testID="workout-complete-screen">
      <LinearGradient colors={[Colors.brandTint, Colors.surface]} locations={[0, 0.5]} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={{ flex: 1, padding: Spacing.lg, justifyContent: "space-between" }}>
        <View style={styles.top}>
          <View style={styles.icon}>
            <Ionicons name="trophy" size={44} color={Colors.brand} />
          </View>
          <Text style={styles.title}>BOM TRABALHO!</Text>
          <Text style={styles.sub}>Este é seu treino concluído. Compare: você levantou o equivalente a um carro pequeno!</Text>

          <View style={styles.statsGrid}>
            <StatBox label="TEMPO" value={fmtTime(dur)} />
            <StatBox label="PESO TOTAL" value={`${Math.round(vol)}kg`} />
            <StatBox label="REPS" value={String(reps || 0)} />
            <StatBox label="EXERCÍCIOS" value={String(count || 0)} />
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.watermark}>
            <Ionicons name="flash" size={16} color={Colors.brand} />
            <Text style={styles.wmText}>APTIVAFIT</Text>
          </View>

          <View style={styles.shareRow}>
            {[{ i: "share-social", l: "Compartilhar" }, { i: "logo-instagram", l: "Stories" }, { i: "download", l: "Baixar" }, { i: "link", l: "Copiar" }].map((s) => (
              <View key={s.l} style={styles.shareBtn}>
                <Ionicons name={s.i as any} size={20} color={Colors.brand} />
                <Text style={styles.shareText}>{s.l}</Text>
              </View>
            ))}
          </View>

          <Pressable style={styles.primary} onPress={() => router.replace("/(tabs)/progress")} testID="complete-btn">
            <Text style={styles.primaryText}>CONCLUIR</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statVal}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: "center", paddingTop: Spacing.lg },
  icon: { width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.brandTint, borderWidth: 2, borderColor: Colors.brand, alignItems: "center", justifyContent: "center", marginBottom: Spacing.lg },
  title: { color: Colors.onSurface, fontFamily: Fonts.display, fontSize: 40, letterSpacing: 1 },
  sub: { color: Colors.onSurfaceSecondary, fontFamily: Fonts.regular, fontSize: 14, textAlign: "center", marginTop: Spacing.sm, marginBottom: Spacing.xl },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md, width: "100%" },
  statBox: { width: "47%", padding: Spacing.md, backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  statLabel: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.bold, fontSize: 10, letterSpacing: 0.8 },
  statVal: { color: Colors.onSurface, fontFamily: Fonts.display, fontSize: 28, marginTop: 4 },
  footer: { gap: Spacing.md },
  watermark: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center" },
  wmText: { color: Colors.brand, fontFamily: Fonts.extrabold, fontSize: 12, letterSpacing: 2 },
  shareRow: { flexDirection: "row", justifyContent: "space-around", paddingVertical: Spacing.md },
  shareBtn: { alignItems: "center", gap: 4 },
  shareText: { color: Colors.onSurfaceSecondary, fontFamily: Fonts.medium, fontSize: 11 },
  primary: { backgroundColor: Colors.brand, paddingVertical: 18, borderRadius: Radius.pill, alignItems: "center" },
  primaryText: { color: Colors.onBrand, fontFamily: Fonts.extrabold, fontSize: 15, letterSpacing: 1 },
});
