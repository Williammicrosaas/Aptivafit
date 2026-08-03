import { useRouter } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, OnboardingHeader, Title, Subtitle, StickyFooter, PrimaryButton, SecondaryButton } from "@/src/components/OnboardingUI";
import { Colors, Spacing, Radius, Fonts } from "@/src/theme";

const ITEMS = [
  { icon: "walk", label: "Caminhada" },
  { icon: "flame", label: "Corrida" },
  { icon: "barbell", label: "Força" },
  { icon: "fitness", label: "Treinos" },
  { icon: "trending-up", label: "Progresso" },
  { icon: "heart", label: "Calorias" },
];

export default function HealthConnect() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <OnboardingHeader step={8} total={17} />
      <Screen>
        <Title>Conectar ao Apple Saúde / Google Fit</Title>
        <Subtitle>Sincronize suas atividades para relatórios mais completos.</Subtitle>
        <View style={styles.grid}>
          {ITEMS.map((it) => (
            <View key={it.label} style={styles.tile}>
              <Ionicons name={it.icon as any} size={22} color={Colors.brand} />
              <Text style={styles.tileLabel}>{it.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.note}>
          <Ionicons name="lock-closed" size={16} color={Colors.onSurfaceTertiary} />
          <Text style={styles.noteText}>
            Seus dados são criptografados e nunca compartilhados sem permissão.
          </Text>
        </View>
      </Screen>
      <StickyFooter>
        <PrimaryButton
          title="Conectar"
          onPress={() => router.push("/onboarding/body-data")}
          testID="health-connect-btn"
        />
        <SecondaryButton
          title="Agora não"
          onPress={() => router.push("/onboarding/body-data")}
          testID="health-skip-btn"
        />
      </StickyFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md, marginBottom: Spacing.xl },
  tile: {
    width: "31%",
    aspectRatio: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tileLabel: { color: Colors.onSurfaceSecondary, fontFamily: Fonts.medium, fontSize: 11 },
  note: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md,
  },
  noteText: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.regular, fontSize: 12, flex: 1 },
});
