import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Radius, Fonts } from "@/src/theme";
import { api } from "@/src/api/client";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function ProgressTab() {
  const { user, isPremium } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    api<{ items: any[] }>("/workouts/history").then((r) => setHistory(r.items)).catch(() => {});
  }, [user]);

  const today = new Date().getDay();
  const doneDays = new Set(history.map((h) => new Date(h.completed_at).getDay()));

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>PROGRESSO</Text>
        <Text style={styles.sub}>Sua consistência semanal</Text>

        <View style={styles.week}>
          {DAYS.map((d, i) => {
            const done = doneDays.has(i);
            return (
              <View key={d} style={[styles.dayCol, i === today && styles.dayColToday]}>
                <Text style={[styles.dayText, done && { color: Colors.brand }]}>{d}</Text>
                <View style={[styles.dayCircle, done && styles.dayCircleDone]}>
                  {done ? <Ionicons name="checkmark" size={16} color={Colors.onBrand} /> : <Text style={styles.dayNum}>{new Date().getDate() - today + i}</Text>}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.statsRow}>
          <StatCard label="Treinos" value={String(history.length)} icon="barbell" />
          <StatCard label="Sequência" value={`${Math.min(history.length, 7)} dias`} icon="flame" />
        </View>

        <View style={styles.achievementCard}>
          <Ionicons name="trophy" size={28} color={Colors.brand} />
          <View style={{ flex: 1 }}>
            <Text style={styles.achTitle}>Você bateu 3 recordes esta semana</Text>
            <Text style={styles.achSub}>Continue quebrando limites!</Text>
          </View>
        </View>

        <Text style={styles.section}>Distribuição muscular</Text>
        {!isPremium ? (
          <Pressable style={styles.locked} onPress={() => router.push("/paywall")} testID="progress-unlock-btn">
            <Ionicons name="lock-closed" size={24} color={Colors.brand} />
            <View style={{ flex: 1 }}>
              <Text style={styles.lockedTitle}>Desbloqueie seu plano completo</Text>
              <Text style={styles.lockedSub}>Gráficos avançados de músculos alvo e progresso.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.brand} />
          </Pressable>
        ) : (
          <View style={styles.chartCard}>
            <Text style={styles.chartText}>Peito 28% · Costas 24% · Pernas 30% · Ombros 18%</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: any }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={20} color={Colors.brand} />
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  title: { color: Colors.onSurface, fontFamily: Fonts.display, fontSize: 32, letterSpacing: 1 },
  sub: { color: Colors.onSurfaceSecondary, fontFamily: Fonts.regular, fontSize: 14, marginTop: 4, marginBottom: Spacing.lg },
  week: { flexDirection: "row", justifyContent: "space-between", padding: Spacing.md, backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  dayCol: { alignItems: "center", gap: 6, padding: 4, borderRadius: 8 },
  dayColToday: { backgroundColor: Colors.surfaceTertiary },
  dayText: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.semibold, fontSize: 10 },
  dayCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  dayCircleDone: { backgroundColor: Colors.brand },
  dayNum: { color: Colors.onSurfaceSecondary, fontFamily: Fonts.bold, fontSize: 12 },
  statsRow: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.lg },
  stat: { flex: 1, alignItems: "center", padding: Spacing.md, backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.md, gap: 4, borderWidth: 1, borderColor: Colors.border },
  statVal: { color: Colors.onSurface, fontFamily: Fonts.display, fontSize: 28 },
  statLbl: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.medium, fontSize: 11 },
  achievementCard: { flexDirection: "row", alignItems: "center", gap: Spacing.md, padding: Spacing.lg, backgroundColor: Colors.brandTint, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.brand, marginBottom: Spacing.lg },
  achTitle: { color: Colors.onSurface, fontFamily: Fonts.bold, fontSize: 14 },
  achSub: { color: Colors.onSurfaceSecondary, fontFamily: Fonts.medium, fontSize: 12, marginTop: 2 },
  section: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: Spacing.md },
  locked: { flexDirection: "row", alignItems: "center", gap: Spacing.md, padding: Spacing.lg, backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.brand, borderStyle: "dashed" },
  lockedTitle: { color: Colors.onSurface, fontFamily: Fonts.bold, fontSize: 14 },
  lockedSub: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.medium, fontSize: 12, marginTop: 2 },
  chartCard: { padding: Spacing.lg, backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  chartText: { color: Colors.onSurface, fontFamily: Fonts.medium, fontSize: 14 },
});
