import { useRouter } from "expo-router";
import { View } from "react-native";
import { Screen, OnboardingHeader, Title, Subtitle, OptionCard, StickyFooter, PrimaryButton } from "@/src/components/OnboardingUI";
import { useOnboarding } from "@/src/context/OnboardingContext";
import { Colors } from "@/src/theme";

const OPTS = [
  { key: "iniciante", label: "Iniciante", desc: "Menos de 1 ano" },
  { key: "intermediario", label: "Intermediário", desc: "1 a 2 anos" },
  { key: "avancado", label: "Avançado", desc: "2 a 4 anos" },
  { key: "especialista", label: "Especialista", desc: "4+ anos" },
];

export default function Experience() {
  const router = useRouter();
  const { state, update } = useOnboarding();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <OnboardingHeader step={3} total={17} />
      <Screen>
        <Title>Experiência com treino de força?</Title>
        <Subtitle>Assim ajustamos a dificuldade e progressão certa.</Subtitle>
        {OPTS.map((o) => (
          <OptionCard
            key={o.key}
            label={o.label}
            desc={o.desc}
            selected={state.experience === o.key}
            onPress={() => update({ experience: o.key })}
            testID={`exp-${o.key}`}
          />
        ))}
      </Screen>
      <StickyFooter>
        <PrimaryButton
          title="Próximo"
          disabled={!state.experience}
          onPress={() => router.push("/onboarding/frequency")}
          testID="exp-next-btn"
        />
      </StickyFooter>
    </View>
  );
}
