import { useRouter } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, OnboardingHeader, Title, StickyFooter, PrimaryButton } from "@/src/components/OnboardingUI";
import { Colors, Spacing, Radius, Fonts } from "@/src/theme";

function CompareCard({ label, level, color, bars }: { label: string; level: string; color: string; bars: number[] }) {
  return (
    <View style={[styles.card, { borderColor: color }]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <View style={styles.barsRow}>
        {bars.map((h, i) => (
          <View key={i} style={[styles.bar, { height: h, backgroundColor: color }]} />
        ))}
      </View>
      <Text style={[styles.cardLevel, { color }]}>{level}</Text>
    </View>
  );
}

export default function Comparison() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <OnboardingHeader step={5} total={17} />
      <Screen>
        <Title>Conquiste a sua melhor versão.</Title>
        <Text style={styles.sub}>
          Usuários da Aptivafit alcançam <Text style={{ color: Colors.brand, fontFamily: Fonts.bold }}>3x</Text> mais definição no mesmo tempo.
        </Text>
        <View style={styles.compareRow}>
          <CompareCard label="SEM APTIVAFIT" level="Pouca mudança" color="#EF4444" bars={[30, 34, 38, 40]} />
          <CompareCard label="COM APTIVAFIT" level="3x mais definido" color={Colors.brand} bars={[30, 55, 80, 110]} />
        </View>
        <View style={styles.callout}>
          <Ionicons name="trending-up" size={18} color={Colors.brand} />
          <Text style={styles.calloutText}>
            Planos ajustados semanalmente com base no seu progresso.
          </Text>
        </View>
      </Screen>
      <StickyFooter>
        <PrimaryButton title="Próximo" onPress={() => router.push("/onboarding/injuries")} testID="comparison-next-btn" />
      </StickyFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  sub: {
    color: Colors.onSurfaceSecondary,
    fontFamily: Fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  compareRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  card: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1.5,
    height: 220,
    justifyContent: "space-between",
  },
  cardLabel: {
    color: Colors.onSurfaceTertiary,
    fontFamily: Fonts.bold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    height: 110,
  },
  bar: {
    flex: 1,
    borderRadius: 4,
    opacity: 0.9,
  },
  cardLevel: {
    fontFamily: Fonts.extrabold,
    fontSize: 15,
  },
  callout: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.brandTint,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.brand,
  },
  calloutText: {
    color: Colors.onSurface,
    fontFamily: Fonts.medium,
    fontSize: 13,
    flex: 1,
  },
});
