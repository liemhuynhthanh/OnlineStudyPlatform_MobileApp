import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import type { LearnerDashboard } from "../api/types";
import { getApiErrorMessage } from "../api/client";
import { getDashboard, listMyCertificates } from "../api/services";
import { CertificateCard } from "../components/certificates/certificate-card";
import { PaginationRow } from "../components/catalog/pagination-row";
import { Alert, EmptyState, ErrorState, Header, Screen, SectionHeading, Skeleton } from "../components/ui";
import { useLocalPagination } from "../hooks/use-local-pagination";
import { downloadCertificatePdf } from "../utils/download-certificate";
import { colors } from "../theme";

export default function Certificates() {
  const queryClient = useQueryClient();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const dashboardQuery = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard });
  const certificatesQuery = useQuery({
    queryKey: ["certificates", "learner"],
    queryFn: listMyCertificates,
    refetchInterval: (query) => {
      const issuedCourseIds = new Set((query.state.data ?? []).map((item) => item.courseId));
      const dashboard = queryClient.getQueryData<LearnerDashboard>(["dashboard"]);
      const pending = dashboard?.courses.some((course) => course.status === "completed" && !issuedCourseIds.has(course.courseId)) ?? false;
      return pending ? 10_000 : false;
    },
  });
  const download = useMutation({
    mutationFn: (id: string) => downloadCertificatePdf(id),
    onMutate: (id) => { setDownloadError(null); setDownloadingId(id); },
    onError: (error) => setDownloadError(getApiErrorMessage(error)),
    onSettled: () => setDownloadingId(null),
  });
  const certificates = certificatesQuery.data ?? [];
  const pagination = useLocalPagination(certificates);
  const issuedCourseIds = new Set(certificates.map((item) => item.courseId));
  const pendingCertificate = dashboardQuery.data?.courses.some((course) => course.status === "completed" && !issuedCourseIds.has(course.courseId)) ?? false;

  return (
    <Screen>
      <Header canGoBack fallbackHref="/(tabs)/my-learning" />
      <SectionHeading eyebrow="Học tập" title="Chứng chỉ của tôi" />
      <Text style={styles.description}>Xem lại các chứng chỉ đã được cấp sau khi hoàn thành khóa học.</Text>
      {certificatesQuery.isLoading ? (
        <>
          <Skeleton height={150} />
          <Skeleton height={150} />
        </>
      ) : certificatesQuery.isError ? (
        <ErrorState message="Không tải được chứng chỉ. Vui lòng thử lại." onRetry={() => void certificatesQuery.refetch()} />
      ) : certificates.length === 0 ? (
        <EmptyState icon="ribbon-outline" title="Chưa có chứng chỉ" message="Hoàn thành khóa học để nhận chứng chỉ. Chứng chỉ sẽ xuất hiện tại đây sau khi được cấp." />
      ) : (
        <>
          {pendingCertificate ? <Alert tone="info" title="Chứng chỉ đang được xử lý" message="Chứng chỉ cho khóa học đã hoàn thành đang được xử lý. Màn hình sẽ tự cập nhật." /> : null}
          {downloadError ? <Alert tone="danger" title="Không thể tải chứng chỉ" message={downloadError} /> : null}
          {pagination.visibleItems.map((item) => <CertificateCard key={item.id} item={item} downloading={downloadingId === item.id} onDownload={() => { if (!download.isPending) download.mutate(item.id); }} />)}
          {pagination.totalPages > 1 ? <PaginationRow page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onChange={pagination.setPage} /> : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({ description: { color: colors.mutedForeground, fontSize: 14, lineHeight: 20 } });
