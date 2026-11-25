import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Alert as NativeAlert, Pressable, StyleSheet, Text, View } from "react-native";
import { getUnreadNotificationCount, listLatestCourses, getDashboard } from "../../api/services";
import { PublicCourseCard } from "../../components/catalog/public-course-card";
import { LearnerShortcuts } from "../../components/learner/learner-shortcuts";
import { ActivityTimeline, StudyCourseList, StudyStatsGrid } from "../../components/study/dashboard-cards";
import { Alert, Button, EmptyState, ErrorState, Header, LoadingState, Screen, SectionHeading, Skeleton } from "../../components/ui";
import { useAuth } from "../../context/auth-context";
import { colors, radius, spacing } from "../../theme";

export default function LandingOrDashboard() {
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard, enabled: Boolean(user) });
  const unread = useQuery({ queryKey: ["notifications", "unread-count"], queryFn: getUnreadNotificationCount, enabled: Boolean(user) });
  const latest = useQuery({ queryKey: ["latestCourses", 8], queryFn: () => listLatestCourses(8), enabled: !user });

  function confirmSignOut() {
    NativeAlert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất khỏi ứng dụng?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", style: "destructive", onPress: () => void handleSignOut() },
    ]);
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  }

  if (!user) {
    return (
      <Screen>
        <Header title="E-Learning Learner" />
        <View style={styles.hero}>
          <View style={styles.heroIcon}><Ionicons name="sparkles-outline" size={28} color={colors.primary} /></View>
          <Text style={styles.heroEyebrow}>Học tập E-Learning</Text>
          <Text style={styles.heroTitle}>Học mọi lúc, tiến bộ mỗi ngày</Text>
          <Text style={styles.heroBody}>Khám phá khóa học, theo dõi tiến độ và luyện tập ngay trên thiết bị của bạn.</Text>
          <View style={styles.heroActions}>
            <Button title="Đăng nhập" onPress={() => router.push("/sign-in")} />
            <Button title="Tạo tài khoản" variant="secondary" onPress={() => router.push("/sign-up")} />
          </View>
        </View>
        <Alert title="Gợi ý dành cho bạn" message="Đăng nhập để xem các khóa học được gợi ý theo lộ trình của bạn." actionLabel="Đăng nhập" onAction={() => router.push("/sign-in")} />
        <SectionHeading eyebrow="Khóa học" title="Khóa học mới nhất" action="Xem tất cả" onAction={() => router.push("/(tabs)/courses")} />
        {latest.isLoading ? <View style={styles.list}><Skeleton height={92} /><Skeleton height={92} /><Skeleton height={92} /></View> : latest.isError ? <ErrorState message="Không tải được khóa học mới nhất." onRetry={() => void latest.refetch()} /> : latest.data?.length ? <View style={styles.list}>{latest.data.map((course) => <PublicCourseCard key={course.id} course={course} onPress={() => router.push({ pathname: "/course/[courseId]", params: { courseId: course.id } })} />)}</View> : <EmptyState title="Chưa có khóa học" message="Các khóa học mới nhất sẽ xuất hiện tại đây." icon="school-outline" />}
      </Screen>
    );
  }

  if (dashboard.isLoading) return <Screen scroll={false}><LoadingState /></Screen>;
  if (dashboard.isError || !dashboard.data) return <Screen scroll={false}><ErrorState message="Không tải được bảng điều khiển." onRetry={() => void dashboard.refetch()} /></Screen>;

  const data = dashboard.data;
  return (
    <Screen>
      <Header right={<View style={styles.headerActions}><Pressable accessibilityRole="button" accessibilityLabel="Thông báo" hitSlop={8} onPress={() => router.push("/notifications")} style={styles.iconButton}>{(unread.data?.count ?? 0) > 0 ? <View style={styles.unreadDot} /> : null}<Ionicons name="notifications-outline" size={21} color={colors.primary} /></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Đăng xuất" disabled={signingOut} hitSlop={8} onPress={confirmSignOut} style={styles.iconButton}><Ionicons name="log-out-outline" size={21} color={colors.danger} /></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Hồ sơ" hitSlop={8} onPress={() => router.push("/(tabs)/profile")} style={styles.iconButton}><Ionicons name="person-circle-outline" size={21} color={colors.primary} /></Pressable></View>} />
      <StudyStatsGrid summary={data.summary} />
      <SectionHeading eyebrow="Tiện ích" title="Dịch vụ học tập" />
      <LearnerShortcuts />
      <SectionHeading eyebrow="Lộ trình" title="Khóa học của bạn" action="Tất cả" onAction={() => router.push("/(tabs)/my-learning")} />
      <StudyCourseList courses={data.courses} onPressCourse={(course) => router.push({ pathname: "/learn/[courseId]", params: { courseId: course.courseId, ...(course.continueLearning.lessonId ? { lessonId: course.continueLearning.lessonId } : {}) } })} />
      <SectionHeading eyebrow="Nhịp học tập" title="Hoạt động gần đây" />
      <ActivityTimeline activities={data.recentActivities} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing.sm, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.navy },
  heroIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: radius.md, backgroundColor: colors.softIndigo },
  heroEyebrow: { color: colors.cyan, fontSize: 12, fontWeight: "800", letterSpacing: 1.3, textTransform: "uppercase" },
  heroTitle: { color: colors.white, fontSize: 27, lineHeight: 33, fontWeight: "800", letterSpacing: -0.5 },
  heroBody: { color: "#DADCF5", fontSize: 14, lineHeight: 21 },
  heroActions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm },
  list: { gap: spacing.sm },
  headerActions: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  iconButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: colors.surface },
  unreadDot: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
});
