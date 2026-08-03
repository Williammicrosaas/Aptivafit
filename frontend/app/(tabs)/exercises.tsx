import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Radius, Fonts } from "@/src/theme";
import { api } from "@/src/api/client";

type E = { name: string; group: string; equip: string; level: string };

export default function ExercisesTab() {
  const [items, setItems] = useState<E[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    api<{ exercises: E[] }>("/exercises").then((r) => setItems(r.exercises)).catch(() => {});
  }, []);

  const grouped = items
    .filter((e) => !q || e.name.toLowerCase().includes(q.toLowerCase()))
    .reduce<Record<string, E[]>>((acc, e) => {
      (acc[e.group] ||= []).push(e);
      return acc;
    }, {});

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>EXERCÍCIOS</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.onSurfaceTertiary} />
          <TextInput
            placeholder="Buscar exercício..."
            placeholderTextColor={Colors.onSurfaceTertiary}
            value={q}
            onChangeText={setQ}
            style={styles.searchInput}
            testID="exercise-search"
          />
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {Object.entries(grouped).map(([group, list]) => (
          <View key={group} style={{ marginBottom: Spacing.lg }}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupTitle}>{group}</Text>
              <Text style={styles.groupCount}>{list.length} exercícios</Text>
            </View>
            {list.map((e, i) => (
              <Pressable key={i} style={styles.exRow} testID={`ex-item-${e.name}`}>
                <View style={styles.exIcon}>
                  <Ionicons name="barbell" size={18} color={Colors.brand} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exName}>{e.name}</Text>
                  <Text style={styles.exMeta}>{e.level} · {e.equip}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.onSurfaceTertiary} />
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  header: { padding: Spacing.lg, gap: Spacing.md },
  title: { color: Colors.onSurface, fontFamily: Fonts.display, fontSize: 32, letterSpacing: 1 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.md, paddingHorizontal: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, color: Colors.onSurface, fontFamily: Fonts.medium, fontSize: 14, paddingVertical: 14 },
  body: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  groupHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: Spacing.sm },
  groupTitle: { color: Colors.onSurface, fontFamily: Fonts.bold, fontSize: 16 },
  groupCount: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.medium, fontSize: 11 },
  exRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md, padding: Spacing.md, backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.md, marginBottom: 6, borderWidth: 1, borderColor: Colors.border },
  exIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: Colors.brandTint, alignItems: "center", justifyContent: "center" },
  exName: { color: Colors.onSurface, fontFamily: Fonts.bold, fontSize: 13 },
  exMeta: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.medium, fontSize: 11, marginTop: 2, textTransform: "capitalize" },
});
