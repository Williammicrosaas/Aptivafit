import { useRouter } from "expo-router";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, OnboardingHeader, Title, Subtitle, StickyFooter, PrimaryButton } from "@/src/components/OnboardingUI";
import { useOnboarding } from "@/src/context/OnboardingContext";
import { Colors, Spacing, Radius, Fonts } from "@/src/theme";

export default function WeeklyFrequency() {
  const router = useRouter();
  const { state, update } = useOnboarding();
  const days = state.days_per_week ?? 3;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <OnboardingHeader step={14} total={17} />
      <Screen>
        <Title>Quantos dias por semana?</Title>
        <Subtitle>Escolha o compromisso realista. Melhor ir 3x com constância que 6x sem.</Subtitle>

        <View style={styles.stepperRow}>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <Pressable
              key={n}
              onPress={() => update({ days_per_week: n })}
              style={[styles.dayBtn, days === n && styles.dayBtnSel]}
              testID={`days-${n}`}
            >
              <Text style={[styles.dayText, days === n && styles.dayTextSel]}>{n}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.rec}>
          <Ionicons name="bulb" size={20} color={Colors.brand} />
          <Text style={styles.recText}>
            Com base no seu objetivo e nível, recomendamos <Text style={{ color: Colors.brand, fontFamily: Fonts.bold }}>{Math.min(days, 4)} dias</Text> por semana.
          </Text>
        </View>
      </Screen>
      <StickyFooter>
        <PrimaryButton
          title="Próximo"
          onPress={() => router.push("/onboarding/social-proof")}
          testID="days-next"
        />
      </StickyFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  stepperRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginBottom: Spacing.xl },
  dayBtn: {
    width: 48, height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: Colors.border,
  },
  dayBtnSel: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  dayText: { color: Colors.onSurface, fontFamily: Fonts.display, fontSize: 26 },
  dayTextSel: { color: Colors.onBrand },
  rec: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recText: { color: Colors.onSurface, fontFamily: Fonts.regular, fontSize: 14, flex: 1, lineHeight: 20 },
});
