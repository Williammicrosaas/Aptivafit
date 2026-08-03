import { useRouter } from "expo-router";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Screen, OnboardingHeader, Title, Subtitle, StickyFooter, PrimaryButton } from "@/src/components/OnboardingUI";
import { useOnboarding } from "@/src/context/OnboardingContext";
import { Colors, Spacing, Radius, Fonts } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";

const INJURIES = [
  "Sem lesões", "Ombros", "Costas", "Joelhos", "Peito",
  "Quadríceps", "Trapézio", "Abdutores", "Panturrilhas",
  "Bíceps", "Posteriores", "Outros",
];

export default function Injuries() {
  const router = useRouter();
  const { state, update } = useOnboarding();

  const toggle = (item: string) => {
    if (item === "Sem lesões") {
      update({ injuries: state.injuries.includes(item) ? [] : ["Sem lesões"] });
      return;
    }
    let next = state.injuries.filter((i) => i !== "Sem lesões");
    if (next.includes(item)) next = next.filter((i) => i !== item);
    else if (next.length < 3) next = [...next, item];
    update({ injuries: next });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <OnboardingHeader step={6} total={17} onSkip={() => { update({ injuries: [] }); router.push("/onboarding/muscle-focus"); }} />
      <Screen>
        <Title>Alguma lesão ou dor?</Title>
        <Subtitle>Selecione até 3. Adaptamos os exercícios (não substitui avaliação médica).</Subtitle>
        <View style={styles.grid}>
          {INJURIES.map((item) => {
            const sel = state.injuries.includes(item);
            return (
              <Pressable
                key={item}
                onPress={() => toggle(item)}
                style={[styles.chip, sel && styles.chipSel]}
                testID={`injury-${item}`}
              >
                {sel ? <Ionicons name="checkmark" size={14} color={Colors.onBrand} /> : null}
                <Text style={[styles.chipText, sel && styles.chipTextSel]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.onSurfaceTertiary} />
          <Text style={styles.disclaimerText}>
            As adaptações são preventivas e não substituem avaliação médica profissional.
          </Text>
        </View>
      </Screen>
      <StickyFooter>
        <PrimaryButton
          title="Próximo"
          onPress={() => router.push("/onboarding/muscle-focus")}
          testID="injuries-next-btn"
        />
      </StickyFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginBottom: Spacing.xl },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipSel: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  chipText: { color: Colors.onSurface, fontFamily: Fonts.semibold, fontSize: 14 },
  chipTextSel: { color: Colors.onBrand },
  disclaimer: {
    flexDirection: "row",
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md,
  },
  disclaimerText: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.regular, fontSize: 12, flex: 1, lineHeight: 18 },
});
