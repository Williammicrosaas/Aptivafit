import { useRouter } from "expo-router";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Screen, OnboardingHeader, StickyFooter, PrimaryButton } from "@/src/components/OnboardingUI";
import { Colors, Spacing, Fonts } from "@/src/theme";

export default function Motivational() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <OnboardingHeader step={16} total={17} />
      <View style={{ flex: 1 }}>
        <ImageBackground
          source={{ uri: "https://images.unsplash.com/photo-1550345332-09e3ac987658?w=1080&q=80" }}
          style={{ flex: 1 }}
          imageStyle={{ opacity: 0.7 }}
        >
          <LinearGradient
            colors={["transparent", Colors.surface]}
            locations={[0.3, 0.95]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.content}>
            <Text style={styles.headline}>MAIS ENERGIA{"\n"}O DIA INTEIRO</Text>
            <Text style={styles.sub}>
              Treinos consistentes elevam disposição, foco e qualidade do sono. Você vai sentir a diferença já na primeira semana.
            </Text>
          </View>
        </ImageBackground>
      </View>
      <StickyFooter>
        <PrimaryButton title="Próximo" onPress={() => router.push("/onboarding/testimonials")} testID="motiv-next" />
      </StickyFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { position: "absolute", bottom: 0, left: 0, right: 0, padding: Spacing.lg },
  headline: { color: Colors.onSurface, fontFamily: Fonts.display, fontSize: 44, lineHeight: 46, letterSpacing: 1 },
  sub: { color: Colors.onSurfaceSecondary, fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, marginTop: Spacing.md },
});
