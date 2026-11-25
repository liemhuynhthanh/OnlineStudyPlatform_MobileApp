import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";
import type { Enrollment } from "../../api/types";
import { Badge, Card, ProgressBar, formatDate } from "../ui";
import { colors, radius, spacing } from "../../theme";

export function StudyMyLearningCard({ enrollment, onPress }: { enrollment: Enrollment; onPress: () => void }) {
  const progress = Math.min(Math.max(Number(enrollment.progress) || 0, 0), 100);
  const completed = Boolean(enrollment.completedAt) || progress >= 100;
  const course = enrollment.course;
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.top}>
        {course?.thumbnail ? <Image source={{ uri: course.thumbnail }} style={styles.thumbnail} /> : <View style={[styles.thumbnail, styles.placeholder]}><Ionicons name="book-outline" size={25} color={colors.primary} /></View>}
        <View style={styles.body}>
          <Badge tone={completed ? "green" : "indigo"}>{completed ? "Hoàn thành" : "Đang học"}</Badge>
          <Text style={styles.title} numberOfLines={2}>{course?.title ?? "Khóa học"}</Text>
          <Text style={styles.meta}>{[course?.category, course?.instructor?.name].filter(Boolean).join(" · ") || "Khóa học của bạn"}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <ProgressBar value={progress} />
        <Text style={styles.progress}>{Math.round(progress)}%</Text>
      </View>
      <Text style={styles.date}>Tham gia {formatDate(enrollment.enrolledAt)}{completed && enrollment.completedAt ? ` · Hoàn thành ${formatDate(enrollment.completedAt)}` : ""}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  top: { flexDirection: "row", gap: spacing.md },
  thumbnail: { width: 68, height: 68, borderRadius: radius.sm, backgroundColor: colors.softBlue },
  placeholder: { alignItems: "center", justifyContent: "center" },
  body: { flex: 1, gap: 5 },
  title: { color: colors.text, fontSize: 16, fontWeight: "800", lineHeight: 21 },
  meta: { color: colors.mutedForeground, fontSize: 12 },
  footer: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  progress: { color: colors.mutedForeground, fontSize: 12, fontWeight: "700", width: 42, textAlign: "right" },
  date: { color: colors.mutedForeground, fontSize: 11 },
});
