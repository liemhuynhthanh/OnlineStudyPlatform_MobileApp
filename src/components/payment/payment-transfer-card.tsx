import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { CheckoutResult } from "../../api/types";
import { Button, Card, formatVnd } from "../ui";
import { colors, radius, spacing } from "../../theme";

export function PaymentTransferCard({ transaction }: { transaction: CheckoutResult }) {
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const memo = `SEVQR ${transaction.paymentCode}`;

  async function copyMemo() {
    const clipboard = typeof navigator === "undefined" ? undefined : (navigator as Navigator & { clipboard?: { writeText: (value: string) => Promise<void> } }).clipboard;
    if (!clipboard?.writeText) {
      setCopyNotice("Nhấn giữ nội dung để sao chép thủ công.");
      return;
    }
    try {
      await clipboard.writeText(memo);
      setCopyNotice("Đã sao chép mã thanh toán.");
    } catch {
      setCopyNotice("Không thể sao chép mã thanh toán.");
    }
  }

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Hãy chuyển khoản đúng số tiền {formatVnd(transaction.amount)} và nội dung bắt buộc bắt đầu bằng SEVQR.</Text>
      {transaction.qrImageUrl ? <Image accessibilityLabel="Mã QR chuyển khoản" source={{ uri: transaction.qrImageUrl }} style={styles.qr} /> : null}
      <View style={styles.row}><Text style={styles.label} numberOfLines={1}>Ngân hàng</Text><Text style={styles.value} numberOfLines={1}>{transaction.bankCode || "—"}</Text></View>
      <View style={styles.row}><Text style={styles.label} numberOfLines={1}>Số tài khoản</Text><Text style={styles.value} numberOfLines={1}>{transaction.bankAccount || "—"}</Text></View>
      <View style={styles.row}><Text style={styles.label} numberOfLines={1}>Chủ tài khoản</Text><Text style={styles.value} numberOfLines={1}>{transaction.bankHolder || "—"}</Text></View>
      <View style={styles.row}><Text style={styles.label} numberOfLines={1}>Số tiền</Text><Text style={styles.valueStrong} numberOfLines={1}>{formatVnd(transaction.amount)}</Text></View>
      <View style={styles.memoBlock}>
        <Text style={styles.label} numberOfLines={1}>Nội dung chuyển khoản</Text>
        <Text selectable style={styles.memo}>{memo}</Text>
        <Button title="Sao chép mã thanh toán" variant="secondary" onPress={() => void copyMemo()} />
        {copyNotice ? <Text style={styles.notice}>{copyNotice}</Text> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  title: { color: colors.text, fontSize: 15, lineHeight: 22 },
  qr: { width: "100%", aspectRatio: 1, maxHeight: 280, alignSelf: "center", borderRadius: radius.md, backgroundColor: colors.surface },
  row: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md, paddingVertical: 4 },
  label: { color: colors.mutedForeground, fontSize: 14, flexShrink: 1 },
  value: { flex: 1, minWidth: 0, color: colors.text, fontSize: 14, fontWeight: "700", textAlign: "right" },
  valueStrong: { flex: 1, minWidth: 0, color: colors.success, fontSize: 15, fontWeight: "800", textAlign: "right" },
  memoBlock: { gap: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  memo: { padding: spacing.md, borderRadius: radius.sm, backgroundColor: colors.softBlue, color: colors.primaryDark, fontSize: 16, fontWeight: "800", textAlign: "center" },
  notice: { color: colors.mutedForeground, fontSize: 12, textAlign: "center" },
});
