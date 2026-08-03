import { useRouter } from "expo-router";
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { Screen, OnboardingHeader, Title, Subtitle, StickyFooter, PrimaryButton } from "@/src/components/OnboardingUI";
import { useOnboarding } from "@/src/context/OnboardingContext";
import { Colors, Spacing, Radius, Fonts } from "@/src/theme";
import { useMemo } from "react";

function bmiCategory(bmi: number): { text: string; color: string } {
  if (bmi < 18.5) return { text: "Abaixo do peso", color: Colors.warning };
  if (bmi < 25) return { text: "Peso saudável ✓", color: Colors.brand };
  if (bmi < 30) return { text: "Sobrepeso", color: Colors.warning };
  return { text: "Obesidade", color: Colors.error };
}

export default function BodyData() {
  const router = useRouter();
  const { state, update } = useOnboarding();

  const bmi = useMemo(() => {
    if (!state.height_cm || !state.weight_kg) return 0;
    const h = state.height_cm / 100;
    return state.weight_kg / (h * h);
  }, [state.height_cm, state.weight_kg]);

  const cat = bmiCategory(bmi);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: Colors.surface }}
    >
      <OnboardingHeader step={9} total={17} />
      <Screen>
        <Title>Seus dados corporais</Title>
        <Subtitle>Usamos para calcular calorias e sugerir cargas iniciais.</Subtitle>

        <View style={styles.row}>
          <Field
            label="Idade"
            value={String(state.age || "")}
            suffix="anos"
            onChange={(v) => update({ age: Number(v) || undefined })}
            testID="bd-age"
          />
        </View>
        <View style={styles.row}>
          <Field
            label="Altura"
            value={String(state.height_cm || "")}
            suffix="cm"
            onChange={(v) => update({ height_cm: Number(v) || undefined })}
            testID="bd-height"
          />
        </View>
        <View style={styles.row}>
          <Field
            label="Peso"
            value={String(state.weight_kg || "")}
            suffix="kg"
            onChange={(v) => update({ weight_kg: Number(v) || undefined })}
            testID="bd-weight"
          />
        </View>

        {bmi > 0 && (
          <View style={[styles.bmiCard, { borderColor: cat.color }]}>
            <Text style={styles.bmiValue}>{bmi.toFixed(1)}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.bmiTitle}>Seu IMC é {bmi.toFixed(1)}</Text>
              <Text style={[styles.bmiCat, { color: cat.color }]}>{cat.text}</Text>
            </View>
          </View>
        )}
      </Screen>
      <StickyFooter>
        <PrimaryButton
          title="Próximo"
          disabled={!state.age || !state.height_cm || !state.weight_kg}
          onPress={() => router.push("/onboarding/weight-goal")}
          testID="bd-next-btn"
        />
      </StickyFooter>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  suffix,
  onChange,
  testID,
}: {
  label: string;
  value: string;
  suffix: string;
  onChange: (v: string) => void;
  testID?: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          style={styles.input}
          placeholderTextColor={Colors.onSurfaceTertiary}
          testID={testID}
        />
        <Text style={styles.suffix}>{suffix}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: Spacing.md },
  fieldWrap: { gap: 6 },
  fieldLabel: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.semibold, fontSize: 12, letterSpacing: 0.8, textTransform: "uppercase" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
  },
  input: {
    flex: 1,
    color: Colors.onSurface,
    fontFamily: Fonts.bold,
    fontSize: 22,
    paddingVertical: Spacing.lg,
  },
  suffix: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.semibold, fontSize: 14 },
  bmiCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    marginTop: Spacing.lg,
  },
  bmiValue: { color: Colors.onSurface, fontFamily: Fonts.display, fontSize: 46 },
  bmiTitle: { color: Colors.onSurface, fontFamily: Fonts.bold, fontSize: 15 },
  bmiCat: { fontFamily: Fonts.semibold, fontSize: 13, marginTop: 2 },
});
