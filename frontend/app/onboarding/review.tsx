import { useRouter } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, OnboardingHeader, Title, Subtitle, StickyFooter, PrimaryButton } from "@/src/components/OnboardingUI";
import { useOnboarding } from "@/src/context/OnboardingContext";
import { Colors, Spacing, Radius, Fonts } from "@/src/theme";

const LABELS: Record<string, string> = {
  iniciante: "Iniciante", intermediario: "Intermediário", avancado: "Avançado", especialista: "Especialista",
  condicionamento: "Condicionamento", forte: "Ficar mais forte", definir: "Definir o corpo", hipertrofia: "Ganhar músculos",
  academia_grande: "Academia grande", academia_pequena: "Academia pequena", casa: "Casa", peso_corporal: "Peso corporal",
  rapido: "Rápido", curto: "Curto", medio: "Médio", longo: "Longo",
};

function fmt(v?: string) { return v ? (LABELS[v] || v) : "—"; }

export default function Review() {
  const router = useRouter();
  const { state } = useOnboarding();

  const rows = [
    { icon: "trophy", label: "Objetivo", value: fmt(state.goal) },
    { icon: "school", label: "Nível", value: fmt(state.experience) },
    { icon: "location", label: "Local", value: fmt(state.location) },
    { icon: "calendar", label: "Frequência", value: `${state.days_per_week || 3}x/semana` },
    { icon: "body", label: "Foco muscular", value: state.muscle_focus.join(", ") || "Corpo inteiro" },
    { icon: "medkit", label: "Lesões", value: state.injuries.length ? state.injuries.join(", ") : "Nenhuma" },
    { icon: "time", label: "Duração", value: fmt(state.duration_pref) },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <OnboardingHeader step={17} total={17} />
      <Screen>
        <Title>Tudo pronto!</Title>
        <Subtitle>Revise seu perfil antes de gerarmos seu plano personalizado.</Subtitle>

        <View style={styles.card}>
          {rows.map((r, i) => (
            <View key={r.label} style={[styles.row, i === rows.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.rowIcon}>
                <Ionicons name={r.icon as any} size={18} color={Colors.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{r.label}</Text>
                <Text style={styles.rowValue}>{r.value}</Text>
              </View>
            </View>
          ))}
        </View>
      </Screen>
      <StickyFooter>
        <PrimaryButton title="Criar meu plano" onPress={() => router.push("/onboarding/loading")} testID="review-create-btn" />
      </StickyFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  rowIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.brandTint, alignItems: "center", justifyContent: "center",
  },
  rowLabel: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.medium, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase" },
  rowValue: { color: Colors.onSurface, fontFamily: Fonts.semibold, fontSize: 14, marginTop: 2 },
});
