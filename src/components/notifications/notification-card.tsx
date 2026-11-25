import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NotificationItem } from "../../api/types";
import { colors, radius, spacing } from "../../theme";

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
}

export function NotificationCard({ item, onPress }: { item: NotificationItem; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, !item.seen && styles.unseen, pressed && styles.pressed]}>
      <View style={styles.top}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        {!item.seen ? <View style={styles.dot} /> : null}
      </View>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.date}>{formatDateTime(item.sentAt)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  unseen: { borderColor: colors.primary, backgroundColor: colors.softBlue },
  pressed: { opacity: 0.8 },
  top: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  title: { flex: 1, color: colors.text, fontSize: 15, fontWeight: "800", lineHeight: 20 },
  dot: { width: 8, height: 8, marginTop: 6, borderRadius: 4, backgroundColor: colors.primary },
  message: { color: colors.mutedForeground, fontSize: 14, lineHeight: 20 },
  date: { color: colors.muted, fontSize: 12 },
});
