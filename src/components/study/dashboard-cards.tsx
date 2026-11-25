import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { LearnerDashboardActivity, LearnerDashboardCourse, LearnerDashboard } from "../../api/types";
import { PaginationRow } from "../catalog/pagination-row";
import { Badge, Card, EmptyState, StudyCourseCard, formatDate } from "../ui";
import { useLocalPagination } from "../../hooks/use-local-pagination";
import { colors, radius, spacing } from "../../theme";

type StatStripItem = {
  label: string;
  accessibilityLabel: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  softColor: string;
};

export function StudyStatsGrid({ summary }: { summary: LearnerDashboard["summary"] }) {
  const stats: StatStripItem[] = [
    { label: "Khóa học", accessibilityLabel: "Khóa học của bạn", value: summary.enrolledCourseCount, icon: "book-outline", iconColor: colors.primary, softColor: colors.softIndigo },
    { label: "Hoàn thành", accessibilityLabel: "Khóa học đã hoàn thành", value: summary.completedCourseCount, icon: "checkmark-circle-outline", iconColor: colors.success, softColor: colors.successSoft },
    { label: "Tiến độ", accessibilityLabel: "Tiến độ trung bình", value: `${Math.round(summary.averageProgressPercent)}%`, icon: "analytics-outline", iconColor: colors.primary, softColor: colors.softIndigo },
    { label: "Quiz TB", accessibilityLabel: "Điểm quiz trung bình", value: summary.averageQuizScorePercent === null ? "—" : `${Math.round(summary.averageQuizScorePercent)}%`, icon: "trophy-outline", iconColor: colors.primary, softColor: colors.softIndigo },
  ];

  return (
    <View style={styles.stats}>
      {stats.map((stat) => (
        <View key={stat.label} accessible accessibilityLabel={`${stat.accessibilityLabel}: ${stat.value}`} style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: stat.softColor }]}>
            <Ionicons name={stat.icon} size={17} color={stat.iconColor} />
          </View>
          <Text style={styles.statValue} numberOfLines={1}>{stat.value}</Text>
          <Text style={styles.statLabel} numberOfLines={1}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

export function StudyCourseList({ courses, onPressCourse }: { courses: LearnerDashboardCourse[]; onPressCourse: (course: LearnerDashboardCourse) => void }) {
  if (!courses.length) return <EmptyState title="Chưa có khóa học" message="Các khóa học bạn tham gia sẽ xuất hiện tại đây." icon="school-outline" />;
  return (
    <View style={styles.list}>
      {courses.map((course) => (
        <StudyCourseCard
          key={course.enrollmentId}
          title={course.title}
          category={course.category}
          thumbnail={course.thumbnail}
          progressPercent={course.progressPercent}
          status={course.status}
          instructorName={course.instructorName}
          bestQuizScorePercent={course.bestQuizScorePercent}
          onPress={() => onPressCourse(course)}
        />
      ))}
    </View>
  );
}

export function ActivityTimeline({ activities }: { activities: LearnerDashboardActivity[] }) {
  const pagination = useLocalPagination(activities);
  if (!pagination.total) return <Card style={styles.activityCard}><Text style={styles.emptyActivity}>Hoạt động học tập của bạn sẽ xuất hiện tại đây.</Text></Card>;
  return (
    <Card style={styles.activityCard}>
      {pagination.visibleItems.map((activity, index) => (
        <View key={activity.id} style={styles.activityRow}>
          <View style={styles.timeline}>
            <View style={[styles.timelineDot, index === 0 && styles.timelineDotActive]} />
            {index < pagination.visibleItems.length - 1 ? <View style={styles.timelineLine} /> : null}
          </View>
          <View style={styles.activityCopy}>
            <View style={styles.activityHeading}>
              <Text style={styles.activityTitle} numberOfLines={2}>{getActivityLabel(activity.eventType)}</Text>
              <Badge tone="muted">{formatDate(activity.occurredAt)}</Badge>
            </View>
            <Text style={styles.activityDescription} numberOfLines={2}>{activity.lessonTitle ?? activity.courseTitle}</Text>
          </View>
        </View>
      ))}
      {pagination.totalPages > 1 ? <PaginationRow page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onChange={pagination.setPage} /> : null}
    </Card>
  );
}

function getActivityLabel(eventType: string) {
  if (eventType === "opened") return "Mở bài học";
  if (eventType === "heartbeat") return "Đang học";
  if (eventType === "paused") return "Tạm dừng";
  if (eventType === "completed") return "Hoàn thành";
  return "Hoạt động học tập";
}

const styles = StyleSheet.create({
  stats: { flexDirection: "row", gap: spacing.xs }, statItem: { flex: 1, minWidth: 0, alignItems: "center", gap: 4, paddingVertical: spacing.sm, paddingHorizontal: 2, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }, statIcon: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" }, statValue: { color: colors.text, fontSize: 17, lineHeight: 20, fontWeight: "800" }, statLabel: { color: colors.mutedForeground, fontSize: 10, lineHeight: 13, fontWeight: "600" },
  list: { gap: spacing.md },
  activityCard: { gap: 0 },
  activityRow: { flexDirection: "row", gap: spacing.md, minHeight: 64 },
  timeline: { width: 16, alignItems: "center" },
  timelineDot: { width: 9, height: 9, borderRadius: 5, marginTop: 5, backgroundColor: "#B7B9D7" },
  timelineDotActive: { backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  timelineLine: { width: 1, flex: 1, marginTop: 5, backgroundColor: "#D8D8EE" },
  activityCopy: { flex: 1, minWidth: 0, gap: 4, paddingBottom: spacing.md },
  activityHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  activityTitle: { flexShrink: 1, color: colors.text, fontSize: 14, lineHeight: 19, fontWeight: "800" },
  activityDescription: { color: colors.mutedForeground, fontSize: 13, lineHeight: 18 },
  emptyActivity: { color: colors.mutedForeground, fontSize: 14, lineHeight: 20 },
});
