import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Spacing, Radius, Fonts } from "../theme";
import { ExerciseThumb } from "./ExerciseThumb";
import { api } from "../api/client";

type Ex = {
  id: string;
  name: string;
  group: string;
  equipment: string;
  level: string;
  images: string[];
  primary?: string[];
  secondary?: string[];
  instructions?: string[];
  tips?: string[];
};

type Props = {
  visible: boolean;
  exerciseId: string | null;
  onClose: () => void;
};

const TABS = ["Músculo", "Instruções", "Equipamento"] as const;

export function ExerciseDetailModal({ visible, exerciseId, onClose }: Props) {
  const [ex, setEx] = useState<Ex | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Instruções");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || !exerciseId) return;
    setLoading(true);
    setTab("Instruções");
    api<Ex>(`/exercises/${exerciseId}`).then(setEx).finally(() => setLoading(false));
  }, [visible, exerciseId]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={16} testID="exercise-detail-close">
            <Ionicons name="close" size={26} color={Colors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{ex?.name || "Carregando..."}</Text>
          <Pressable hitSlop={12} testID="exercise-detail-favorite">
            <Ionicons name="bookmark-outline" size={22} color={Colors.brand} />
          </Pressable>
        </View>

        {ex && (
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.heroWrap}>
              <ExerciseThumb images={ex.images} size={280} imageStyle={{ width: 280, height: 280 }} intervalMs={800} />
            </View>

            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Ionicons name="body" size={12} color={Colors.brand} />
                <Text style={styles.badgeText}>{ex.group}</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="barbell" size={12} color={Colors.brand} />
                <Text style={styles.badgeText}>{ex.equipment}</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="school" size={12} color={Colors.brand} />
                <Text style={styles.badgeText}>{ex.level}</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
              {TABS.map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setTab(t)}
                  style={[styles.tab, tab === t && styles.tabSel]}
                  testID={`ex-tab-${t}`}
                >
                  <Text style={[styles.tabText, tab === t && styles.tabTextSel]}>{t.toUpperCase()}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {tab === "Músculo" && (
              <View style={{ gap: Spacing.md }}>
                <SectionTitle title="Músculos primários" />
                <View style={styles.muscleRow}>
                  {(ex.primary || []).map((m) => (
                    <View key={m} style={[styles.muscleChip, styles.muscleChipPrimary]}>
                      <Text style={styles.muscleTextPrimary}>{m}</Text>
                    </View>
                  ))}
                </View>
                {(ex.secondary || []).length > 0 && (
                  <>
                    <SectionTitle title="Músculos secundários" />
                    <View style={styles.muscleRow}>
                      {(ex.secondary || []).map((m) => (
                        <View key={m} style={styles.muscleChip}>
                          <Text style={styles.muscleText}>{m}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </View>
            )}

            {tab === "Instruções" && (
              <View style={{ gap: Spacing.md }}>
                <SectionTitle title="Passo a passo" />
                {(ex.instructions || []).map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
                {(ex.tips || []).length > 0 && (
                  <>
                    <SectionTitle title="Dicas importantes" />
                    {(ex.tips || []).map((t, i) => (
                      <View key={i} style={styles.tipRow}>
                        <Ionicons name="bulb" size={16} color={Colors.brand} />
                        <Text style={styles.tipText}>{t}</Text>
                      </View>
                    ))}
                  </>
                )}
              </View>
            )}

            {tab === "Equipamento" && (
              <View style={styles.equipCard}>
                <Ionicons name="barbell" size={32} color={Colors.brand} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.equipTitle}>{ex.equipment}</Text>
                  <Text style={styles.equipDesc}>
                    Este exercício pode ser realizado em academia com equipamentos padrão.
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerTitle: { flex: 1, color: Colors.onSurface, fontFamily: Fonts.bold, fontSize: 16, textAlign: "center", marginHorizontal: Spacing.md },
  body: { padding: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.lg },
  heroWrap: { alignSelf: "center", borderRadius: Radius.lg, overflow: "hidden", borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, justifyContent: "center" },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: Colors.brandTint, borderRadius: Radius.pill, paddingVertical: 6, paddingHorizontal: Spacing.md, borderWidth: 1, borderColor: Colors.brand },
  badgeText: { color: Colors.brand, fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 0.5, textTransform: "capitalize" },
  tabsRow: { gap: Spacing.sm, paddingVertical: Spacing.sm },
  tab: { paddingVertical: 10, paddingHorizontal: Spacing.lg, backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.pill, borderWidth: 1, borderColor: Colors.border },
  tabSel: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  tabText: { color: Colors.onSurfaceSecondary, fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1 },
  tabTextSel: { color: Colors.onBrand },
  sectionTitle: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1 },
  muscleRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  muscleChip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: Colors.surfaceTertiary },
  muscleChipPrimary: { backgroundColor: Colors.brand },
  muscleText: { color: Colors.onSurface, fontFamily: Fonts.semibold, fontSize: 12 },
  muscleTextPrimary: { color: Colors.onBrand, fontFamily: Fonts.bold, fontSize: 12 },
  stepRow: { flexDirection: "row", gap: Spacing.md, backgroundColor: Colors.surfaceSecondary, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.brand, alignItems: "center", justifyContent: "center" },
  stepNumText: { color: Colors.onBrand, fontFamily: Fonts.extrabold, fontSize: 13 },
  stepText: { flex: 1, color: Colors.onSurface, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  tipRow: { flexDirection: "row", gap: Spacing.sm, padding: Spacing.md, backgroundColor: Colors.brandTint, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.brand },
  tipText: { flex: 1, color: Colors.onSurface, fontFamily: Fonts.medium, fontSize: 13, lineHeight: 18 },
  equipCard: { flexDirection: "row", gap: Spacing.md, padding: Spacing.lg, backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, alignItems: "center" },
  equipTitle: { color: Colors.onSurface, fontFamily: Fonts.bold, fontSize: 16, textTransform: "capitalize" },
  equipDesc: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.regular, fontSize: 13, marginTop: 4 },
});
