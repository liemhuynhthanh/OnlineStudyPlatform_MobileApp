import { Image, StyleSheet, Text, View } from "react-native";
import type { PublicCourse } from "../../api/types";
import { Badge, Card, formatVnd } from "../ui";
import { colors, spacing } from "../../theme";

export function PublicCourseCard({ course, onPress }: { course: PublicCourse; onPress: () => void }) {
  return (
    <Card onPress={onPress} style={styles.card}>
      {course.thumbnail ? <Image source={{ uri: course.thumbnail }} style={styles.image} /> : <View style={[styles.image, styles.placeholder]}><Text style={styles.placeholderText}>E</Text></View>}
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Badge>{course.category}</Badge>
          <Text style={styles.price}>{course.price === 0 ? "Miễn phí" : formatVnd(course.price)}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{course.title}</Text>
        <Text style={styles.description} numberOfLines={3}>{excerpt(course.description)}</Text>
        <Text style={styles.instructor} numberOfLines={1}>{course.instructor?.name ?? "Giảng viên đang cập nhật"}</Text>
      </View>
    </Card>
  );
}

function excerpt(text: string, maxLength = 140) {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength).trim()}...`;
}

const styles = StyleSheet.create({
  card: { gap: 0, padding: 0, overflow: "hidden" },
  image: { width: "100%", aspectRatio: 16 / 9, backgroundColor: colors.softBlue },
  placeholder: { alignItems: "center", justifyContent: "center" },
  placeholderText: { color: colors.primary, fontSize: 34, fontWeight: "800" },
  body: { gap: spacing.sm, padding: spacing.md },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  price: { color: colors.success, fontSize: 13, fontWeight: "800" },
  title: { color: colors.text, fontSize: 16, fontWeight: "800", lineHeight: 21 },
  description: { color: colors.mutedForeground, fontSize: 13, lineHeight: 19 },
  instructor: { color: colors.muted, fontSize: 12 },
});
