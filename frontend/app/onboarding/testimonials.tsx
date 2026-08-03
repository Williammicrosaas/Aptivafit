import { useRouter } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, OnboardingHeader, Title, StickyFooter, PrimaryButton } from "@/src/components/OnboardingUI";
import { Colors, Spacing, Radius, Fonts } from "@/src/theme";

const TESTIMONIALS = [
  { name: "Ricardo M.", rating: 5, text: "Ganhei 4kg de massa magra em 3 meses seguindo o plano. Nunca me senti tão bem!" },
  { name: "Juliana S.", rating: 5, text: "O melhor app de treino. As progressões automáticas fazem toda a diferença." },
];

export default function Testimonials() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <OnboardingHeader step={16} total={17} />
      <Screen>
        <View style={styles.rating}>
          <View style={styles.stars}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Ionicons key={i} name="star" size={22} color={Colors.brand} />
            ))}
          </View>
          <Text style={styles.ratingValue}>4,8</Text>
          <Text style={styles.ratingSub}>32.000+ avaliações na App Store & Google Play</Text>
        </View>
        <Title>O que dizem quem já usa</Title>

        {TESTIMONIALS.map((t, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardStars}>
              {[0, 1, 2, 3, 4].map((j) => (
                <Ionicons key={j} name="star" size={12} color={Colors.brand} />
              ))}
            </View>
            <Text style={styles.cardText}>"{t.text}"</Text>
            <Text style={styles.cardName}>— {t.name}</Text>
          </View>
        ))}
      </Screen>
      <StickyFooter>
        <PrimaryButton title="Próximo" onPress={() => router.push("/onboarding/review")} testID="test-next" />
      </StickyFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  rating: { alignItems: "center", marginTop: Spacing.lg, marginBottom: Spacing.md },
  stars: { flexDirection: "row", gap: 4 },
  ratingValue: { color: Colors.onSurface, fontFamily: Fonts.display, fontSize: 56 },
  ratingSub: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.medium, fontSize: 12 },
  card: {
    backgroundColor: Colors.surfaceSecondary,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  cardStars: { flexDirection: "row", gap: 2, marginBottom: Spacing.sm },
  cardText: { color: Colors.onSurface, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 22 },
  cardName: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.semibold, fontSize: 13, marginTop: Spacing.sm },
});
