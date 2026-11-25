import { StyleSheet, Text, View } from "react-native";
import type { LearnerDashboardActivity, LearnerDashboardCourse, LearnerDashboard } from "../../api/types";
import { Badge, Card, EmptyState, StatTile, StudyCourseCard, formatDate } from "../ui";
import { colors, spacing } from "../../theme";

export function StudyStatsGrid({ summary }: { summary: LearnerDashboard["summary"] }) {
  return (
    <View style={styles.stats}>
      <StatTile icon="book-outline" label="Khóa học của bạn" value={summary.enrolledCourseCount} />
      <StatTile icon="checkmark-circle-outline" label="Đã hoàn thành" value={summary.completedCourseCount} iconColor={colors.success} />
      <StatTile icon="analytics-outline" label="Tiến độ trung bình" value={`${Math.round(summary.averageProgressPercent)}%`} />
      <StatTile icon="trophy-outline" label="Điểm quiz TB" value={summary.averageQuizScorePercent === null ? "—" : `${Math.round(summary.averageQuizScorePercent)}%`} />
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
  if (!activities.length) return <Card style={styles.activityCard}><Text style={styles.emptyActivity}>Hoạt động học tập của bạn sẽ xuất hiện tại đây.</Text></Card>;
  return (
    <Card style={styles.activityCard}>
      {activities.slice(0, 5).map((activity, index) => (
        <View key={activity.id} style={styles.activityRow}>
          <View style={styles.timeline}>
            <View style={[styles.timelineDot, index === 0 && styles.timelineDotActive]} />
            {index < Math.min(activities.length, 5) - 1 ? <View style={styles.timelineLine} /> : null}
          </View>
          <View style={styles.activityCopy}>
            <View style={styles.activityHeading}>
              <Text style={styles.activityTitle}>{getActivityLabel(activity.eventType)}</Text>
              <Badge tone="muted">{formatDate(activity.occurredAt)}</Badge>
            </View>
            <Text style={styles.activityDescription}>{activity.lessonTitle ?? activity.courseTitle}</Text>
          </View>
        </View>
      ))}
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
  stats: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  list: { gap: spacing.md },
  activityCard: { gap: 0 },
  activityRow: { flexDirection: "row", gap: spacing.md, minHeight: 64 },
  timeline: { width: 16, alignItems: "center" },
  timelineDot: { width: 9, height: 9, borderRadius: 5, marginTop: 5, backgroundColor: "#B7B9D7" },
  timelineDotActive: { backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  timelineLine: { width: 1, flex: 1, marginTop: 5, backgroundColor: "#D8D8EE" },
  activityCopy: { flex: 1, gap: 4, paddingBottom: spacing.md },
  activityHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  activityTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  activityDescription: { color: colors.mutedForeground, fontSize: 13 },
  emptyActivity: { color: colors.mutedForeground, fontSize: 14, lineHeight: 20 },
});
