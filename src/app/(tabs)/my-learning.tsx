import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { listMyEnrollments } from "../../api/services";
import { PaginationRow } from "../../components/catalog/pagination-row";
import { EmptyState, ErrorState, Header, LoadingState, Screen } from "../../components/ui";
import { StudyMyLearningCard } from "../../components/study/my-learning-card";
import { useLocalPagination } from "../../hooks/use-local-pagination";
import { colors, spacing } from "../../theme";

export default function MyLearning() {
  const enrollments = useQuery({ queryKey: ["myEnrollments"], queryFn: listMyEnrollments });
  const pagination = useLocalPagination(enrollments.data ?? []);
  return (
    <Screen>
      <Header canGoBack={false} />
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>Lộ trình học tập</Text>
        <Text style={styles.title}>Khóa học của tôi</Text>
        <Text style={styles.subtitle}>Tiếp tục từ bài học bạn đang theo đuổi.</Text>
      </View>
      {enrollments.isLoading ? <LoadingState /> : enrollments.isError ? <ErrorState message="Không tải được khóa học đã tham gia." onRetry={() => void enrollments.refetch()} /> : pagination.total ? (
        <>
          {pagination.visibleItems.map((enrollment) => <StudyMyLearningCard key={enrollment.id} enrollment={enrollment} onPress={() => router.push({ pathname: "/learn/[courseId]", params: { courseId: enrollment.courseId } })} />)}
          {pagination.totalPages > 1 ? <PaginationRow page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onChange={pagination.setPage} /> : null}
        </>
      ) : <EmptyState title="Chưa có khóa học" message="Các khóa học bạn tham gia sẽ xuất hiện tại đây." icon="school-outline" />}
    </Screen>
  );
}

const styles = StyleSheet.create({ intro: { gap: spacing.sm, paddingTop: spacing.sm }, eyebrow: { color: colors.primary, fontSize: 12, fontWeight: "800", letterSpacing: 1.3, textTransform: "uppercase" }, title: { color: colors.ink, fontSize: 28, lineHeight: 34, fontWeight: "800", letterSpacing: -0.5 }, subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21 } });
