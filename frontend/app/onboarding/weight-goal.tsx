import { useRouter } from "expo-router";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, OnboardingHeader, Title, Subtitle, StickyFooter, PrimaryButton } from "@/src/components/OnboardingUI";
import { useOnboarding } from "@/src/context/OnboardingContext";
import { Colors, Spacing, Radius, Fonts } from "@/src/theme";

export default function WeightGoal() {
  const router = useRouter();
  const { state, update } = useOnboarding();

  const current = state.weight_kg || 75;
  const target = state.target_weight_kg ?? current - 3;
  const diff = target - current;
  const pct = current > 0 ? Math.abs(diff / current) * 100 : 0;

  const label =
    Math.abs(diff) < 0.5
      ? `Você vai manter seu peso`
      : diff < 0
      ? `Você vai perder ${pct.toFixed(1)}% do peso`
      : `Você vai ganhar ${pct.toFixed(1)}% do peso`;

  const nudge = (v: number) => update({ target_weight_kg: Math.max(40, Math.min(200, (state.target_weight_kg ?? current) + v)) });

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <OnboardingHeader step={10} total={17} />
      <Screen>
        <Title>Sua meta de peso</Title>
        <Subtitle>Você pode ajustar isso a qualquer momento.</Subtitle>

        <View style={styles.card}>
          <Text style={styles.label}>PESO ATUAL</Text>
          <Text style={styles.value}>{current.toFixed(0)} <Text style={styles.unit}>kg</Text></Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>META</Text>
          <View style={styles.stepperRow}>
            <Pressable style={styles.stepBtn} onPress={() => nudge(-1)} testID="target-minus">
              <Ionicons name="remove" size={22} color={Colors.brand} />
            </Pressable>
            <Text style={styles.value}>{target.toFixed(0)} <Text style={styles.unit}>kg</Text></Text>
            <Pressable style={styles.stepBtn} onPress={() => nudge(1)} testID="target-plus">
              <Ionicons name="add" size={22} color={Colors.brand} />
            </Pressable>
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoText}>{label}</Text>
        </View>
      </Screen>
      <StickyFooter>
        <PrimaryButton title="Próximo" onPress={() => router.push("/onboarding/projection")} testID="weight-goal-next" />
      </StickyFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.semibold, fontSize: 11, letterSpacing: 1 },
  value: { color: Colors.onSurface, fontFamily: Fonts.display, fontSize: 48 },
  unit: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.display, fontSize: 20 },
  stepperRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 },
  stepBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.surfaceTertiary,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: Colors.borderStrong,
  },
  info: {
    padding: Spacing.md,
    backgroundColor: Colors.brandTint,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.brand,
    marginTop: Spacing.sm,
  },
  infoText: { color: Colors.brand, fontFamily: Fonts.bold, fontSize: 14, textAlign: "center" },
});
