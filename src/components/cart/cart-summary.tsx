import { StyleSheet, Text } from "react-native";
import { Button, Card, formatVnd } from "../ui";
import { colors, spacing } from "../../theme";

export function CartSummary({ totalItems, totalPrice, onCheckout }: { totalItems: number; totalPrice: number; onCheckout: () => void }) {
  return (
    <Card style={styles.card}>
      <Text style={styles.label}>Tổng tạm tính</Text>
      <Text style={styles.total}>{formatVnd(totalPrice)}</Text>
      <Text style={styles.hint}>{`${totalItems} khóa học trên trang này`}</Text>
      <Button title="Xem lại đơn hàng" onPress={onCheckout} disabled={totalItems === 0} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  label: { color: colors.mutedForeground, fontSize: 14 },
  total: { color: colors.success, fontSize: 26, fontWeight: "800" },
  hint: { color: colors.muted, fontSize: 12 },
});
