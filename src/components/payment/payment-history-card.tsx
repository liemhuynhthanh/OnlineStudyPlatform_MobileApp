import { Pressable, StyleSheet, Text, View } from "react-native";
import type { LearnerPaymentTransactionItem } from "../../api/types";
import { Badge, formatDate, formatVnd } from "../ui";
import { PAYMENT_STATUS_SHORT_LABELS, paymentStatusTone } from "./payment-status";
import { colors, radius, spacing } from "../../theme";

export function PaymentHistoryCard({ item, onPress }: { item: LearnerPaymentTransactionItem; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.top}>
        <Text style={styles.title} numberOfLines={2}>{item.courseTitle}</Text>
        <Badge tone={paymentStatusTone(item.status)}>{PAYMENT_STATUS_SHORT_LABELS[item.status]}</Badge>
      </View>
      <View style={styles.bottom}>
        <Text style={styles.amount}>{formatVnd(item.amount)}</Text>
        <Text style={styles.date}>{formatDate(item.paidAt ?? item.createdAt)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  pressed: { opacity: 0.8 },
  top: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.sm },
  title: { flex: 1, color: colors.text, fontSize: 15, fontWeight: "800", lineHeight: 20 },
  bottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  amount: { color: colors.success, fontSize: 16, fontWeight: "800" },
  date: { color: colors.mutedForeground, fontSize: 12 },
});
