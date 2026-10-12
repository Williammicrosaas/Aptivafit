import React, { useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, TextInput, FlatList } from "react-native";
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
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (ex: Ex) => void;
};

export function AddExerciseModal({ visible, onClose, onSelect }: Props) {
  const [all, setAll] = useState<Ex[]>([]);
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<string | null>(null);
  const [groups, setGroups] = useState<string[]>([]);

  useEffect(() => {
    if (!visible) return;
    api<{ exercises: Ex[]; groups: string[] }>("/exercises")
      .then((r) => { setAll(r.exercises); setGroups(r.groups); })
      .catch(() => {});
  }, [visible]);

  const filtered = useMemo(() => {
    return all.filter((e) => {
      if (group && e.group !== group) return false;
      if (q && !e.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [all, q, group]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={16} testID="add-ex-close">
            <Ionicons name="close" size={26} color={Colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>Adicionar exercício</Text>
          <View style={{ width: 26 }} />
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.onSurfaceTertiary} />
          <TextInput
            placeholder="Buscar por nome..."
            placeholderTextColor={Colors.onSurfaceTertiary}
            value={q}
            onChangeText={setQ}
            style={styles.searchInput}
            testID="add-ex-search"
          />
          {q ? (
            <Pressable onPress={() => setQ("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={Colors.onSurfaceTertiary} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          <Chip label="Todos" selected={group === null} onPress={() => setGroup(null)} />
          {groups.map((g) => (
            <Chip key={g} label={g} selected={group === g} onPress={() => setGroup(g)} />
          ))}
        </ScrollView>

        <FlatList
          data={filtered}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.list}
          numColumns={2}
          columnWrapperStyle={{ gap: Spacing.md }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => { onSelect(item); onClose(); }}
              testID={`add-ex-item-${item.id}`}
            >
              <ExerciseThumb images={item.images} size={148} intervalMs={900} />
              <View style={styles.cardBody}>
                <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.cardMeta}>{item.group}</Text>
              </View>
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        />
      </SafeAreaView>
    </Modal>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSel]}
      testID={`add-ex-chip-${label}`}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: Spacing.lg },
  title: { color: Colors.onSurface, fontFamily: Fonts.bold, fontSize: 16 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.md, paddingHorizontal: Spacing.md, marginHorizontal: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, color: Colors.onSurface, fontFamily: Fonts.medium, fontSize: 14, paddingVertical: 14 },
  chipsRow: { gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, height: 56, alignItems: "center" },
  chip: {
    flexShrink: 0,
    height: 36,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
  },
  chipSel: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  chipText: { color: Colors.onSurfaceSecondary, fontFamily: Fonts.semibold, fontSize: 13 },
  chipTextSel: { color: Colors.onBrand },
  list: { padding: Spacing.lg, paddingBottom: 40, gap: Spacing.md },
  card: { flex: 1, backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: "hidden" },
  cardBody: { padding: Spacing.md },
  cardName: { color: Colors.onSurface, fontFamily: Fonts.bold, fontSize: 13, minHeight: 34 },
  cardMeta: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.medium, fontSize: 11, marginTop: 2 },
});
