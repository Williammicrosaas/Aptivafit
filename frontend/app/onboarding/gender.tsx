import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { Screen, OnboardingHeader, Title, Subtitle, OptionCard, StickyFooter, PrimaryButton } from "@/src/components/OnboardingUI";
import { useOnboarding } from "@/src/context/OnboardingContext";
import { Colors } from "@/src/theme";

const OPTS = [
  { key: "masculino", label: "Masculino", icon: "male" as const },
  { key: "feminino", label: "Feminino", icon: "female" as const },
  { key: "outro", label: "Outro", icon: "person" as const },
];

export default function Gender() {
  const router = useRouter();
  const { state, update } = useOnboarding();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <OnboardingHeader step={1} total={17} onBack={() => router.replace("/")} />
      <Screen>
        <Title>Qual seu gênero?</Title>
        <Subtitle>Isso nos ajuda a personalizar seu plano de treino.</Subtitle>
        {OPTS.map((o) => (
          <OptionCard
            key={o.key}
            label={o.label}
            icon={<Ionicons name={o.icon} size={22} color={Colors.brand} />}
            selected={state.gender === o.key}
            onPress={() => update({ gender: o.key })}
            testID={`gender-${o.key}`}
          />
        ))}
      </Screen>
      <StickyFooter>
        <PrimaryButton
          title="Próximo"
          disabled={!state.gender}
          onPress={() => router.push("/onboarding/goal")}
          testID="gender-next-btn"
        />
      </StickyFooter>
    </View>
  );
}
