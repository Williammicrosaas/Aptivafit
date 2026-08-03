import { useRouter } from "expo-router";
import { View } from "react-native";
import { Screen, OnboardingHeader, Title, Subtitle, OptionCard, StickyFooter, PrimaryButton } from "@/src/components/OnboardingUI";
import { useOnboarding } from "@/src/context/OnboardingContext";
import { Colors } from "@/src/theme";

const OPTS = [
  { key: "regular", label: "Regularmente", desc: "2x ou mais por semana" },
  { key: "inconsistente", label: "Inconsistentemente", desc: "Vou quando dá" },
  { key: "nunca", label: "Nunca", desc: "6+ meses parado" },
];

export default function Frequency() {
  const router = useRouter();
  const { state, update } = useOnboarding();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <OnboardingHeader step={4} total={17} />
      <Screen>
        <Title>Você treina atualmente?</Title>
        <Subtitle>Sinceridade nessa etapa acelera seus resultados.</Subtitle>
        {OPTS.map((o) => (
          <OptionCard
            key={o.key}
            label={o.label}
            desc={o.desc}
            selected={state.current_frequency === o.key}
            onPress={() => update({ current_frequency: o.key })}
            testID={`freq-${o.key}`}
          />
        ))}
      </Screen>
      <StickyFooter>
        <PrimaryButton
          title="Próximo"
          disabled={!state.current_frequency}
          onPress={() => router.push("/onboarding/location")}
          testID="freq-next-btn"
        />
      </StickyFooter>
    </View>
  );
}
