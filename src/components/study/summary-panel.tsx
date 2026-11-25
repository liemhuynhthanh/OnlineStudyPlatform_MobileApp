import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { AiSummary } from "../../api/types";
import { Alert } from "../ui";
import { colors, radius, spacing } from "../../theme";

export function SummaryPanel({ summary, isLoading, onRetry }: { summary?: AiSummary; isLoading?: boolean; onRetry?: () => void }) {
  if (isLoading) return <View style={styles.state}><ActivityIndicator color={colors.primary} /><Text style={styles.stateText}>Đang chuẩn bị tóm tắt...</Text></View>;
  if (!summary) return <Alert title="Chưa có tóm tắt" message="Tóm tắt AI sẽ xuất hiện khi hệ thống xử lý xong bài học." />;
  if (summary.status === "pending" || summary.status === "processing") return <View style={styles.state}><ActivityIndicator color={colors.primary} /><Text style={styles.stateText}>AI đang phân tích nội dung bài học...</Text></View>;
  if (summary.status === "failed") return <Alert tone="danger" title="Tóm tắt không khả dụng" message="Hệ thống chưa tạo được tóm tắt cho bài học này." actionLabel={onRetry ? "Thử lại" : undefined} onAction={onRetry} />;
  if (!summary.summaryText) return <Alert title="Chưa có nội dung tóm tắt" />;
  return (
    <View style={styles.markdown}>
      {summary.summaryText.split("\n").filter((line) => line.trim()).map((line, index) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("## ")) return <Text key={index} style={styles.heading}>{trimmed.slice(3)}</Text>;
        if (trimmed.startsWith("- ")) return <View key={index} style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.paragraph}>{trimmed.slice(2)}</Text></View>;
        return <Text key={index} style={styles.paragraph}>{trimmed}</Text>;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  state: { minHeight: 140, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  stateText: { color: colors.mutedForeground, fontSize: 14 },
  markdown: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  heading: { color: colors.text, fontSize: 17, fontWeight: "800", marginTop: spacing.sm },
  paragraph: { color: colors.mutedForeground, fontSize: 14, lineHeight: 21, flex: 1 },
  bulletRow: { flexDirection: "row", gap: spacing.sm },
  bullet: { color: colors.primary, fontSize: 16, lineHeight: 21 },
});
