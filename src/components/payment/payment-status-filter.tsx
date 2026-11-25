import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import type { PaymentStatus } from "../../api/types";
import { PAYMENT_STATUS_SHORT_LABELS } from "./payment-status";
import { colors, radius, spacing } from "../../theme";

export type PaymentStatusFilterValue = PaymentStatus | "all";

const OPTIONS: PaymentStatusFilterValue[] = ["all", "pending", "paid", "failed", "cancelled", "expired", "refunded"];
const LABELS: Record<PaymentStatusFilterValue, string> = { all: "Tất cả", ...PAYMENT_STATUS_SHORT_LABELS };

export function PaymentStatusFilter({ value, onChange }: { value: PaymentStatusFilterValue; onChange: (value: PaymentStatusFilterValue) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
      {OPTIONS.map((option) => (
        <Pressable
          key={option}
          accessibilityRole="button"
          accessibilityLabel={`Lọc ${LABELS[option]}`}
          onPress={() => onChange(option)}
          style={({ pressed }) => [styles.chip, value === option && styles.chipActive, pressed && styles.chipPressed]}
        >
          <Text style={[styles.label, value === option && styles.labelActive]}>{LABELS[option]}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.sm, paddingVertical: spacing.xs },
  chip: { minHeight: 38, paddingHorizontal: spacing.md, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.softBlue },
  chipPressed: { opacity: 0.75 },
  label: { color: colors.mutedForeground, fontSize: 13, fontWeight: "700" },
  labelActive: { color: colors.primaryDark },
});
