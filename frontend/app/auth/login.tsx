import { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { Colors, Spacing, Radius, Fonts } from "@/src/theme";
import { PrimaryButton } from "@/src/components/OnboardingUI";
import { useAuth } from "@/src/context/AuthContext";

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const router = useRouter();
  const { loginEmail, registerEmail, loginWithSession } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr(null);
    setBusy(true);
    try {
      if (mode === "register") await registerEmail(email.trim(), password, name.trim());
      else await loginEmail(email.trim(), password);
      router.replace("/(tabs)/plan");
    } catch (e: any) {
      setErr(e.message || "Erro ao autenticar");
    } finally {
      setBusy(false);
    }
  };

  const googleLogin = async () => {
    setErr(null);
    try {
      const redirect = Platform.OS === "web" ? window.location.origin + "/" : Linking.createURL("");
      const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirect)}`;
      if (Platform.OS === "web") {
        window.location.href = authUrl;
        return;
      }
      const res = await WebBrowser.openAuthSessionAsync(authUrl, redirect);
      let url = (res as any).url as string | undefined;
      if (!url) url = (await Linking.getInitialURL()) || undefined;
      if (!url) throw new Error("Auth cancelada");
      const m = url.match(/[?#&]session_id=([^&#]+)/);
      if (!m) throw new Error("session_id ausente");
      await loginWithSession(decodeURIComponent(m[1]));
      router.replace("/(tabs)/plan");
    } catch (e: any) {
      setErr(e.message || "Erro no login Google");
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} hitSlop={12} testID="login-back-btn">
            <Ionicons name="chevron-back" size={26} color={Colors.onSurface} />
          </Pressable>

          <Text style={styles.title}>{mode === "login" ? "Bem-vindo de volta" : "Criar sua conta"}</Text>
          <Text style={styles.sub}>Mantenha treinos, recordes e sequência em todos os dispositivos.</Text>

          {mode === "register" && (
            <TextInput
              placeholder="Seu nome"
              placeholderTextColor={Colors.onSurfaceTertiary}
              value={name}
              onChangeText={setName}
              style={styles.input}
              testID="login-name-input"
            />
          )}
          <TextInput
            placeholder="Email"
            placeholderTextColor={Colors.onSurfaceTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            testID="login-email-input"
          />
          <TextInput
            placeholder="Senha"
            placeholderTextColor={Colors.onSurfaceTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            testID="login-password-input"
          />

          {err && <Text style={styles.err}>{err}</Text>}

          <PrimaryButton
            title={busy ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
            onPress={submit}
            disabled={busy || !email || !password}
            testID="login-submit-btn"
            style={{ marginTop: Spacing.md }}
          />

          <View style={styles.divider}>
            <View style={styles.dLine} />
            <Text style={styles.dText}>ou</Text>
            <View style={styles.dLine} />
          </View>

          <Pressable style={styles.googleBtn} onPress={googleLogin} testID="login-google-btn">
            <Ionicons name="logo-google" size={20} color={Colors.onSurface} />
            <Text style={styles.googleText}>Continuar com Google</Text>
          </Pressable>

          <Pressable onPress={() => setMode(mode === "login" ? "register" : "login")} style={{ paddingVertical: Spacing.lg }} testID="login-switch-mode">
            <Text style={styles.switchText}>
              {mode === "login" ? "Não tem conta? " : "Já tem conta? "}
              <Text style={{ color: Colors.brand }}>
                {mode === "login" ? "Cadastre-se" : "Entrar"}
              </Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  title: { color: Colors.onSurface, fontFamily: Fonts.extrabold, fontSize: 28, marginTop: Spacing.lg },
  sub: { color: Colors.onSurfaceSecondary, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, marginTop: Spacing.sm, marginBottom: Spacing.xl },
  input: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.onSurface,
    fontFamily: Fonts.medium,
    fontSize: 15,
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  err: { color: Colors.error, fontFamily: Fonts.medium, fontSize: 13, marginTop: 4 },
  divider: { flexDirection: "row", alignItems: "center", gap: Spacing.md, marginVertical: Spacing.xl },
  dLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dText: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.medium, fontSize: 12 },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    paddingVertical: 16,
  },
  googleText: { color: Colors.onSurface, fontFamily: Fonts.bold, fontSize: 15 },
  switchText: { color: Colors.onSurfaceSecondary, fontFamily: Fonts.medium, fontSize: 14, textAlign: "center" },
});
