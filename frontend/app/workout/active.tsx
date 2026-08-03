import { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { Colors, Spacing, Radius, Fonts } from "@/src/theme";
import { api } from "@/src/api/client";

type Ex = { id: string; name: string; group: string; sets: number; reps: number; weight_kg: number };
type SetState = { reps: string; weight: string; done: boolean };

function fmtTime(s: number) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function ActiveWorkout() {
  const router = useRouter();
  const { day } = useLocalSearchParams<{ day?: string }>();
  const [exercises, setExercises] = useState<Ex[]>([]);
  const [sets, setSets] = useState<Record<string, SetState[]>>({});
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(Date.now());
  const [restTimer, setRestTimer] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const p = await api<any>("/plan/current");
        const d = p.days.find((x: any) => x.day === Number(day || 1)) || p.days[0];
        setExercises(d.exercises);
        const initial: Record<string, SetState[]> = {};
        d.exercises.forEach((e: Ex) => {
          initial[e.id] = Array.from({ length: e.sets }, () => ({
            reps: String(e.reps),
            weight: String(e.weight_kg),
            done: false,
          }));
        });
        setSets(initial);
      } catch {}
    })();
  }, [day]);

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (restTimer === null) return;
    if (restTimer <= 0) { setRestTimer(null); return; }
    const t = setTimeout(() => setRestTimer((r) => (r || 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [restTimer]);

  const toggleSet = (exId: string, idx: number) => {
    setSets((s) => {
      const arr = [...(s[exId] || [])];
      arr[idx] = { ...arr[idx], done: !arr[idx].done };
      return { ...s, [exId]: arr };
    });
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    setRestTimer(60);
  };

  const updateSet = (exId: string, idx: number, field: "reps" | "weight", value: string) => {
    setSets((s) => {
      const arr = [...(s[exId] || [])];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...s, [exId]: arr };
    });
  };

  const finish = async () => {
    let totalVol = 0, totalReps = 0, doneCount = 0;
    Object.entries(sets).forEach(([, list]) => {
      const anyDone = list.some((s) => s.done);
      if (anyDone) doneCount++;
      list.forEach((s) => {
        if (s.done) {
          totalReps += Number(s.reps) || 0;
          totalVol += (Number(s.reps) || 0) * (Number(s.weight) || 0);
        }
      });
    });
    try {
      await api("/workouts/log", {
        method: "POST",
        body: JSON.stringify({
          plan_day: Number(day || 1),
          duration_seconds: elapsed,
          total_volume_kg: totalVol,
          total_reps: totalReps,
          calories: Math.round(elapsed / 3),
          exercises_completed: doneCount,
          prs: [],
        }),
      });
    } catch {}
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    router.replace({
      pathname: "/workout/complete",
      params: { duration: String(elapsed), volume: String(totalVol), reps: String(totalReps), count: String(doneCount) },
    });
  };

  const totalVolume = Object.values(sets).flat().filter((s) => s.done).reduce((sum, s) => sum + (Number(s.reps) || 0) * (Number(s.weight) || 0), 0);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }} testID="active-workout-screen">
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={16} testID="workout-close">
          <Ionicons name="close" size={26} color={Colors.onSurface} />
        </Pressable>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.headerLabel}>DIA {day || 1}</Text>
          <Text style={styles.timer}>{fmtTime(elapsed)}</Text>
        </View>
        <View style={{ width: 26 }} />
      </SafeAreaView>

      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <Text style={styles.statVal}>{Math.round(elapsed / 3)}</Text>
          <Text style={styles.statLbl}>KCAL</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statVal}>{Math.round(totalVolume)}</Text>
          <Text style={styles.statLbl}>KG TOTAL</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {exercises.map((e, ei) => (
          <View key={e.id} style={styles.exCard}>
            <Text style={styles.exTitle}>{ei + 1}. {e.name}</Text>
            <Text style={styles.exSub}>{e.group} · {e.weight_kg > 0 ? `${e.weight_kg}kg sugerido` : "peso corporal"}</Text>

            <View style={styles.setsHeader}>
              <Text style={[styles.colH, { flex: 0.5 }]}>SET</Text>
              <Text style={[styles.colH, { flex: 1 }]}>REPS</Text>
              <Text style={[styles.colH, { flex: 1 }]}>PESO (KG)</Text>
              <View style={{ width: 36 }} />
            </View>
            {(sets[e.id] || []).map((s, i) => (
              <View key={i} style={styles.setRow}>
                <Text style={[styles.setCol, { flex: 0.5 }]}>{i + 1}</Text>
                <TextInput value={s.reps} onChangeText={(v) => updateSet(e.id, i, "reps", v)} keyboardType="numeric" style={[styles.setInput, { flex: 1 }]} testID={`reps-${e.id}-${i}`} />
                <TextInput value={s.weight} onChangeText={(v) => updateSet(e.id, i, "weight", v)} keyboardType="numeric" style={[styles.setInput, { flex: 1 }]} testID={`weight-${e.id}-${i}`} />
                <Pressable onPress={() => toggleSet(e.id, i)} style={[styles.check, s.done && styles.checkDone]} testID={`check-${e.id}-${i}`}>
                  {s.done && <Ionicons name="checkmark" size={16} color={Colors.onBrand} />}
                </Pressable>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {restTimer !== null && restTimer > 0 && (
        <View style={styles.restOverlay}>
          <Text style={styles.restLabel}>DESCANSO</Text>
          <Text style={styles.restTimer}>{fmtTime(restTimer)}</Text>
          <Text style={styles.restTip}>💡 Mantenha o abdômen contraído entre séries</Text>
          <Pressable onPress={() => setRestTimer(null)} style={styles.restSkip} testID="rest-skip">
            <Text style={styles.restSkipText}>Pular descanso</Text>
          </Pressable>
        </View>
      )}

      <SafeAreaView edges={["bottom"]} style={styles.footer}>
        <Pressable style={styles.finishBtn} onPress={finish} testID="finish-workout-btn">
          <Text style={styles.finishText}>FINALIZAR TREINO</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  headerLabel: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1 },
  timer: { color: Colors.brand, fontFamily: Fonts.display, fontSize: 42, marginTop: -2 },
  statsBar: { flexDirection: "row", paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: Spacing.md },
  stat: { flex: 1, backgroundColor: Colors.surfaceSecondary, padding: Spacing.md, borderRadius: Radius.md, alignItems: "center", borderWidth: 1, borderColor: Colors.border },
  statVal: { color: Colors.onSurface, fontFamily: Fonts.display, fontSize: 26 },
  statLbl: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.medium, fontSize: 10, letterSpacing: 1 },
  body: { padding: Spacing.lg, paddingBottom: 120 },
  exCard: { backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md },
  exTitle: { color: Colors.onSurface, fontFamily: Fonts.bold, fontSize: 15 },
  exSub: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.medium, fontSize: 12, marginTop: 2, marginBottom: Spacing.md },
  setsHeader: { flexDirection: "row", alignItems: "center", paddingBottom: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, gap: Spacing.sm },
  colH: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.bold, fontSize: 10, letterSpacing: 0.8 },
  setRow: { flexDirection: "row", alignItems: "center", paddingVertical: Spacing.sm, gap: Spacing.sm },
  setCol: { color: Colors.onSurface, fontFamily: Fonts.bold, fontSize: 14 },
  setInput: { color: Colors.onSurface, fontFamily: Fonts.bold, fontSize: 15, backgroundColor: Colors.surfaceTertiary, borderRadius: Radius.sm, paddingVertical: 8, paddingHorizontal: 10, textAlign: "center" },
  check: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: Colors.borderStrong, alignItems: "center", justifyContent: "center" },
  checkDone: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  restOverlay: { position: "absolute", left: 16, right: 16, bottom: 100, backgroundColor: Colors.surfaceSecondary, padding: Spacing.lg, borderRadius: Radius.lg, borderWidth: 2, borderColor: Colors.brand, alignItems: "center", gap: 6 },
  restLabel: { color: Colors.brand, fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.5 },
  restTimer: { color: Colors.onSurface, fontFamily: Fonts.display, fontSize: 44 },
  restTip: { color: Colors.onSurfaceSecondary, fontFamily: Fonts.medium, fontSize: 12, textAlign: "center" },
  restSkip: { marginTop: 4 },
  restSkipText: { color: Colors.brand, fontFamily: Fonts.bold, fontSize: 13, textDecorationLine: "underline" },
  footer: { padding: Spacing.lg, paddingTop: Spacing.md, backgroundColor: Colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border },
  finishBtn: { backgroundColor: Colors.brand, paddingVertical: 18, borderRadius: Radius.pill, alignItems: "center" },
  finishText: { color: Colors.onBrand, fontFamily: Fonts.extrabold, fontSize: 15, letterSpacing: 1 },
});
