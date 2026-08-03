import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { Screen, OnboardingHeader, Title, Subtitle, OptionCard, StickyFooter, PrimaryButton } from "@/src/components/OnboardingUI";
import { useOnboarding } from "@/src/context/OnboardingContext";
import { Colors } from "@/src/theme";

const OPTS = [
  { key: "condicionamento", label: "Melhorar condicionamento", icon: "flash" as const },
  { key: "forte", label: "Ficar mais forte", icon: "barbell" as const },
  { key: "definir", label: "Definir o corpo", icon: "body" as const },
  { key: "hipertrofia", label: "Ganhar músculos", icon: "fitness" as const },
];

export default function Goal() {
  const router = useRouter();
  const { state, update } = useOnboarding();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <OnboardingHeader step={2} total={17} />
      <Screen>
        <Title>Qual seu objetivo?</Title>
        <Subtitle>Escolha o que mais importa agora. Podemos ajustar depois.</Subtitle>
        {OPTS.map((o) => (
          <OptionCard
            key={o.key}
            label={o.label}
            icon={<Ionicons name={o.icon} size={22} color={Colors.brand} />}
            selected={state.goal === o.key}
            onPress={() => update({ goal: o.key })}
            testID={`goal-${o.key}`}
          />
        ))}
      </Screen>
      <StickyFooter>
        <PrimaryButton
          title="Próximo"
          disabled={!state.goal}
          onPress={() => router.push("/onboarding/experience")}
          testID="goal-next-btn"
        />
      </StickyFooter>
    </View>
  );
}
