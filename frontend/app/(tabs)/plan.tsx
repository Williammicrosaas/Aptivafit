import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Spacing, Radius, Fonts } from "@/src/theme";
import { api } from "@/src/api/client";
import { useAuth } from "@/src/context/AuthContext";

type Exercise = { id: string; name: string; group: string; sets: number; reps: number; weight_kg: number };
type Day = { day: number; label: string; focus: string[]; duration_min: number; calories: number; exercises: Exercise[] };
type Plan = { plan_id: string; days: Day[]; days_per_week: number; coach_message?: string };

export default function PlanTab() {
  const router = useRouter();
  const { user, isPremium } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);

  const load = async () => {
    if (!user) { setLoading(false); return; }
    try {
      const p = await api<Plan>("/plan/current");
      setPlan(p);
    } catch { setPlan(null); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  if (loading) return (
    <SafeAreaView style={styles.root}><ActivityIndicator style={{ flex: 1 }} color={Colors.brand} /></SafeAreaView>
  );

  if (!user) return (
    <SafeAreaView style={styles.root}>
      <View style={styles.empty}>
        <Ionicons name="lock-closed" size={48} color={Colors.brand} />
        <Text style={styles.emptyTitle}>Entre para ver seu plano</Text>
        <Pressable onPress={() => router.push("/auth/login")} style={styles.btn} testID="plan-login-btn">
          <Text style={styles.btnText}>Fazer login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );

  if (!plan) return (
    <SafeAreaView style={styles.root}>
      <View style={styles.empty}>
        <Ionicons name="fitness-outline" size={48} color={Colors.onSurfaceTertiary} />
        <Text style={styles.emptyTitle}>Nenhum plano gerado</Text>
        <Pressable onPress={() => router.push("/onboarding/gender")} style={styles.btn} testID="plan-gen-btn">
          <Text style={styles.btnText}>Fazer quiz</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );

  const current = plan.days.find((d) => d.day === activeDay) || plan.days[0];

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>Olá{user.name ? `, ${user.name.split(" ")[0]}` : ""}</Text>
            <Text style={styles.brandName}>MEU PLANO</Text>
          </View>
          {!isPremium && (
            <Pressable style={styles.proBadge} onPress={() => router.push("/paywall")}>
              <Ionicons name="diamond" size={14} color={Colors.onBrand} />
              <Text style={styles.proText}>PRO</Text>
            </Pressable>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysRow}>
          {plan.days.map((d) => (
            <Pressable
              key={d.day}
              onPress={() => setActiveDay(d.day)}
              style={[styles.dayTab, activeDay === d.day && styles.dayTabSel]}
              testID={`day-tab-${d.day}`}
            >
              <Text style={[styles.dayLabel, activeDay === d.day && styles.dayLabelSel]}>DIA {d.day}</Text>
              <Text style={[styles.daySub, activeDay === d.day && styles.daySubSel]} numberOfLines={1}>{d.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={Colors.brand} />}
      >
        {plan.coach_message && (
          <View style={styles.coach}>
            <Ionicons name="sparkles" size={16} color={Colors.brand} />
            <Text style={styles.coachText}>{plan.coach_message}</Text>
          </View>
        )}

        <View style={styles.configCard}>
          <View style={styles.configRow}>
            <Ionicons name="time" size={18} color={Colors.brand} />
            <Text style={styles.configText}>{current.duration_min} min</Text>
          </View>
          <View style={styles.configDot} />
          <View style={styles.configRow}>
            <Ionicons name="flame" size={18} color={Colors.brand} />
            <Text style={styles.configText}>{current.calories} kcal</Text>
          </View>
          <View style={styles.configDot} />
          <View style={styles.configRow}>
            <Ionicons name="body" size={18} color={Colors.brand} />
            <Text style={styles.configText}>{current.exercises.length} ex.</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Músculos trabalhados</Text>
        <View style={styles.muscleRow}>
          {current.focus.map((f) => (
            <View key={f} style={styles.muscleChip}>
              <Text style={styles.muscleText}>{f}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Exercícios</Text>
        {current.exercises.map((e, i) => (
          <View key={e.id} style={styles.exCard}>
            <View style={styles.exIcon}>
              <Ionicons name="barbell" size={20} color={Colors.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.exName}>{i + 1}. {e.name}</Text>
              <Text style={styles.exInfo}>
                {e.sets} séries × {e.reps} reps · {e.weight_kg > 0 ? `${e.weight_kg}kg` : "peso corporal"}
              </Text>
            </View>
            <Ionicons name="reorder-three" size={22} color={Colors.onSurfaceTertiary} />
          </View>
        ))}
      </ScrollView>

      <SafeAreaView edges={["bottom"]} style={styles.footer}>
        <Pressable
          style={styles.startBtn}
          onPress={() => router.push({ pathname: "/workout/active", params: { day: String(activeDay) } })}
          testID="start-workout-btn"
        >
          <Ionicons name="play" size={20} color={Colors.onBrand} />
          <Text style={styles.startBtnText}>INICIAR TREINO</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  hello: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.medium, fontSize: 13 },
  brandName: { color: Colors.onSurface, fontFamily: Fonts.display, fontSize: 32, letterSpacing: 1 },
  proBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.brand,
    paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.pill,
  },
  proText: { color: Colors.onBrand, fontFamily: Fonts.extrabold, fontSize: 11, letterSpacing: 1 },
  daysRow: { gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  dayTab: {
    minWidth: 90,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  dayTabSel: { borderColor: Colors.brand, backgroundColor: Colors.brandTint },
  dayLabel: { color: Colors.onSurfaceSecondary, fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1 },
  dayLabelSel: { color: Colors.brand },
  daySub: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.medium, fontSize: 11, marginTop: 2 },
  daySubSel: { color: Colors.onSurface },
  body: { padding: Spacing.lg, paddingBottom: 120 },
  coach: {
    flexDirection: "row", gap: Spacing.sm, padding: Spacing.md,
    backgroundColor: Colors.brandTint,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.brand,
    marginBottom: Spacing.lg,
  },
  coachText: { color: Colors.onSurface, fontFamily: Fonts.medium, fontSize: 13, flex: 1, lineHeight: 18 },
  configCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: Spacing.md,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  configRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  configText: { color: Colors.onSurface, fontFamily: Fonts.bold, fontSize: 13 },
  configDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.borderStrong, alignSelf: "center" },
  sectionLabel: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1, marginBottom: Spacing.md, textTransform: "uppercase" },
  muscleRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginBottom: Spacing.xl },
  muscleChip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: Colors.surfaceTertiary },
  muscleText: { color: Colors.onSurface, fontFamily: Fonts.semibold, fontSize: 12 },
  exCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  exIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: Colors.brandTint, alignItems: "center", justifyContent: "center" },
  exName: { color: Colors.onSurface, fontFamily: Fonts.bold, fontSize: 14 },
  exInfo: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.medium, fontSize: 12, marginTop: 2 },
  footer: { padding: Spacing.lg, paddingTop: Spacing.md, backgroundColor: Colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border },
  startBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, backgroundColor: Colors.brand, paddingVertical: 18, borderRadius: Radius.pill },
  startBtnText: { color: Colors.onBrand, fontFamily: Fonts.extrabold, fontSize: 15, letterSpacing: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.lg, padding: Spacing.xxl },
  emptyTitle: { color: Colors.onSurface, fontFamily: Fonts.bold, fontSize: 18, textAlign: "center" },
  btn: { paddingHorizontal: Spacing.xl, paddingVertical: 14, backgroundColor: Colors.brand, borderRadius: Radius.pill },
  btnText: { color: Colors.onBrand, fontFamily: Fonts.extrabold, fontSize: 14, letterSpacing: 1 },
});
