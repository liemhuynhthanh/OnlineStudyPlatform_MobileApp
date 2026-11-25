import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { getApiErrorMessage } from "../api/client";
import { checkoutCart, getCart } from "../api/services";
import { useAuth } from "../context/auth-context";
import { Alert, Badge, Button, Card, EmptyState, ErrorState, Header, Screen, SectionHeading, Skeleton, formatVnd } from "../components/ui";
import { colors, spacing } from "../theme";

const CART_REVIEW_LIMIT = 100;
const filters = { page: 1, limit: CART_REVIEW_LIMIT };

export default function Checkout() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const cartQuery = useQuery({ queryKey: ["cart", "list", filters], queryFn: () => getCart(filters) });
  const checkout = useMutation({
    mutationFn: checkoutCart,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      router.replace({ pathname: "/payment/[transactionId]", params: { transactionId: result.id } });
    },
  });
  const cart = cartQuery.data;

  return (
    <Screen>
      <Header canGoBack fallbackHref="/cart" />
      <SectionHeading eyebrow="Thanh toán" title="Kiểm tra đơn hàng" />
      <Text style={styles.description}>Kiểm tra khóa học và thông tin tài khoản. Bạn sẽ chuyển sang màn hình QR sau khi xác nhận.</Text>
      {cartQuery.isLoading ? (
        <>
          <Skeleton height={92} />
          <Skeleton height={92} />
          <Skeleton height={92} />
        </>
      ) : cartQuery.isError || !cart ? (
        <ErrorState message="Không thể tải đơn hàng. Vui lòng quay lại giỏ hàng và thử lại." onRetry={() => void cartQuery.refetch()} />
      ) : cart.items.length === 0 ? (
        <EmptyState icon="cart-outline" title="Giỏ hàng đang trống" message="Vui lòng thêm khóa học trước khi thanh toán." actionLabel="Về giỏ hàng" onAction={() => router.replace("/cart")} />
      ) : (
        <>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Thông tin thanh toán</Text>
            <Text style={styles.label}>Tài khoản học viên</Text>
            <Text style={styles.value}>{user?.name ?? "Học viên"}</Text>
            <Text style={styles.value}>{user?.email ?? "Tài khoản hiện tại"}</Text>
          </Card>
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Khóa học trong đơn</Text>
            {cart.items.map((item) => (
              <View key={item.id} style={styles.courseRow}>
                {item.course.thumbnail ? <Image source={{ uri: item.course.thumbnail }} style={styles.thumbnail} /> : <View style={[styles.thumbnail, styles.placeholder]} />}
                <View style={styles.courseCopy}>
                  <Badge>{item.course.category}</Badge>
                  <Text style={styles.courseTitle} numberOfLines={2}>{item.course.title}</Text>
                  <Text style={styles.coursePrice}>{formatVnd(item.course.price)}</Text>
                </View>
              </View>
            ))}
          </Card>
          <Card style={styles.card}>
            <Text style={styles.label}>Tổng thanh toán</Text>
            <Text style={styles.total}>{formatVnd(cart.summary.totalPrice)}</Text>
            <Alert tone="info" title="Kiểm tra lại giá" message="Giá khóa học sẽ được kiểm tra lại khi tạo đơn. Hệ thống từ chối nếu có khóa học đã đăng ký hoặc không còn khả dụng." />
            {checkout.isError ? <Alert tone="danger" title="Không thể tạo đơn" message={getApiErrorMessage(checkout.error)} /> : null}
            <Button title={checkout.isPending ? "Đang tạo đơn..." : "Tiếp tục thanh toán"} loading={checkout.isPending} disabled={checkout.isPending} onPress={() => { if (!checkout.isPending) checkout.mutate(); }} />
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  description: { color: colors.mutedForeground, fontSize: 14, lineHeight: 20 },
  card: { gap: spacing.sm },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: "800" },
  label: { color: colors.mutedForeground, fontSize: 13 },
  value: { color: colors.text, fontSize: 15, fontWeight: "700" },
  courseRow: { flexDirection: "row", gap: spacing.md, paddingVertical: spacing.sm },
  thumbnail: { width: 64, height: 64, borderRadius: 12, backgroundColor: colors.softBlue },
  placeholder: { alignItems: "center", justifyContent: "center" },
  courseCopy: { flex: 1, gap: 5 },
  courseTitle: { color: colors.text, fontSize: 15, fontWeight: "700", lineHeight: 20 },
  coursePrice: { color: colors.success, fontSize: 14, fontWeight: "800" },
  total: { color: colors.success, fontSize: 28, fontWeight: "800" },
});
