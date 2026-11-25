import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../theme";

type Shortcut = {
  label: string;
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
};

const SHORTCUTS: Shortcut[] = [
  { label: "Giỏ hàng", hint: "Khóa học trả phí", icon: "cart-outline", href: "/cart" },
  { label: "Thanh toán", hint: "Lịch sử giao dịch", icon: "receipt-outline", href: "/payments" },
  { label: "Chứng chỉ", hint: "Chứng chỉ đã cấp", icon: "ribbon-outline", href: "/certificates" },
  { label: "Thông báo", hint: "Tin nhắn và cập nhật", icon: "notifications-outline", href: "/notifications" },
];

function ShortcutCard({ shortcut }: { shortcut: Shortcut }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={shortcut.label} accessibilityHint={shortcut.hint} onPress={() => router.push(shortcut.href as Href)} style={({ pressed }) => [styles.shortcut, pressed && styles.pressed]}>
      <View style={styles.icon}><Ionicons name={shortcut.icon} size={21} color={colors.primary} /></View>
      <View style={styles.copy}>
        <Text style={styles.label} numberOfLines={2}>{shortcut.label}</Text>
        <Text style={styles.hint} numberOfLines={2}>{shortcut.hint}</Text>
      </View>
    </Pressable>
  );
}

export function LearnerShortcuts() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <ShortcutCard shortcut={SHORTCUTS[0]} />
        <ShortcutCard shortcut={SHORTCUTS[1]} />
      </View>
      <View style={styles.row}>
        <ShortcutCard shortcut={SHORTCUTS[2]} />
        <ShortcutCard shortcut={SHORTCUTS[3]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  row: { flexDirection: "row", gap: spacing.sm },
  shortcut: { flex: 1, minWidth: 0, minHeight: 112, alignItems: "flex-start", gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  pressed: { opacity: 0.75 },
  icon: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: colors.softBlue },
  copy: { alignSelf: "stretch", gap: 2 },
  label: { color: colors.text, fontSize: 15, lineHeight: 20, fontWeight: "800" },
  hint: { color: colors.mutedForeground, fontSize: 12, lineHeight: 16 },
});
