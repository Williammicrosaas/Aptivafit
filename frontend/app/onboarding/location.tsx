import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { Screen, OnboardingHeader, Title, Subtitle, OptionCard, StickyFooter, PrimaryButton } from "@/src/components/OnboardingUI";
import { useOnboarding } from "@/src/context/OnboardingContext";
import { Colors } from "@/src/theme";

const OPTS = [
  { key: "academia_grande", label: "Academia grande", desc: "Máquinas, cabos e pesos livres", icon: "business" as const },
  { key: "academia_pequena", label: "Academia pequena", desc: "Halteres e barras básicas", icon: "storefront" as const },
  { key: "casa", label: "Academia em casa", desc: "Halteres / faixa / barra fixa", icon: "home" as const },
  { key: "peso_corporal", label: "Peso corporal", desc: "Sem equipamento", icon: "body" as const },
];

export default function Location() {
  const router = useRouter();
  const { state, update } = useOnboarding();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <OnboardingHeader step={5} total={17} />
      <Screen>
        <Title>Onde você treina?</Title>
        <Subtitle>Selecionaremos exercícios com o equipamento disponível.</Subtitle>
        {OPTS.map((o) => (
          <OptionCard
            key={o.key}
            label={o.label}
            desc={o.desc}
            icon={<Ionicons name={o.icon} size={22} color={Colors.brand} />}
            selected={state.location === o.key}
            onPress={() => update({ location: o.key })}
            testID={`loc-${o.key}`}
          />
        ))}
      </Screen>
      <StickyFooter>
        <PrimaryButton
          title="Próximo"
          disabled={!state.location}
          onPress={() => router.push("/onboarding/comparison")}
          testID="loc-next-btn"
        />
      </StickyFooter>
    </View>
  );
}
