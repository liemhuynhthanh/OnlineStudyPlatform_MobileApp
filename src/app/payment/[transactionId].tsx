import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert as NativeAlert, StyleSheet, Text, View } from "react-native";
import { getApiErrorMessage } from "../../api/client";
import { cancelPaymentTransaction, getPaymentTransaction } from "../../api/services";
import { PaymentCountdown } from "../../components/payment/payment-countdown";
import { PaymentTransferCard } from "../../components/payment/payment-transfer-card";
import { PAYMENT_STATUS_SHORT_LABELS, paymentStatusTone } from "../../components/payment/payment-status";
import { Alert, Badge, Button, Card, Header, Screen, SectionHeading, Skeleton, formatVnd } from "../../components/ui";
import { colors, spacing } from "../../theme";

const TERMINAL_COPY: Record<string, string> = {
  failed: "Giao dịch thanh toán thất bại. Vui lòng kiểm tra nội dung chuyển khoản và tạo đơn mới nếu cần.",
  cancelled: "Bạn đã hủy giao dịch này. Vui lòng quay lại giỏ hàng để tiếp tục.",
  expired: "Đơn thanh toán đã hết hạn. Số tiền chưa được ghi nhận sẽ không tự động mở khóa khóa học.",
  refunded: "Giao dịch đã được hoàn tiền. Liên hệ hỗ trợ nếu bạn cần thêm thông tin.",
};

export default function PaymentCheckout() {
  const params = useLocalSearchParams<{ transactionId: string | string[] }>();
  const transactionId = Array.isArray(params.transactionId) ? params.transactionId[0] ?? "" : params.transactionId ?? "";
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const transactionQuery = useQuery({
    queryKey: ["payments", "transaction", transactionId],
    queryFn: () => getPaymentTransaction(transactionId),
    enabled: Boolean(transactionId),
    refetchInterval: (query) => query.state.data?.status === "pending" ? 5_000 : false,
  });
  const cancel = useMutation({
    mutationFn: (id: string) => cancelPaymentTransaction(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["payments", "transaction", transactionId] }),
        queryClient.invalidateQueries({ queryKey: ["payments", "learner-transactions"] }),
        queryClient.invalidateQueries({ queryKey: ["cart"] }),
      ]);
    },
    onError: (error) => setActionError(getApiErrorMessage(error)),
  });
  const handleExpire = useCallback(() => { void transactionQuery.refetch(); }, [transactionQuery]);

  function handleCancel(id: string) {
    NativeAlert.alert("Chắc chắn hủy thanh toán?", "Giao dịch sẽ bị hủy và bạn cần tạo đơn mới để tiếp tục.", [
      { text: "Không", style: "cancel" },
      { text: "Hủy thanh toán", style: "destructive", onPress: () => { setActionError(null); cancel.mutate(id); } },
    ]);
  }

  if (transactionQuery.isLoading) return <Screen><Header title="Thanh toán" canGoBack fallbackHref="/cart" /><Skeleton height={180} /><Skeleton height={260} /></Screen>;
  if (transactionQuery.isError || !transactionQuery.data) {
    return <Screen><Header title="Thanh toán" canGoBack fallbackHref="/payments" /><Card style={styles.card}><Text style={styles.errorTitle}>Không thể tải giao dịch</Text><Text style={styles.errorBody}>Giao dịch không tồn tại, đã bị xóa hoặc bạn không có quyền truy cập.</Text><Button title="Xem lịch sử thanh toán" onPress={() => router.replace("/payments")} /></Card></Screen>;
  }

  const transaction = transactionQuery.data;
  const paid = transaction.status === "paid";
  const pending = transaction.status === "pending";
  const firstCourseId = transaction.orderItems[0]?.courseId;

  return (
    <Screen>
      <Header title="Thanh toán" canGoBack fallbackHref="/payments" />
      <SectionHeading eyebrow="Thanh toán" title="Chuyển khoản để mở khóa khóa học" />
      <Card style={styles.card}>
        <View style={styles.row}><Text style={styles.label}>Số tiền cần thanh toán</Text><Text style={styles.amount}>{formatVnd(transaction.amount)}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Khóa học trong đơn</Text><Text style={styles.value}>{`${transaction.orderItems.length} khóa học`}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Trạng thái</Text><Badge tone={paymentStatusTone(transaction.status)}>{PAYMENT_STATUS_SHORT_LABELS[transaction.status]}</Badge></View>
        {pending ? <PaymentCountdown key={transaction.id} expiresAt={transaction.expiresAt} onExpire={handleExpire} /> : null}
      </Card>

      {paid ? (
        <Card style={styles.card}>
          <Alert tone="success" title="Đã xác nhận thanh toán" message="Đơn thanh toán đã được xác nhận và khóa học đã được mở." />
          <Button title="Vào khóa học" onPress={() => {
            if (transaction.orderItems.length === 1 && firstCourseId) router.replace({ pathname: "/learn/[courseId]", params: { courseId: firstCourseId } });
            else router.replace("/(tabs)/my-learning");
          }} />
        </Card>
      ) : pending ? (
        <>
          <PaymentTransferCard transaction={transaction} />
          {actionError ? <Alert tone="danger" title="Không thể hủy giao dịch" message={actionError} /> : null}
          <Button title="Hủy thanh toán" variant="danger" loading={cancel.isPending} disabled={cancel.isPending} onPress={() => handleCancel(transaction.id)} />
        </>
      ) : (
        <Card style={styles.card}>
          <Alert tone="warning" title="Không thể hoàn tất thanh toán" message={TERMINAL_COPY[transaction.status] ?? "Giao dịch không thể tiếp tục."} />
          {transaction.status === "expired" ? <Button title="Quay lại giỏ hàng" variant="secondary" onPress={() => router.replace("/cart")} /> : <Button title="Xem lịch sử thanh toán" variant="secondary" onPress={() => router.replace("/payments")} />}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  label: { color: colors.mutedForeground, fontSize: 14 },
  value: { color: colors.text, fontSize: 14, fontWeight: "700" },
  amount: { color: colors.success, fontSize: 20, fontWeight: "800" },
  errorTitle: { color: colors.danger, fontSize: 17, fontWeight: "800" },
  errorBody: { color: colors.mutedForeground, fontSize: 14, lineHeight: 20 },
});
