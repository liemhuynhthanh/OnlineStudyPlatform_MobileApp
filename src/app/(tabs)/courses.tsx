import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { listPublicCourses, listRecommendations } from "../../api/services";
import { CatalogFilters, formatCourseCategory } from "../../components/catalog/catalog-filters";
import { PaginationRow } from "../../components/catalog/pagination-row";
import { PublicCourseCard } from "../../components/catalog/public-course-card";
import { Alert, Button, EmptyState, Header, Screen, SectionHeading, Skeleton } from "../../components/ui";
import { useAuth } from "../../context/auth-context";
import { colors, radius, spacing } from "../../theme";

const CATALOG_LIMIT = 24;

export default function Catalog() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("");
  const [requestedPage, setRequestedPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  const filters = { page: requestedPage, limit: CATALOG_LIMIT, q: debouncedQuery || undefined, category: category || undefined };
  const courses = useQuery({ queryKey: ["publicCourses", filters], queryFn: () => listPublicCourses(filters) });
  const page = Math.min(requestedPage, courses.data?.totalPages ?? requestedPage);
  const hasFilters = Boolean(query || category);
  const isEmpty = !courses.isLoading && !courses.isError && courses.data?.total === 0;
  const recommendations = useQuery({ queryKey: ["recommendations", 8], queryFn: () => listRecommendations(8), enabled: Boolean(user) && isEmpty && hasFilters });

  function clearFilters() {
    setQuery("");
    setDebouncedQuery("");
    setCategory("");
    setRequestedPage(1);
  }

  const resultTitle = query ? `Kết quả cho “${query}”` : category ? formatCourseCategory(category) : "Tất cả khóa học";
  const resultCount = courses.isLoading ? "Đang tìm khóa học…" : courses.isError ? "Không tải được kết quả" : `${(courses.data?.total ?? 0).toLocaleString("vi-VN")} kết quả`;

  return (
    <Screen>
      <Header title="Khám phá" />
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Thư viện học tập</Text>
        <Text style={styles.heroTitle}>Tìm điều bạn muốn biết sâu hơn.</Text>
        <Text style={styles.heroBody}>Chọn một chủ đề, khám phá khóa học và bắt đầu xây dựng kỹ năng theo nhịp riêng.</Text>
      </View>
      <CatalogFilters query={query} category={category} onQueryChange={(value) => { setQuery(value); setRequestedPage(1); }} onCategoryChange={(value) => { setCategory(value); setRequestedPage(1); }} onClear={clearFilters} />
      <View style={styles.resultsHeading}>
        <View style={styles.resultsCopy}>
          <Text style={styles.eyebrow}>Khám phá</Text>
          <Text style={styles.resultsTitle}>{resultTitle}</Text>
        </View>
        <Text style={styles.resultCount}>{resultCount}</Text>
      </View>
      {courses.isError ? <Alert tone="danger" title="Không thể tải danh sách khóa học" message="Vui lòng thử lại." actionLabel="Thử lại" onAction={() => void courses.refetch()} /> : null}
      {courses.isLoading ? (
        <View style={styles.list}><Skeleton height={150} /><Skeleton height={150} /><Skeleton height={150} /><Skeleton height={150} /></View>
      ) : isEmpty ? (
        <>
          <EmptyState title="Chưa tìm thấy khóa học phù hợp" message="Thử một từ khóa khác hoặc xóa bộ lọc để xem thêm lựa chọn." icon="search-outline" actionLabel={hasFilters ? "Xóa bộ lọc" : undefined} onAction={clearFilters} />
          {hasFilters && user ? (
            <View style={styles.recommendations}>
              <SectionHeading eyebrow="Dành cho bạn" title="Có thể bạn cũng quan tâm" />
              <Text style={styles.recommendationHint}>Gợi ý dựa trên hồ sơ và sở thích học tập của bạn.</Text>
              {recommendations.isLoading ? <Skeleton height={150} /> : recommendations.data?.length ? <View style={styles.list}>{recommendations.data.map((course) => <PublicCourseCard key={course.id} course={course} onPress={() => router.push({ pathname: "/course/[courseId]", params: { courseId: course.id } })} />)}</View> : <Text style={styles.recommendationHint}>Chưa có gợi ý phù hợp lúc này. Hãy thử xóa bộ lọc để khám phá toàn bộ khóa học.</Text>}
            </View>
          ) : null}
        </>
      ) : (
        <>
          <View style={styles.list}>{courses.data?.items.map((course) => <PublicCourseCard key={course.id} course={course} onPress={() => router.push({ pathname: "/course/[courseId]", params: { courseId: course.id } })} />)}</View>
          <PaginationRow page={page} totalPages={courses.data?.totalPages ?? 1} total={courses.data?.total ?? 0} onChange={setRequestedPage} />
        </>
      )}
      {courses.isError && !courses.data ? <View style={styles.errorFallback}><Button title="Thử lại" variant="secondary" onPress={() => void courses.refetch()} /></View> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing.sm, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.navy },
  eyebrow: { color: colors.cyan, fontSize: 12, fontWeight: "800", letterSpacing: 1.4, textTransform: "uppercase" },
  heroTitle: { color: colors.white, fontSize: 27, lineHeight: 33, fontWeight: "800", letterSpacing: -0.5 },
  heroBody: { color: "#DADCF5", fontSize: 14, lineHeight: 21 },
  resultsHeading: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: spacing.md, paddingTop: spacing.sm },
  resultsCopy: { flex: 1, gap: 5 },
  resultsTitle: { color: colors.ink, fontSize: 22, fontWeight: "800" },
  resultCount: { color: colors.muted, fontSize: 13 },
  list: { gap: spacing.md },
  recommendations: { gap: spacing.sm, marginTop: spacing.md },
  recommendationHint: { color: colors.mutedForeground, fontSize: 13, lineHeight: 19 },
  errorFallback: { alignItems: "center" },
});
