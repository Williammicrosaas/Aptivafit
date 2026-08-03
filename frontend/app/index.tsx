import { View, Text, StyleSheet, Pressable, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Colors, Spacing, Fonts } from "@/src/theme";
import { PrimaryButton } from "@/src/components/OnboardingUI";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.root} testID="welcome-screen">
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?crop=entropy&cs=srgb&fm=jpg&w=1080&q=80",
        }}
        style={styles.bg}
        imageStyle={{ opacity: 0.55 }}
      >
        <LinearGradient
          colors={["rgba(9,12,18,0.2)", "rgba(9,12,18,0.7)", Colors.surface]}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
          <View style={styles.top}>
            <Text style={styles.brand}>APTIVAFIT</Text>
            <View style={styles.brandDot} />
          </View>

          <View style={styles.bottom}>
            <Text style={styles.headline}>
              TREINE O <Text style={{ color: Colors.brand }}>PLANO</Text>{"\n"}FEITO PARA VOCÊ
            </Text>
            <Text style={styles.sub}>
              Obtenha um treino personalizado para seu perfil, com base em seus objetivos e metas.
            </Text>

            <PrimaryButton
              title="Começar"
              onPress={() => router.push("/onboarding/gender")}
              testID="welcome-start-btn"
              style={{ marginTop: Spacing.xl }}
            />
            <Pressable
              onPress={() => router.push("/auth/login")}
              style={styles.loginLink}
              testID="welcome-login-link"
            >
              <Text style={styles.loginText}>
                Eu já tenho uma conta · <Text style={{ color: Colors.brand }}>Entrar</Text>
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  bg: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: Spacing.lg, justifyContent: "space-between" },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: Spacing.md,
  },
  brand: {
    color: Colors.onSurface,
    fontFamily: Fonts.display,
    fontSize: 22,
    letterSpacing: 3,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand,
  },
  bottom: {
    paddingBottom: Spacing.lg,
  },
  headline: {
    color: Colors.onSurface,
    fontFamily: Fonts.display,
    fontSize: 46,
    lineHeight: 48,
    letterSpacing: 1,
  },
  sub: {
    color: Colors.onSurfaceSecondary,
    fontFamily: Fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    marginTop: Spacing.md,
  },
  loginLink: { paddingVertical: Spacing.md, alignItems: "center" },
  loginText: {
    color: Colors.onSurfaceSecondary,
    fontFamily: Fonts.semibold,
    fontSize: 14,
  },
});
