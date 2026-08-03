import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Radius, Fonts } from "@/src/theme";

export default function WorkoutsTab() {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg }} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>TREINOS</Text>
        <Text style={styles.sub}>Explore treinos rápidos e planos por nível.</Text>

        <View style={styles.actionRow}>
          <View style={[styles.actionCard, { backgroundColor: Colors.brand }]}>
            <Ionicons name="flash" size={24} color={Colors.onBrand} />
            <Text style={[styles.actionTitle, { color: Colors.onBrand }]}>Treino rápido</Text>
            <Text style={[styles.actionDesc, { color: Colors.onBrand }]}>20 min · qualquer local</Text>
          </View>
          <View style={styles.actionCard}>
            <Ionicons name="hammer" size={24} color={Colors.brand} />
            <Text style={styles.actionTitle}>Criar personalizado</Text>
            <Text style={styles.actionDesc}>Do zero, do seu jeito</Text>
          </View>
        </View>

        <Text style={styles.section}>Iniciante · Rápidos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.md }}>
          {["Peito Express", "Costas em 20min", "Pernas Total"].map((t) => (
            <View key={t} style={styles.workoutCard}>
              <View style={styles.workoutImg}>
                <Ionicons name="barbell" size={32} color={Colors.brand} />
              </View>
              <Text style={styles.workoutTitle}>{t}</Text>
              <Text style={styles.workoutMeta}>Iniciante · 20 min</Text>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.section}>Planos para iniciante</Text>
        {["Full Body 3x", "ABC 4 dias", "PPL 5 dias"].map((t) => (
          <View key={t} style={styles.planItem}>
            <Ionicons name="calendar" size={22} color={Colors.brand} />
            <View style={{ flex: 1 }}>
              <Text style={styles.workoutTitle}>{t}</Text>
              <Text style={styles.workoutMeta}>Plano completo · 4 semanas</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.onSurfaceTertiary} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  title: { color: Colors.onSurface, fontFamily: Fonts.display, fontSize: 32, letterSpacing: 1 },
  sub: { color: Colors.onSurfaceSecondary, fontFamily: Fonts.regular, fontSize: 14, marginTop: 4, marginBottom: Spacing.lg },
  actionRow: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.xl },
  actionCard: { flex: 1, padding: Spacing.lg, borderRadius: Radius.lg, backgroundColor: Colors.surfaceSecondary, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm, minHeight: 130 },
  actionTitle: { color: Colors.onSurface, fontFamily: Fonts.bold, fontSize: 15, marginTop: Spacing.sm },
  actionDesc: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.medium, fontSize: 12 },
  section: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: Spacing.md, marginTop: Spacing.lg },
  workoutCard: { width: 200, padding: Spacing.md, backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  workoutImg: { height: 90, backgroundColor: Colors.brandTint, borderRadius: Radius.sm, alignItems: "center", justifyContent: "center", marginBottom: Spacing.sm },
  workoutTitle: { color: Colors.onSurface, fontFamily: Fonts.bold, fontSize: 14 },
  workoutMeta: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.medium, fontSize: 11, marginTop: 2 },
  planItem: { flexDirection: "row", alignItems: "center", gap: Spacing.md, padding: Spacing.md, backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
});
