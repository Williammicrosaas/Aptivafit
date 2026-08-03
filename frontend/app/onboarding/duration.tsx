import { useRouter } from "expo-router";
import { View } from "react-native";
import { Screen, OnboardingHeader, Title, Subtitle, OptionCard, StickyFooter, PrimaryButton } from "@/src/components/OnboardingUI";
import { useOnboarding } from "@/src/context/OnboardingContext";
import { Colors } from "@/src/theme";

const OPTS = [
  { key: "rapido", label: "Rápido", desc: "3 exercícios · ~20 min" },
  { key: "curto", label: "Curto", desc: "4 a 6 exercícios · ~35 min" },
  { key: "medio", label: "Médio", desc: "5 a 7 exercícios · ~50 min" },
  { key: "longo", label: "Longo", desc: "8 a 10 exercícios · ~75 min" },
];

export default function Duration() {
  const router = useRouter();
  const { state, update } = useOnboarding();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <OnboardingHeader step={11} total={17} />
      <Screen>
        <Title>Tempo ideal de treino?</Title>
        <Subtitle>Definimos o volume de exercícios por sessão.</Subtitle>
        {OPTS.map((o) => (
          <OptionCard
            key={o.key}
            label={o.label}
            desc={o.desc}
            selected={state.duration_pref === o.key}
            onPress={() => update({ duration_pref: o.key })}
            testID={`dur-${o.key}`}
          />
        ))}
      </Screen>
      <StickyFooter>
        <PrimaryButton
          title="Próximo"
          disabled={!state.duration_pref}
          onPress={() => router.push("/onboarding/setup-mode")}
          testID="dur-next"
        />
      </StickyFooter>
    </View>
  );
}
