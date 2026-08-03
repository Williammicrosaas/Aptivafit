import { useRouter } from "expo-router";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, OnboardingHeader, Title, Subtitle, OptionCard, StickyFooter, PrimaryButton } from "@/src/components/OnboardingUI";
import { useOnboarding } from "@/src/context/OnboardingContext";
import { Colors } from "@/src/theme";

const OPTS = [
  { key: "ia", label: "Plano inteligente (IA)", desc: "Gerado com base nas suas respostas", icon: "sparkles" as const },
  { key: "manual", label: "Criado por você", desc: "Monte seu plano do zero", icon: "hammer" as const },
];

export default function SetupMode() {
  const router = useRouter();
  const { state, update } = useOnboarding();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <OnboardingHeader step={12} total={17} />
      <Screen>
        <Title>Como configurar seus treinos?</Title>
        <Subtitle>Você pode alterar essa escolha depois.</Subtitle>
        {OPTS.map((o) => (
          <OptionCard
            key={o.key}
            label={o.label}
            desc={o.desc}
            icon={<Ionicons name={o.icon} size={22} color={Colors.brand} />}
            selected={state.setup_mode === o.key}
            onPress={() => update({ setup_mode: o.key })}
            testID={`mode-${o.key}`}
          />
        ))}
      </Screen>
      <StickyFooter>
        <PrimaryButton
          title="Próximo"
          disabled={!state.setup_mode}
          onPress={() => router.push("/onboarding/organization")}
          testID="mode-next"
        />
      </StickyFooter>
    </View>
  );
}
