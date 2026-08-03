import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Colors, Spacing, Radius, Fonts } from "@/src/theme";
import { useAuth } from "@/src/context/AuthContext";

export default function ProfileTab() {
  const { user, logout, isPremium } = useAuth();
  const router = useRouter();
  const [notifSounds, setNotifSounds] = useState(true);
  const [notifReminders, setNotifReminders] = useState(true);
  const [strava, setStrava] = useState(false);
  const [health, setHealth] = useState(false);

  const doLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color={Colors.brand} />
          </View>
          <Text style={styles.name}>{user?.name || "Convidado"}</Text>
          <Text style={styles.email}>{user?.email || ""}</Text>
          {isPremium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="diamond" size={12} color={Colors.onBrand} />
              <Text style={styles.premiumText}>PREMIUM</Text>
            </View>
          )}
        </View>

        <Section title="Notificações">
          <ToggleRow label="Sons" icon="volume-medium" value={notifSounds} onChange={setNotifSounds} />
          <ToggleRow label="Lembretes de treino" icon="alarm" value={notifReminders} onChange={setNotifReminders} />
          <NavRow label="Widgets" icon="apps" />
        </Section>

        <Section title="Apps conectados">
          <ToggleRow label="Strava" icon="bicycle" value={strava} onChange={setStrava} />
          <ToggleRow label="Apple Saúde / Google Fit" icon="fitness" value={health} onChange={setHealth} />
        </Section>

        <Section title="Geral">
          <NavRow label="Unidades (kg / lb)" icon="options" />
          <NavRow label="Idioma" icon="language" />
          <NavRow label="Restaurar compras" icon="refresh" />
          <NavRow label="Suporte" icon="help-circle" />
        </Section>

        {user && (
          <Pressable onPress={doLogout} style={styles.logout} testID="profile-logout-btn">
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Sair da conta</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: Spacing.lg }}>
      <Text style={styles.section}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function ToggleRow({ label, icon, value, onChange }: { label: string; icon: any; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color={Colors.brand} />
      <Text style={styles.rowText}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: Colors.surfaceTertiary, true: Colors.brand }} thumbColor={Colors.white} />
    </View>
  );
}

function NavRow({ label, icon }: { label: string; icon: any }) {
  return (
    <Pressable style={styles.row}>
      <Ionicons name={icon} size={20} color={Colors.brand} />
      <Text style={styles.rowText}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={Colors.onSurfaceTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  body: { padding: Spacing.lg, paddingBottom: 40 },
  profileHeader: { alignItems: "center", gap: 6, marginBottom: Spacing.xl },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.brandTint, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: Colors.brand },
  name: { color: Colors.onSurface, fontFamily: Fonts.extrabold, fontSize: 22, marginTop: Spacing.sm },
  email: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.medium, fontSize: 13 },
  premiumBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: Colors.brand, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill, marginTop: Spacing.sm },
  premiumText: { color: Colors.onBrand, fontFamily: Fonts.extrabold, fontSize: 10, letterSpacing: 1 },
  section: { color: Colors.onSurfaceTertiary, fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: Spacing.sm },
  sectionBody: { backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.md, paddingVertical: 14, paddingHorizontal: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
  rowText: { flex: 1, color: Colors.onSurface, fontFamily: Fonts.medium, fontSize: 14 },
  logout: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, padding: Spacing.lg, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.error, marginTop: Spacing.md },
  logoutText: { color: Colors.error, fontFamily: Fonts.bold, fontSize: 14 },
});
