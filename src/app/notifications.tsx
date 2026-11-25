import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, type Href } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { getApiErrorMessage } from "../api/client";
import { getUnreadNotificationCount, listNotifications, markAllNotificationsSeen, markNotificationSeen } from "../api/services";
import { PaginationRow } from "../components/catalog/pagination-row";
import { NotificationCard } from "../components/notifications/notification-card";
import { Alert, EmptyState, ErrorState, Header, Screen, SectionHeading, Skeleton } from "../components/ui";
import { colors } from "../theme";
import { mapNotificationActionUrl } from "../utils/notification-deeplink";

const NOTIFICATION_PAGE_LIMIT = 10;

export default function Notifications() {
  const queryClient = useQueryClient();
  const [requestedPage, setRequestedPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);
  const filters = { page: requestedPage, limit: NOTIFICATION_PAGE_LIMIT };
  const notificationsQuery = useQuery({ queryKey: ["notifications", "list", filters], queryFn: () => listNotifications(filters) });
  const unreadQuery = useQuery({ queryKey: ["notifications", "unread-count"], queryFn: getUnreadNotificationCount });
  const refreshNotificationQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["notifications", "list"] }),
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] }),
    ]);
  };
  const markSeen = useMutation({
    mutationFn: (id: string) => markNotificationSeen(id),
    onSuccess: refreshNotificationQueries,
    onError: (error) => setActionError(getApiErrorMessage(error)),
  });
  const markAll = useMutation({
    mutationFn: markAllNotificationsSeen,
    onSuccess: refreshNotificationQueries,
    onError: (error) => setActionError(getApiErrorMessage(error)),
  });
  const unreadCount = unreadQuery.data?.count ?? 0;
  const page = Math.min(requestedPage, notificationsQuery.data?.totalPages ?? requestedPage);

  async function handlePress(id: string, seen: boolean, actionUrl: string | null) {
    setActionError(null);
    if (!seen) {
      try {
        await markSeen.mutateAsync(id);
      } catch {
        return;
      }
    }
    const route = mapNotificationActionUrl(actionUrl);
    if (route) router.push(route as Href);
  }

  return (
    <Screen>
      <Header
        title="Thông báo"
        canGoBack
        fallbackHref="/(tabs)/my-learning"
        right={<Text style={styles.unread} numberOfLines={1}>{unreadCount > 0 ? `${unreadCount} thông báo chưa xem` : "Không có thông báo chưa xem"}</Text>}
      />
      <SectionHeading
        eyebrow="Học tập"
        title="Thông báo"
        action={markAll.isPending ? "Đang cập nhật..." : "Đánh dấu tất cả đã xem"}
        onAction={() => { if (!markAll.isPending && unreadCount > 0) { setActionError(null); markAll.mutate(); } }}
      />
      {actionError ? <Alert tone="danger" title="Không thể cập nhật thông báo" message={actionError} /> : null}
      {notificationsQuery.isLoading ? (
        <>
          <Skeleton height={104} />
          <Skeleton height={104} />
          <Skeleton height={104} />
        </>
      ) : notificationsQuery.isError || !notificationsQuery.data ? (
        <ErrorState message="Không thể tải thông báo. Vui lòng thử lại sau." onRetry={() => void notificationsQuery.refetch()} />
      ) : notificationsQuery.data.items.length === 0 ? (
        <EmptyState icon="notifications-outline" title="Chưa có thông báo nào" message="Thông báo mới sẽ xuất hiện tại đây." />
      ) : (
        <>
          {notificationsQuery.data.items.map((item) => <NotificationCard key={item.id} item={item} onPress={() => void handlePress(item.id, item.seen, item.actionUrl)} />)}
          <PaginationRow page={page} totalPages={notificationsQuery.data.totalPages} total={notificationsQuery.data.total} onChange={setRequestedPage} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({ unread: { maxWidth: 140, color: colors.mutedForeground, fontSize: 12, textAlign: "right" } });
