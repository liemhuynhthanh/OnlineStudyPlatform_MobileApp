import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Alert as NativeAlert, Image, StyleSheet, Text, View } from "react-native";
import { getApiErrorMessage } from "../../api/client";
import { addToCart, enrollCourse, getPublicCourse, listLatestCourses, listSuggestedCourses } from "../../api/services";
import { PublicCourseCard } from "../catalog/public-course-card";
import { Alert, Badge, Button, Card, Header, Screen, SectionHeading, Skeleton, formatDate, formatVnd } from "../ui";
import { useAuth } from "../../context/auth-context";
import { colors, radius, spacing } from "../../theme";

export function CourseDetailContent({ courseId }: { courseId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [paymentRequired, setPaymentRequired] = useState(false);
  const courseQuery = useQuery({ queryKey: ["courseDetail", courseId], queryFn: () => getPublicCourse(courseId), enabled: Boolean(courseId) });
  const suggestionsQuery = useQuery({ queryKey: ["courseSuggestions", 8], queryFn: () => listSuggestedCourses(8) });
  const latestQuery = useQuery({ queryKey: ["latestCourses", 8], queryFn: () => listLatestCourses(8) });
  const enroll = useMutation({
    mutationFn: () => enrollCourse(courseId),
    onSuccess: async (enrollment) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["courseDetail", courseId] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["myEnrollments"] }),
        queryClient.invalidateQueries({ queryKey: ["publicCourses"] }),
        queryClient.invalidateQueries({ queryKey: ["recommendations"] }),
      ]);
      const firstLessonId = [...(courseQuery.data?.lessons ?? [])].sort((a, b) => a.position - b.position)[0]?.id;
      router.push({ pathname: "/learn/[courseId]", params: { courseId: enrollment.courseId, ...(firstLessonId ? { lessonId: firstLessonId } : {}) } });
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 402) {
        setPaymentRequired(true);
        return;
      }
      NativeAlert.alert("Không thể đăng ký", getApiErrorMessage(error));
    },
  });
  const addCart = useMutation({
    mutationFn: () => addToCart(courseId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      NativeAlert.alert("Đã thêm vào giỏ hàng", "Bạn có thể mở giỏ hàng trong ứng dụng để hoàn tất thanh toán.", [
        { text: "Ở lại trang này" },
        { text: "Xem giỏ hàng", onPress: () => router.push("/cart") },
      ]);
    },
    onError: (error) => NativeAlert.alert("Không thể thêm vào giỏ hàng", getApiErrorMessage(error)),
  });

  if (courseQuery.isLoading) return <Screen><Header title="Chi tiết khóa học" canGoBack /><Skeleton height={220} /><Skeleton height={70} /><Skeleton height={120} /></Screen>;
  if (courseQuery.isError || !courseQuery.data) {
    const notFound = isAxiosError(courseQuery.error) && courseQuery.error.response?.status === 404;
    return <Screen><Header title="Chi tiết khóa học" canGoBack /><Card style={styles.notFound}><Text style={styles.notFoundTitle}>{notFound ? "Không tìm thấy khóa học" : "Không tải được khóa học"}</Text><Text style={styles.notFoundBody}>{notFound ? "Khóa học không tồn tại hoặc chưa được xuất bản." : "Không thể kết nối. Vui lòng thử lại."}</Text><Button title="Quay lại danh sách khóa học" onPress={() => router.replace("/(tabs)/courses")} /></Card></Screen>;
  }

  const course = courseQuery.data;
  const lessons = [...(course.lessons ?? [])].sort((a, b) => a.position - b.position);
  const isLearner = user?.role === "Learner";
  const isPaid = course.price > 0;
  const suggestions = (suggestionsQuery.data ?? []).filter((item) => item.id !== course.id).slice(0, 4);
  const latestCourses = (latestQuery.data ?? []).filter((item) => item.id !== course.id).slice(0, 4);
  const pending = enroll.isPending || addCart.isPending;

  return (
    <Screen>
      <Header title="Chi tiết khóa học" canGoBack />
      {course.thumbnail ? <Image source={{ uri: course.thumbnail }} style={styles.hero} /> : <View style={[styles.hero, styles.heroPlaceholder]}><Text style={styles.placeholderText}>E</Text></View>}
      <View style={styles.headerCopy}>
        <Badge>{course.category}</Badge>
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.meta}>{course.instructor?.name ?? "Giảng viên đang cập nhật"}</Text>
        <Text style={styles.meta}>Cập nhật {formatDate(course.updatedAt)}</Text>
      </View>
      <Card style={styles.cta}>
        <View style={styles.ctaTop}>
          <Text style={styles.ctaTitle}>Sẵn sàng bắt đầu?</Text>
          <Text style={styles.price}>{course.price === 0 ? "Miễn phí" : formatVnd(course.price)}</Text>
        </View>
        <Text style={styles.ctaBody}>{isPaid ? "Khóa học trả phí. Bạn phải hoàn tất thanh toán trước khi truy cập nội dung." : "Ghi danh để lưu khóa học vào lộ trình học tập và theo dõi tiến độ của bạn."}</Text>
        <View style={styles.actions}>
          {!user ? (
            <>
              <Button title="Tạo tài khoản" onPress={() => router.push("/sign-up")} />
              <Button title="Đăng nhập" variant="secondary" onPress={() => router.push("/sign-in")} />
            </>
          ) : null}
          {user && course.isEnrolled ? <Button title="Tiếp tục học" onPress={() => router.push({ pathname: "/learn/[courseId]", params: { courseId: course.id, ...(lessons[0] ? { lessonId: lessons[0].id } : {}) } })} /> : null}
          {user && !course.isEnrolled && paymentRequired ? <Alert tone="warning" title="Khóa học trả phí" message={`${formatVnd(course.price)}. Vui lòng hoàn tất thanh toán để mở khóa nội dung. Liên hệ quản trị viên nếu bạn cần hỗ trợ.`} /> : null}
          {user && !course.isEnrolled && !paymentRequired && !isLearner ? <Alert tone="info" title="Chỉ tài khoản học viên" message="Chỉ tài khoản học viên mới có thể đăng ký khóa học này." /> : null}
          {isLearner && !course.isEnrolled && !paymentRequired && isPaid ? <Button title={addCart.isPending ? "Đang thêm vào giỏ hàng..." : "Thêm vào giỏ hàng"} loading={addCart.isPending} disabled={pending} onPress={() => { if (!pending) addCart.mutate(); }} /> : null}
          {isLearner && !course.isEnrolled && !paymentRequired && !isPaid ? <Button title={enroll.isPending ? "Đang đăng ký..." : "Đăng ký khóa học"} loading={enroll.isPending} disabled={pending} onPress={() => { if (!pending) enroll.mutate(); }} /> : null}
        </View>
      </Card>
      <SectionHeading title="Mô tả khóa học" />
      <Text style={styles.description}>{course.description}</Text>
      <SectionHeading title="Danh sách bài học" />
      {lessons.length ? (
        <Card style={styles.lessonCard}>
          {lessons.map((lesson, index) => (
            <View key={lesson.id} style={styles.lessonRow}>
              <View style={styles.lessonNumber}><Text style={styles.lessonNumberText}>{String(index + 1).padStart(2, "0")}</Text></View>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
            </View>
          ))}
        </Card>
      ) : <Text style={styles.description}>Danh sách bài học sẽ được cập nhật sau.</Text>}
      <SectionHeading eyebrow="Gợi ý dành cho bạn" title="Có thể bạn cũng quan tâm" />
      <Text style={styles.sectionHint}>Những khóa học được chọn theo hành trình học tập của bạn.</Text>
      {suggestionsQuery.isLoading ? <Skeleton height={150} /> : suggestions.length ? <View style={styles.list}>{suggestions.map((item) => <PublicCourseCard key={item.id} course={item} onPress={() => router.push({ pathname: "/course/[courseId]", params: { courseId: item.id } })} />)}</View> : <Text style={styles.sectionHint}>Chưa có gợi ý phù hợp lúc này.</Text>}
      <SectionHeading eyebrow="Khóa học mới nhất" title="Khám phá thêm" />
      <Text style={styles.sectionHint}>Những khóa học vừa được cập nhật.</Text>
      {latestQuery.isLoading ? <Skeleton height={150} /> : latestCourses.length ? <View style={styles.list}>{latestCourses.map((item) => <PublicCourseCard key={item.id} course={item} onPress={() => router.push({ pathname: "/course/[courseId]", params: { courseId: item.id } })} />)}</View> : <Text style={styles.sectionHint}>Chưa có khóa học mới nhất.</Text>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { width: "100%", aspectRatio: 16 / 9, borderRadius: radius.lg, backgroundColor: colors.softBlue },
  heroPlaceholder: { alignItems: "center", justifyContent: "center" },
  placeholderText: { color: colors.primary, fontSize: 42, fontWeight: "800" },
  headerCopy: { gap: spacing.sm },
  title: { color: colors.ink, fontSize: 27, lineHeight: 33, fontWeight: "800", letterSpacing: -0.4 },
  meta: { color: colors.mutedForeground, fontSize: 13 },
  cta: { gap: spacing.md },
  ctaTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  ctaTitle: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  price: { color: colors.success, fontSize: 18, fontWeight: "800" },
  ctaBody: { color: colors.mutedForeground, fontSize: 14, lineHeight: 21 },
  actions: { gap: spacing.sm },
  description: { color: colors.mutedForeground, fontSize: 14, lineHeight: 22 },
  lessonCard: { gap: spacing.sm },
  lessonRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  lessonNumber: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: colors.softIndigo },
  lessonNumberText: { color: colors.primary, fontSize: 12, fontWeight: "800" },
  lessonTitle: { flex: 1, color: colors.text, fontSize: 14, fontWeight: "600" },
  list: { gap: spacing.md },
  sectionHint: { color: colors.mutedForeground, fontSize: 13, lineHeight: 19 },
  notFound: { alignItems: "center", gap: spacing.md, paddingVertical: spacing.xl },
  notFoundTitle: { color: colors.ink, fontSize: 22, fontWeight: "800", textAlign: "center" },
  notFoundBody: { color: colors.mutedForeground, fontSize: 14, textAlign: "center" },
});
