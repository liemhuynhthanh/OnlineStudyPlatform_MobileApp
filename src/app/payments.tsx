import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import type { LearnerPaymentTransactionFilters } from "../api/types";
import { listMyPaymentTransactions } from "../api/services";
import { PaginationRow } from "../components/catalog/pagination-row";
import { PaymentHistoryCard } from "../components/payment/payment-history-card";
import { PaymentStatusFilter, type PaymentStatusFilterValue } from "../components/payment/payment-status-filter";
import { EmptyState, ErrorState, Header, Screen, SectionHeading, Skeleton } from "../components/ui";

const HISTORY_PAGE_LIMIT = 10;

export default function PaymentHistory() {
  const [status, setStatus] = useState<PaymentStatusFilterValue>("all");
  const [requestedPage, setRequestedPage] = useState(1);
  const filters: LearnerPaymentTransactionFilters = {
    ...(status === "all" ? {} : { status }),
    page: requestedPage,
    limit: HISTORY_PAGE_LIMIT,
  };
  const historyQuery = useQuery({ queryKey: ["payments", "learner-transactions", filters], queryFn: () => listMyPaymentTransactions(filters) });
  const page = Math.min(requestedPage, historyQuery.data?.totalPages ?? requestedPage);

  function handleStatusChange(next: PaymentStatusFilterValue) {
    setStatus(next);
    setRequestedPage(1);
  }

  return (
    <Screen>
      <Header title="Lịch sử thanh toán" canGoBack fallbackHref="/(tabs)/my-learning" />
      <SectionHeading eyebrow="Học tập" title="Lịch sử thanh toán" />
      <PaymentStatusFilter value={status} onChange={handleStatusChange} />
      {historyQuery.isLoading ? (
        <>
          <Skeleton height={90} />
          <Skeleton height={90} />
          <Skeleton height={90} />
        </>
      ) : historyQuery.isError || !historyQuery.data ? (
        <ErrorState message="Không thể tải lịch sử thanh toán. Vui lòng thử lại." onRetry={() => void historyQuery.refetch()} />
      ) : historyQuery.data.items.length === 0 ? (
        <EmptyState icon="receipt-outline" title="Chưa có giao dịch nào" message="Các đơn thanh toán của bạn sẽ xuất hiện ở đây." actionLabel="Về khóa học" onAction={() => router.replace("/(tabs)/courses")} />
      ) : (
        <>
          {historyQuery.data.items.map((item) => <PaymentHistoryCard key={item.id} item={item} onPress={() => router.push({ pathname: "/payment/[transactionId]", params: { transactionId: item.id } })} />)}
          <PaginationRow page={page} totalPages={historyQuery.data.totalPages} total={historyQuery.data.total} onChange={setRequestedPage} />
        </>
      )}
    </Screen>
  );
}
