import { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput, Pressable,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Spacing, Radius, Fonts } from "@/src/theme";
import { api } from "@/src/api/client";
import { useAuth } from "@/src/context/AuthContext";

type Msg = { role: "user" | "assistant"; text: string; created_at?: string };

const SUGGESTIONS = [
  "Como melhoro meu supino?",
  "Estou com dor no ombro, o que faço?",
  "Como aumentar minha carga com segurança?",
  "Qual a melhor ordem dos exercícios?",
];

export default function CoachScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      try {
        const r = await api<{ items: Msg[] }>("/coach/history");
        setMessages(r.items || []);
      } catch {}
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, [messages.length]);

  const send = async (text?: string) => {
    const t = (text ?? input).trim();
    if (!t || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: t }]);
    setBusy(true);
    try {
      const r = await api<{ reply: string }>("/coach/chat", {
        method: "POST",
        body: JSON.stringify({ text: t }),
      });
      setMessages((m) => [...m, { role: "assistant", text: r.reply }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", text: "Erro: " + (e.message || "tente novamente") }]);
    } finally {
      setBusy(false);
    }
  };

  const clear = () => {
    if (Platform.OS === "web") {
      // eslint-disable-next-line no-alert
      if (!window.confirm("Apagar todo o histórico?")) return;
      void doClear();
    } else {
      Alert.alert("Apagar histórico?", "Todo o histórico do chat será removido.", [
        { text: "Cancelar", style: "cancel" },
        { text: "Apagar", style: "destructive", onPress: doClear },
      ]);
    }
  };
  const doClear = async () => {
    try {
      await api("/coach/history", { method: "DELETE" });
      setMessages([]);
    } catch {}
  };

  if (!user) return (
    <SafeAreaView style={styles.root}>
      <View style={styles.empty}>
        <Ionicons name="chatbubbles" size={48} color={Colors.brand} />
        <Text style={styles.emptyTitle}>Entre para conversar com seu Coach IA</Text>
        <Pressable onPress={() => router.push("/auth/login")} style={styles.emptyBtn} testID="coach-login-btn">
          <Text style={styles.emptyBtnText}>Fazer login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }} testID="coach-screen">
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} testID="coach-back">
            <Ionicons name="chevron-back" size={26} color={Colors.onSurface} />
          </Pressable>
          <View style={{ flex: 1, alignItems: "center" }}>
            <View style={styles.brandRow}>
              <View style={styles.aiDot} />
              <Text style={styles.brandTitle}>COACH IA</Text>
            </View>
            <Text style={styles.brandSub}>Powered by Gemini 3.1 Pro</Text>
          </View>
          <Pressable onPress={clear} hitSlop={12} testID="coach-clear">
            <Ionicons name="trash-outline" size={22} color={Colors.onSurfaceTertiary} />
          </Pressable>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <ActivityIndicator color={Colors.brand} style={{ marginTop: 40 }} />
          ) : messages.length === 0 ? (
            <View style={styles.welcome}>
              <View style={styles.welcomeIcon}>
                <Ionicons name="sparkles" size={32} color={Colors.brand} />
              </View>
              <Text style={styles.welcomeTitle}>Oi{user.name ? `, ${user.name.split(" ")[0]}` : ""}!</Text>
              <Text style={styles.welcomeSub}>
                Sou seu Coach IA. Posso te ajudar com técnica de exercícios, progressão de carga, dores, motivação e mais.
              </Text>
              <Text style={styles.suggestLabel}>SUGESTÕES</Text>
              <View style={styles.suggestions}>
                {SUGGESTIONS.map((s) => (
                  <Pressable
                    key={s}
                    style={styles.suggestChip}
                    onPress={() => send(s)}
                    testID={`coach-suggest-${s.slice(0, 12)}`}
                  >
                    <Text style={styles.suggestText}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            messages.map((m, i) => <Bubble key={i} msg={m} />)
          )}
          {busy && (
            <View style={[styles.bubbleWrap, { alignSelf: "flex-start" }]}>
              <View style={[styles.bubble, styles.aiBubble]}>
                <Typing />
              </View>
            </View>
          )}
        </ScrollView>

        <SafeAreaView edges={["bottom"]} style={styles.inputBar}>
          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Pergunte ao seu coach..."
              placeholderTextColor={Colors.onSurfaceTertiary}
              style={styles.input}
              multiline
              testID="coach-input"
              onSubmitEditing={() => send()}
              returnKeyType="send"
            />
            <Pressable
              onPress={() => send()}
              disabled={!input.trim() || busy}
              style={[styles.sendBtn, (!input.trim() || busy) && styles.sendBtnDisabled]}
              testID="coach-send-btn"
            >
              <Ionicons name="arrow-up" size={20} color={Colors.onBrand} />
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <View style={[styles.bubbleWrap, { alignSelf: isUser ? "flex-end" : "flex-start" }]}>
      {!isUser && (
        <View style={styles.aiIcon}>
          <Ionicons name="sparkles" size={12} color={Colors.brand} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.bubbleText, isUser && { color: Colors.onBrand }]}>{msg.text}</Text>
      </View>
    </View>
  );
}

function Typing() {
  const [dots, setDots] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d % 3) + 1), 400);
    return () => clearInterval(t);
  }, []);
  return <Text style={styles.typing}>{".".repeat(dots)}</Text>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: "row", alignItems: "center", gap: Spacing.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  aiDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.brand },
  brandTitle: { color: Colors.onSurface, fontFamily: Fonts.display, fontSize: 20, letterSpacing: 2 },
  brandSub: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.medium, fontSize: 10, marginTop: 2 },
  body: { padding: Spacing.lg, paddingBottom: Spacing.xl, flexGrow: 1 },
  welcome: { flex: 1, alignItems: "center", paddingTop: Spacing.xxl },
  welcomeIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.brandTint, borderWidth: 1.5, borderColor: Colors.brand,
    alignItems: "center", justifyContent: "center", marginBottom: Spacing.lg,
  },
  welcomeTitle: { color: Colors.onSurface, fontFamily: Fonts.extrabold, fontSize: 24 },
  welcomeSub: { color: Colors.onSurfaceSecondary, fontFamily: Fonts.regular, fontSize: 14, textAlign: "center", marginTop: Spacing.sm, lineHeight: 20, paddingHorizontal: Spacing.lg },
  suggestLabel: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.bold, fontSize: 10, letterSpacing: 1, marginTop: Spacing.xxl, marginBottom: Spacing.md, alignSelf: "flex-start" },
  suggestions: { gap: Spacing.sm, width: "100%" },
  suggestChip: {
    padding: Spacing.md, backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
  },
  suggestText: { color: Colors.onSurface, fontFamily: Fonts.medium, fontSize: 14 },
  bubbleWrap: { flexDirection: "row", alignItems: "flex-end", gap: 6, marginBottom: Spacing.md, maxWidth: "88%" },
  aiIcon: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.brandTint, borderWidth: 1, borderColor: Colors.brand,
    alignItems: "center", justifyContent: "center",
  },
  bubble: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderRadius: Radius.lg, flexShrink: 1,
  },
  userBubble: { backgroundColor: Colors.brand, borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: Colors.surfaceSecondary, borderWidth: 1, borderColor: Colors.border, borderBottomLeftRadius: 4 },
  bubbleText: { color: Colors.onSurface, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  typing: { color: Colors.brand, fontFamily: Fonts.bold, fontSize: 18, letterSpacing: 2 },
  inputBar: { padding: Spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border, backgroundColor: Colors.surface },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: Spacing.sm },
  input: {
    flex: 1, color: Colors.onSurface, fontFamily: Fonts.regular, fontSize: 14,
    backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingTop: 12, paddingBottom: 12,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.brand,
    alignItems: "center", justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.4 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.lg, padding: Spacing.xxl },
  emptyTitle: { color: Colors.onSurface, fontFamily: Fonts.bold, fontSize: 18, textAlign: "center" },
  emptyBtn: { paddingHorizontal: Spacing.xl, paddingVertical: 14, backgroundColor: Colors.brand, borderRadius: Radius.pill },
  emptyBtnText: { color: Colors.onBrand, fontFamily: Fonts.extrabold, fontSize: 14, letterSpacing: 1 },
});
