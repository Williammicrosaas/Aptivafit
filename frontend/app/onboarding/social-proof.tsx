import { useRouter } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, OnboardingHeader, Title, StickyFooter, PrimaryButton } from "@/src/components/OnboardingUI";
import { Colors, Spacing, Radius, Fonts } from "@/src/theme";

export default function SocialProof() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <OnboardingHeader step={15} total={17} />
      <Screen>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>+3.500.000</Text>
          <Text style={styles.badgeSub}>usuários escolheram a Aptivafit</Text>
        </View>

        <Title>Por que treinar com a gente?</Title>

        <View style={styles.row}>
          <Text style={styles.rowTitle}>Outro plano</Text>
          {["Foco disperso", "Progresso lento", "Sem adaptação"].map((t) => (
            <View key={t} style={styles.item}>
              <Ionicons name="close-circle" size={18} color={Colors.error} />
              <Text style={styles.itemText}>{t}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.row, styles.rowHighlight]}>
          <Text style={[styles.rowTitle, { color: Colors.brand }]}>Plano Aptivafit</Text>
          {["Queima de gordura eficiente", "Progressão ajustada por IA", "Resultados rápidos e sustentáveis"].map((t) => (
            <View key={t} style={styles.item}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.brand} />
              <Text style={styles.itemText}>{t}</Text>
            </View>
          ))}
        </View>
      </Screen>
      <StickyFooter>
        <PrimaryButton title="Próximo" onPress={() => router.push("/onboarding/notifications")} testID="social-next" />
      </StickyFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  badgeText: { color: Colors.brand, fontFamily: Fonts.display, fontSize: 44, letterSpacing: 1 },
  badgeSub: { color: Colors.onSurfaceSecondary, fontFamily: Fonts.medium, fontSize: 14 },
  row: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowHighlight: { borderColor: Colors.brand, backgroundColor: Colors.brandTint },
  rowTitle: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.bold, fontSize: 12, letterSpacing: 1, marginBottom: Spacing.md, textTransform: "uppercase" },
  item: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, paddingVertical: 6 },
  itemText: { color: Colors.onSurface, fontFamily: Fonts.medium, fontSize: 14 },
});
