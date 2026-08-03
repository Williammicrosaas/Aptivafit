import { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "@/src/components/OnboardingUI";
import { Colors, Spacing, Radius, Fonts } from "@/src/theme";
import { useAuth } from "@/src/context/AuthContext";

type Plan = { id: string; label: string; monthly: string; total?: string; badge?: string };
const PLANS: Plan[] = [
  { id: "1m", label: "1 Mês", monthly: "R$ 49,90", total: "R$ 49,90 / mês" },
  { id: "12m", label: "12 Meses", monthly: "R$ 13,90", total: "R$ 166,80 / ano", badge: "72% OFF" },
  { id: "6m", label: "6 Meses", monthly: "R$ 24,90", total: "R$ 149,40 / semestre" },
];

const BENEFITS = [
  "Treino personalizado por IA",
  "Orientação de peso por exercício",
  "Progresso completo na academia",
  "Exercícios novos todo mês",
];

export default function Paywall() {
  const router = useRouter();
  const { setPremium } = useAuth();
  const [selected, setSelected] = useState<string>("12m");
  const [showExit, setShowExit] = useState(false);
  const [exitCount, setExitCount] = useState(0);

  const activate = () => {
    setPremium(true);
    router.replace("/(tabs)/plan");
  };

  const onClose = () => {
    setExitCount((c) => c + 1);
    setShowExit(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }} testID="paywall-screen">
      <LinearGradient
        colors={[Colors.brandTint, Colors.surface]}
        locations={[0, 0.5]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView edges={["top"]} style={styles.topBar}>
        <Pressable onPress={onClose} hitSlop={16} testID="paywall-close">
          <Ionicons name="close" size={26} color={Colors.onSurface} />
        </Pressable>
        <Pressable hitSlop={12} testID="paywall-restore">
          <Text style={styles.restore}>Restaurar</Text>
        </Pressable>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>72% DESCONTO · SÓ HOJE</Text>
        </View>
        <Text style={styles.title}>ACESSO AO SEU{"\n"}PLANO PERSONALIZADO</Text>

        <View style={styles.benefits}>
          {BENEFITS.map((b) => (
            <View key={b} style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.brand} />
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}
        </View>

        <View style={styles.plans}>
          {PLANS.map((p) => {
            const sel = p.id === selected;
            return (
              <Pressable
                key={p.id}
                onPress={() => setSelected(p.id)}
                style={[styles.planCard, sel && styles.planCardSel]}
                testID={`paywall-plan-${p.id}`}
              >
                {p.badge && (
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>{p.badge}</Text>
                  </View>
                )}
                <View style={styles.planRadio}>
                  {sel && <View style={styles.planRadioDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planLabel}>{p.label}</Text>
                  <Text style={styles.planTotal}>{p.total}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.planMonthly}>{p.monthly}</Text>
                  <Text style={styles.planMonthlySub}>/mês</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.legal}>
          Renovação automática. Cancele a qualquer momento nas configurações da assinatura.
        </Text>
      </ScrollView>

      <SafeAreaView edges={["bottom"]} style={styles.footer}>
        <PrimaryButton title="Continuar" onPress={activate} testID="paywall-continue-btn" />
        <Pressable style={styles.promoBtn} testID="paywall-promo-btn">
          <Text style={styles.promoText}>Usar código promocional</Text>
        </Pressable>
      </SafeAreaView>

      <Modal visible={showExit} transparent animationType="fade" onRequestClose={() => setShowExit(false)}>
        <View style={styles.modalRoot}>
          <View style={styles.modalCard}>
            <Text style={styles.modalBadge}>OFERTA ÚNICA</Text>
            <Text style={styles.modalTitle}>Se sair, perderá esta oferta!</Text>
            <Text style={styles.modalSub}>
              {exitCount >= 2 ? "83%" : "72%"} OFF · Plano Anual · nossa melhor oferta
            </Text>
            <View style={styles.modalPricing}>
              <Text style={styles.modalOld}>R$ 49,90/mês</Text>
              <Text style={styles.modalNew}>R$ {exitCount >= 2 ? "8,90" : "13,90"}/mês</Text>
            </View>
            <PrimaryButton title="Aproveitar oferta" onPress={() => { setShowExit(false); setSelected("12m"); }} testID="exit-accept-btn" />
            <Pressable onPress={() => { setShowExit(false); router.back(); }} style={{ paddingTop: 12 }} testID="exit-decline-btn">
              <Text style={styles.modalDecline}>Sair sem desconto</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: "row", justifyContent: "space-between", padding: Spacing.lg },
  restore: { color: Colors.onSurfaceSecondary, fontFamily: Fonts.semibold, fontSize: 14 },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  badgeText: { color: Colors.white, fontFamily: Fonts.extrabold, fontSize: 11, letterSpacing: 1 },
  title: { color: Colors.onSurface, fontFamily: Fonts.display, fontSize: 40, lineHeight: 42, marginTop: Spacing.md, letterSpacing: 1 },
  benefits: { marginTop: Spacing.xl, marginBottom: Spacing.lg, gap: Spacing.md },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  benefitText: { color: Colors.onSurface, fontFamily: Fonts.medium, fontSize: 15 },
  plans: { gap: Spacing.md, marginTop: Spacing.md },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  planCardSel: { borderColor: Colors.brand, backgroundColor: Colors.brandTint },
  planBadge: {
    position: "absolute", top: -10, right: 16,
    backgroundColor: Colors.brand,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill,
  },
  planBadgeText: { color: Colors.onBrand, fontFamily: Fonts.extrabold, fontSize: 10, letterSpacing: 0.8 },
  planRadio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.brand, alignItems: "center", justifyContent: "center" },
  planRadioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.brand },
  planLabel: { color: Colors.onSurface, fontFamily: Fonts.bold, fontSize: 16 },
  planTotal: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.medium, fontSize: 12 },
  planMonthly: { color: Colors.brand, fontFamily: Fonts.display, fontSize: 26 },
  planMonthlySub: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.medium, fontSize: 11, marginTop: -2 },
  legal: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.regular, fontSize: 11, textAlign: "center", marginTop: Spacing.lg, lineHeight: 16 },
  footer: { padding: Spacing.lg, paddingTop: Spacing.md, backgroundColor: Colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border },
  promoBtn: { paddingVertical: Spacing.md, alignItems: "center" },
  promoText: { color: Colors.onSurfaceSecondary, fontFamily: Fonts.semibold, fontSize: 13, textDecorationLine: "underline" },
  modalRoot: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", padding: Spacing.lg },
  modalCard: { backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.lg, padding: Spacing.xl, borderWidth: 1.5, borderColor: Colors.brand },
  modalBadge: { color: Colors.error, fontFamily: Fonts.extrabold, fontSize: 12, letterSpacing: 1, textAlign: "center", marginBottom: Spacing.md },
  modalTitle: { color: Colors.onSurface, fontFamily: Fonts.extrabold, fontSize: 22, textAlign: "center" },
  modalSub: { color: Colors.onSurfaceSecondary, fontFamily: Fonts.medium, fontSize: 13, textAlign: "center", marginTop: Spacing.sm, marginBottom: Spacing.lg },
  modalPricing: { alignItems: "center", marginBottom: Spacing.lg },
  modalOld: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.medium, fontSize: 14, textDecorationLine: "line-through" },
  modalNew: { color: Colors.brand, fontFamily: Fonts.display, fontSize: 40 },
  modalDecline: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.medium, fontSize: 13, textAlign: "center" },
});
