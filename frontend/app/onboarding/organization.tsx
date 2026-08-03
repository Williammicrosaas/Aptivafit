import { useRouter } from "expo-router";
import { View } from "react-native";
import { Screen, OnboardingHeader, Title, Subtitle, OptionCard, StickyFooter, PrimaryButton } from "@/src/components/OnboardingUI";
import { useOnboarding } from "@/src/context/OnboardingContext";
import { Colors } from "@/src/theme";

const OPTS = [
  { key: "equilibrado", label: "Equilibrado", desc: "Variedade moderada" },
  { key: "variado", label: "Variado", desc: "Alta variedade toda semana" },
  { key: "fixo", label: "Fixo", desc: "Mesma estrutura toda semana" },
];

export default function Organization() {
  const router = useRouter();
  const { state, update } = useOnboarding();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <OnboardingHeader step={13} total={17} />
      <Screen>
        <Title>Como organizar seus treinos?</Title>
        <Subtitle>Consistência semanal ou variedade máxima?</Subtitle>
        {OPTS.map((o) => (
          <OptionCard
            key={o.key}
            label={o.label}
            desc={o.desc}
            selected={state.organization === o.key}
            onPress={() => update({ organization: o.key })}
            testID={`org-${o.key}`}
          />
        ))}
      </Screen>
      <StickyFooter>
        <PrimaryButton
          title="Próximo"
          disabled={!state.organization}
          onPress={() => router.push("/onboarding/weekly-frequency")}
          testID="org-next"
        />
      </StickyFooter>
    </View>
  );
}
