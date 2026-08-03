import { useRouter } from "expo-router";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Screen, OnboardingHeader, Title, Subtitle, StickyFooter, PrimaryButton } from "@/src/components/OnboardingUI";
import { useOnboarding } from "@/src/context/OnboardingContext";
import { Colors, Spacing, Radius, Fonts } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";

const MUSCLES = [
  { key: "Corpo Inteiro", icon: "body" },
  { key: "Ombros", icon: "resize" },
  { key: "Braços", icon: "barbell" },
  { key: "Peito", icon: "shield" },
  { key: "Abdômen", icon: "grid" },
  { key: "Costas", icon: "swap-vertical" },
  { key: "Glúteos", icon: "ellipse" },
  { key: "Pernas", icon: "walk" },
];

export default function MuscleFocus() {
  const router = useRouter();
  const { state, update } = useOnboarding();

  const toggle = (item: string) => {
    let next = [...state.muscle_focus];
    if (item === "Corpo Inteiro") {
      next = state.muscle_focus.includes(item) ? [] : ["Corpo Inteiro"];
    } else {
      next = next.filter((i) => i !== "Corpo Inteiro");
      if (next.includes(item)) next = next.filter((i) => i !== item);
      else next = [...next, item];
    }
    update({ muscle_focus: next });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <OnboardingHeader step={7} total={17} />
      <Screen>
        <Title>Foco muscular</Title>
        <Subtitle>Escolha um ou mais grupos que quer priorizar.</Subtitle>
        <View style={styles.grid}>
          {MUSCLES.map((m) => {
            const sel = state.muscle_focus.includes(m.key);
            return (
              <Pressable
                key={m.key}
                onPress={() => toggle(m.key)}
                style={[styles.card, sel && styles.cardSel]}
                testID={`focus-${m.key}`}
              >
                <Ionicons name={m.icon as any} size={26} color={sel ? Colors.brand : Colors.onSurfaceTertiary} />
                <Text style={[styles.label, sel && { color: Colors.brand }]}>{m.key}</Text>
              </Pressable>
            );
          })}
        </View>
      </Screen>
      <StickyFooter>
        <PrimaryButton
          title="Próximo"
          disabled={state.muscle_focus.length === 0}
          onPress={() => router.push("/onboarding/health-connect")}
          testID="focus-next-btn"
        />
      </StickyFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md, marginBottom: Spacing.xl },
  card: {
    width: "47%",
    aspectRatio: 1.4,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  cardSel: { borderColor: Colors.brand, backgroundColor: Colors.brandTint },
  label: { color: Colors.onSurface, fontFamily: Fonts.bold, fontSize: 14 },
});
