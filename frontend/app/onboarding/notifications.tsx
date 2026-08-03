import { useRouter } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, OnboardingHeader, Title, Subtitle, StickyFooter, PrimaryButton, SecondaryButton } from "@/src/components/OnboardingUI";
import { Colors, Spacing, Radius, Fonts } from "@/src/theme";

export default function Notifications() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <OnboardingHeader step={15} total={17} />
      <Screen>
        <View style={styles.iconWrap}>
          <Ionicons name="notifications" size={48} color={Colors.brand} />
        </View>
        <Title>Mantenha sua sequência viva</Title>
        <Subtitle>
          Lembretes de treino, progresso e ofertas exclusivas — só o essencial.
        </Subtitle>

        <View style={styles.stat}>
          <Text style={styles.statValue}>3x</Text>
          <Text style={styles.statLabel}>mais treinos no primeiro mês entre usuários que ativam lembretes</Text>
        </View>
      </Screen>
      <StickyFooter>
        <PrimaryButton title="Permitir notificações" onPress={() => router.push("/onboarding/motivational")} testID="notif-allow" />
        <SecondaryButton title="Agora não" onPress={() => router.push("/onboarding/motivational")} testID="notif-skip" />
      </StickyFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.brandTint,
    borderWidth: 1.5, borderColor: Colors.brand,
    alignItems: "center", justifyContent: "center",
    alignSelf: "center", marginTop: Spacing.lg, marginBottom: Spacing.md,
  },
  stat: {
    backgroundColor: Colors.surfaceSecondary,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: { color: Colors.brand, fontFamily: Fonts.display, fontSize: 56 },
  statLabel: { color: Colors.onSurfaceSecondary, fontFamily: Fonts.regular, fontSize: 13, textAlign: "center", marginTop: Spacing.sm },
});
