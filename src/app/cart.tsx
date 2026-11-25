import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { getApiErrorMessage } from "../api/client";
import { getCart, removeFromCart } from "../api/services";
import { CartItemCard } from "../components/cart/cart-item-card";
import { CartSummary } from "../components/cart/cart-summary";
import { PaginationRow } from "../components/catalog/pagination-row";
import { Alert, Button, EmptyState, ErrorState, Header, Screen, SectionHeading, Skeleton } from "../components/ui";

const CART_PAGE_LIMIT = 10;

export default function Cart() {
  const queryClient = useQueryClient();
  const [requestedPage, setRequestedPage] = useState(1);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const filters = { page: requestedPage, limit: CART_PAGE_LIMIT };
  const cartQuery = useQuery({ queryKey: ["cart", "list", filters], queryFn: () => getCart(filters) });
  const page = Math.min(requestedPage, cartQuery.data?.totalPages ?? requestedPage);
  const removal = useMutation({
    mutationFn: (courseId: string) => removeFromCart(courseId),
    onMutate: (courseId) => { setRemoveError(null); setRemovingId(courseId); },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      if ((cartQuery.data?.items.length ?? 0) === 1 && requestedPage > 1) setRequestedPage(requestedPage - 1);
    },
    onError: (error) => setRemoveError(getApiErrorMessage(error)),
    onSettled: () => setRemovingId(null),
  });
  const cart = cartQuery.data;

  return (
    <Screen>
      <Header canGoBack fallbackHref="/(tabs)/courses" />
      <SectionHeading eyebrow="Thanh toán" title="Giỏ hàng của tôi" />
      {cartQuery.isLoading ? (
        <>
          <Skeleton height={112} />
          <Skeleton height={112} />
          <Skeleton height={112} />
        </>
      ) : cartQuery.isError || !cart ? (
        <ErrorState message="Không thể tải giỏ hàng. Vui lòng thử lại." onRetry={() => void cartQuery.refetch()} />
      ) : cart.items.length === 0 ? (
        <EmptyState icon="cart-outline" title="Giỏ hàng đang trống" message="Hãy khám phá danh mục khóa học và thêm khóa học trả phí vào giỏ hàng." actionLabel="Tiếp tục xem khóa học" onAction={() => router.push("/(tabs)/courses")} />
      ) : (
        <>
          {removeError ? <Alert tone="danger" title="Không thể xóa khóa học" message={removeError} /> : null}
          {cart.items.map((item) => <CartItemCard key={item.id} item={item} removing={removingId === item.courseId} onRemove={() => { if (!removal.isPending) removal.mutate(item.courseId); }} />)}
          <PaginationRow page={page} totalPages={cart.totalPages} total={cart.total} onChange={setRequestedPage} />
          <CartSummary totalItems={cart.summary.totalItems} totalPrice={cart.summary.totalPrice} onCheckout={() => router.push("/checkout")} />
          <Button title="Tiếp tục xem khóa học" variant="secondary" onPress={() => router.push("/(tabs)/courses")} />
        </>
      )}
    </Screen>
  );
}
