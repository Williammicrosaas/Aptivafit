import { useRouter } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, OnboardingHeader, Title, StickyFooter, PrimaryButton } from "@/src/components/OnboardingUI";
import { useOnboarding } from "@/src/context/OnboardingContext";
import { Colors, Spacing, Radius, Fonts } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";

export default function Projection() {
  const router = useRouter();
  const { state } = useOnboarding();
  const current = state.weight_kg || 75;
  const target = state.target_weight_kg ?? current - 3;
  const weeks = 5;
  const d = new Date();
  d.setDate(d.getDate() + weeks * 7);
  const dateStr = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <OnboardingHeader step={10} total={17} />
      <Screen>
        <Title>Sua projeção pessoal</Title>
        <Text style={styles.sub}>
          Prevemos que você estará pesando{" "}
          <Text style={{ color: Colors.brand, fontFamily: Fonts.bold }}>{target.toFixed(0)} kg</Text>{" "}
          até <Text style={{ color: Colors.brand, fontFamily: Fonts.bold }}>{dateStr}</Text>.
        </Text>

        <View style={styles.chart}>
          <LinearGradient
            colors={[Colors.brand + "40", Colors.brand + "00"]}
            style={StyleSheet.absoluteFillObject}
          />
          <Svg width="100%" height={180} />
          <View style={styles.chartLabels}>
            <View>
              <Text style={styles.chartLabel}>Hoje</Text>
              <Text style={styles.chartValue}>{current.toFixed(0)}kg</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.chartLabel}>Semana 5</Text>
              <Text style={[styles.chartValue, { color: Colors.brand }]}>{target.toFixed(0)}kg</Text>
            </View>
          </View>
        </View>

        <View style={styles.motivation}>
          <Ionicons name="rocket" size={22} color={Colors.brand} />
          <Text style={styles.motivationText}>
            Cada treino te aproxima da sua melhor versão. Vamos com tudo!
          </Text>
        </View>
      </Screen>
      <StickyFooter>
        <PrimaryButton title="Próximo" onPress={() => router.push("/onboarding/duration")} testID="proj-next" />
      </StickyFooter>
    </View>
  );
}

// Simple SVG-less inline curve using positioned dots
function Svg({ height }: { width: string; height: number }) {
  const points = [0.9, 0.8, 0.72, 0.63, 0.55, 0.48, 0.42, 0.35];
  return (
    <View style={{ height, flexDirection: "row", alignItems: "flex-end", paddingHorizontal: Spacing.md }}>
      {points.map((p, i) => (
        <View key={i} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === points.length - 1 ? Colors.brand : Colors.brandDim,
              marginBottom: p * height,
            }}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sub: { color: Colors.onSurfaceSecondary, fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, marginTop: Spacing.sm, marginBottom: Spacing.xl },
  chart: {
    height: 220,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  chartLabels: {
    position: "absolute",
    bottom: 12, left: 12, right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chartLabel: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.medium, fontSize: 11 },
  chartValue: { color: Colors.onSurface, fontFamily: Fonts.display, fontSize: 22 },
  motivation: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.brandTint,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.brand,
  },
  motivationText: { color: Colors.onSurface, fontFamily: Fonts.medium, fontSize: 14, flex: 1, lineHeight: 20 },
});
